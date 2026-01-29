'use client';

import type { DivIcon } from 'leaflet';
import type { FeatureLayer } from 'esri-leaflet';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Earthquake } from '@/types/earthquake';
import { useMap } from 'react-leaflet';
import { formatDateTh } from '@/lib/formatters';

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


const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

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
      if (layer) {
        map.removeLayer(layer);
      }
    };
  }, [map]);

  return null;
}

interface MapProps {
  earthquakes: Earthquake[];
  center: [number, number];
  zoom: number;
}

export default function EarthquakeMap({ earthquakes, center, zoom }: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [leaflet, setLeaflet] = useState<typeof import('leaflet') | null>(null);

  const ringOfFirePath: [number, number][] = [
    [60, -150],
    [55, -140],
    [50, -135],
    [45, -130],
    [40, -125],
    [35, -120],
    [30, -115],
    [25, -110],
    [20, -105],
    [15, -100],
    [10, -95],
    [5, -90],
    [0, -85],
    [-10, -80],
    [-20, -75],
    [-30, -75],
    [-40, -74],
    [-50, -73],
    [-55, -70],
    [-55, -50],
    [-50, -30],
    [-40, -10],
    [-30, 5],
    [-20, 20],
    [-10, 40],
    [0, 60],
    [10, 90],
    [20, 110],
    [30, 130],
    [40, 145],
    [50, 160],
    [55, 170],
  ];

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

  const getMarkerIcon = (magnitude: number) => {
    if (!leaflet) return undefined;
    const size = Math.round(10 + magnitude * 4);
    const key = `${magnitude}-${size}`;
    const cached = markerIconCache.get(key);
    if (cached) return cached;

    const icon = leaflet.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:${getMarkerColor(magnitude)};border:2px solid #ffffff;border-radius:50%;opacity:0.85;"></div>`,
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
        key={`${center[0]}-${center[1]}-${zoom}`}
        center={center}
        zoom={zoom}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.esri.com/">Esri</a>'
        />

        <Polyline
          positions={ringOfFirePath}
          pathOptions={{ color: '#dc2626', weight: 2, dashArray: '6 6', opacity: 0.9 }}
        />

        <PlateBoundariesLayer />

        {earthquakes.map((earthquake) => (
          <Marker
            key={earthquake.id}
            position={[earthquake.lat, earthquake.lng]}
            icon={getMarkerIcon(earthquake.magnitude)}
          >
            <Popup>
              <div className="text-sm p-2 text-slate-900">
                <h3 className="font-bold text-lg mb-2">
                  📍 {earthquake.place}
                </h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">ขนาด:</span>{' '}
                    <span className={`font-bold ${
                      earthquake.magnitude >= 5.0 ? 'text-red-600' :
                      earthquake.magnitude >= 3.0 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {earthquake.magnitude}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">ความลึก:</span> {earthquake.depth} กม.
                  </p>
                  <p>
                    <span className="font-semibold">วันที่:</span>{' '}
                    {formatDateTh(earthquake.time)}
                  </p>
                  <p>
                    <span className="font-semibold">พิกัด:</span>{' '}
                    {earthquake.lat.toFixed(4)}, {earthquake.lng.toFixed(4)}
                  </p>
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
