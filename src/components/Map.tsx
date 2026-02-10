'use client';

import type { DivIcon } from 'leaflet';
import type { FeatureLayer } from 'esri-leaflet';
import type { GeoJsonObject } from 'geojson';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Earthquake, DataSource } from '@/types/earthquake';
import { useMap } from 'react-leaflet';
import { formatDateTh } from '@/lib/formatters';
import { isRecord, isFeature } from '@/lib/typeGuards';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Rectangle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Rectangle),
  { ssr: false }
);

const GeoJSONLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

const Pane = dynamic(
  () => import('react-leaflet').then((mod) => mod.Pane),
  { ssr: false }
);

// Component to update map view without re-mounting
function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [map, center, zoom]);

  return null;
}

function PlateBoundariesLayer() {
  const map = useMap();

  useEffect(() => {
    let layer: FeatureLayer | null = null;
    let isCancelled = false;

    const addLayer = async () => {
      try {
        const esri = await import('esri-leaflet');
        if (isCancelled) return;

        layer = esri.featureLayer({
          url: 'https://services.arcgis.com/ue9rwulIoeLEI9bj/arcgis/rest/services/Tectonic_Plate_Boundaries/FeatureServer/0',
          style: () => ({
            color: '#dc2626',
            weight: 2,
            opacity: 0.8,
            dashArray: '6 6',
          }),
        }).addTo(map);
      } catch (error) {
        console.error('Failed to load plate boundaries layer:', error);
      }
    };

    addLayer();

    return () => {
      isCancelled = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map]);

  return null;
}

// Asia bounding box for USGS query
const ASIA_BOUNDS: [[number, number], [number, number]] = [
  [1, 26],
  [77, 170],
];

interface MapProps {
  earthquakes: Earthquake[];
  center: [number, number];
  zoom: number;
  selectedSource: DataSource;
  selectedEarthquakeId?: string | null;
  onSelect?: (earthquake: Earthquake) => void;
}

export default function EarthquakeMap({
  earthquakes,
  center,
  zoom,
  selectedSource,
  selectedEarthquakeId = null,
  onSelect,
}: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [leaflet, setLeaflet] = useState<typeof import('leaflet') | null>(null);
  const [asiaGeoJson, setAsiaGeoJson] = useState<GeoJsonObject | null>(null);
  const [isAsiaLayerLoading, setIsAsiaLayerLoading] = useState(false);

  const shouldShowAsiaBoundary = selectedSource === 'usgs-asia';

  useEffect(() => {
    if (!shouldShowAsiaBoundary) return;
    if (asiaGeoJson || isAsiaLayerLoading) return;

    let isCancelled = false;
    const controller = new AbortController();

    const loadAsiaLayer = async () => {
      try {
        setIsAsiaLayerLoading(true);
        const response = await fetch('/api/asia-geojson', { signal: controller.signal });
        const payload = (await response.json()) as unknown;
        if (isCancelled) return;
        if (!isRecord(payload) || payload.type !== 'FeatureCollection' || !Array.isArray(payload.features)) {
          return;
        }
        const validFeatures = payload.features.filter(isFeature);
        setAsiaGeoJson({ type: 'FeatureCollection', features: validFeatures } as GeoJsonObject);
      } catch (error) {
        if ((error as { name?: string }).name === 'AbortError') return;
        console.error('Failed to load Asia boundary:', error);
      } finally {
        if (!isCancelled) setIsAsiaLayerLoading(false);
      }
    };

    loadAsiaLayer();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [shouldShowAsiaBoundary, asiaGeoJson, isAsiaLayerLoading]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      import('leaflet').then((leafletModule) => {
        const L = leafletModule as typeof import('leaflet');
        setLeaflet(L);
        const defaultIconPrototype = L.Icon.Default.prototype as { _getIconUrl?: () => string };
        delete defaultIconPrototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
  }, []);

  const getMarkerColor = (magnitude: number) => {
    if (magnitude >= 5.0) return '#ef4444';
    if (magnitude >= 3.0) return '#eab308';
    return '#22c55e';
  };

  const markerIconCache = useMemo(() => new Map<string, DivIcon>(), []);

  const getMarkerIcon = (magnitude: number, isSelected: boolean) => {
    if (!leaflet) return undefined;
    const size = Math.round(10 + magnitude * 4 + (isSelected ? 4 : 0));
    const key = `${magnitude}-${size}-${isSelected ? 's' : 'd'}`;
    const cached = markerIconCache.get(key);
    if (cached) return cached;

    const ringColor = isSelected ? '#2563eb' : '#ffffff';
    const shadow = isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.35)' : 'none';
    const icon = leaflet.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:${getMarkerColor(magnitude)};border:2px solid ${ringColor};border-radius:50%;opacity:0.9;box-shadow:${shadow};"></div>`,
      className: 'eq-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });

    markerIconCache.set(key, icon);
    return icon;
  };

  if (!mounted || !leaflet) {
    return (
      <div className="w-full h-full min-h-[400px] bg-gray-200 flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลดแผนที่...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[70vh] min-h-[500px]">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <MapViewUpdater center={center} zoom={zoom} />

        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.esri.com/">Esri</a>'
        />

        {/* Asia boundary overlay — visible & prominent when Asia source is selected */}
        {shouldShowAsiaBoundary && asiaGeoJson && (
          <Pane name="asia-boundary" style={{ zIndex: 350 }}>
            <GeoJSONLayer
              data={asiaGeoJson}
              style={{
                color: '#7c3aed',
                weight: 2.5,
                fillColor: '#8b5cf6',
                fillOpacity: 0.12,
                fillRule: 'evenodd',
                dashArray: undefined,
              }}
              pane="asia-boundary"
              interactive={false}
            />
          </Pane>
        )}

        {/* Dashed bounding box for the USGS Asia query region */}
        {shouldShowAsiaBoundary && (
          <Rectangle
            bounds={ASIA_BOUNDS}
            pathOptions={{
              color: '#7c3aed',
              weight: 2,
              fillColor: 'transparent',
              fillOpacity: 0,
              dashArray: '8 6',
            }}
          />
        )}

        {/* World bounding box */}
        {selectedSource === 'usgs-world' && (
          <Rectangle
            bounds={[[-85, -180], [85, 180]]}
            pathOptions={{ color: '#2563eb', weight: 2, fillColor: '#2563eb', fillOpacity: 0.05 }}
          />
        )}

        <PlateBoundariesLayer />

        {earthquakes.map((earthquake) => (
          <Marker
            key={earthquake.id}
            position={[earthquake.lat, earthquake.lng]}
            icon={getMarkerIcon(earthquake.magnitude, earthquake.id === selectedEarthquakeId)}
            eventHandlers={{
              click: () => onSelect?.(earthquake),
            }}
          >
            <Popup>
              <div className="text-sm p-2 text-slate-900">
                <h3 className="font-bold text-lg mb-2">📍 {earthquake.place}</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">ขนาด:</span>{' '}
                    <span className={`font-bold ${earthquake.magnitude >= 5.0 ? 'text-red-600' :
                        earthquake.magnitude >= 3.0 ? 'text-yellow-600' :
                          'text-green-600'
                      }`}>
                      {earthquake.magnitude.toFixed(1)}
                    </span>
                  </p>
                  <p><span className="font-semibold">ความลึก:</span> {earthquake.depth.toFixed(1)} กม.</p>
                  <p><span className="font-semibold">วันที่:</span> {formatDateTh(earthquake.time)}</p>
                  <p><span className="font-semibold">พิกัด:</span> {earthquake.lat.toFixed(4)}, {earthquake.lng.toFixed(4)}</p>
                  {earthquake.url !== '#' && (
                    <a
                      href={earthquake.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline block mt-2"
                    >
                      ดูรายละเอียดเพิ่มเติม →
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
