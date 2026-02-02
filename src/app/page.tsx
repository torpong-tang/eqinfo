'use client';

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo } from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import { Earthquake, DataSource, MapViewState } from '@/types/earthquake';
import { formatDateTh } from '@/lib/formatters';

interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place?: string;
    time: number;
    url?: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isCoordinateArray = (value: unknown): value is [number, number, number] =>
  Array.isArray(value) && value.length >= 3 && value.every(isNumber);

const isUsgsFeature = (value: unknown): value is UsgsFeature => {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (!isRecord(value.properties) || !isNumber(value.properties.time)) return false;
  if (!isRecord(value.geometry) || !isCoordinateArray(value.geometry.coordinates)) return false;
  if (value.properties.mag !== null && typeof value.properties.mag !== 'number') return false;
  return true;
};

const parseUsgsFeatures = (data: unknown) => {
  if (!isRecord(data) || !Array.isArray(data.features)) {
    return { features: [] as UsgsFeature[], hasInvalid: true };
  }
  const features = data.features.filter(isUsgsFeature);
  return { features, hasInvalid: features.length !== data.features.length };
};

const getUsgsStartTime = (hoursAgo: number) => {
  const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return date.toISOString();
};

export default function Home() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [selectedSource, setSelectedSource] = useState<DataSource>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<'time' | 'magnitude' | 'depth' | 'place'>('time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [magnitudeFilter, setMagnitudeFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [mapView, setMapView] = useState<MapViewState>({
    center: [15, 0],
    zoom: 2
  });
  const [selectedModalEq, setSelectedModalEq] = useState<Earthquake | null>(null);
  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState<string | null>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = 'eqinfo-visitor-count';
    const current = Number(localStorage.getItem(storageKey) || '0');
    const next = Number.isFinite(current) ? current + 1 : 1;
    localStorage.setItem(storageKey, String(next));
    setVisitorCount(next);
  }, []);

  const highlightNodes = (text: string): ReactNode => {
    const term = searchTerm.trim();
    if (!term) return text;
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeTerm})`, 'gi');
    const parts = text.split(regex);
    const lowerTerm = term.toLowerCase();

    return parts.map((part, index) =>
      part.toLowerCase() === lowerTerm ? (
        <mark key={`mark-${index}`} className="bg-yellow-200 text-gray-900">
          {part}
        </mark>
      ) : (
        <span key={`text-${index}`}>{part}</span>
      )
    );
  };

  const fetchWorldData = async () => {
    try {
      setIsLoading(true);
      const startTime = getUsgsStartTime(24);
      const response = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&starttime=${startTime}`
      );
      const rawData = (await response.json()) as unknown;
      const { features, hasInvalid } = parseUsgsFeatures(rawData);
      if (hasInvalid) {
        console.warn('Some USGS features were invalid and skipped.');
      }

      const normalizedData: Earthquake[] = features.map((feature) => {
        const magnitude = typeof feature.properties.mag === 'number' ? feature.properties.mag : 0;
        return {
          id: feature.id,
          magnitude,
          place: feature.properties.place || 'ไม่ทราบสถานที่',
          time: feature.properties.time,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          depth: feature.geometry.coordinates[2],
          url: feature.properties.url || '#'
        };
      });

      setEarthquakes(normalizedData);
      setCurrentPage(1);
      setSearchTerm('');
      setMagnitudeFilter('all');
      setSelectedEarthquakeId(null);
      setMapView({
        center: [10, 0],
        zoom: 2
      });
    } catch (error) {
      console.error('Error fetching world data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAsiaData = async () => {
    try {
      setIsLoading(true);
      const startTime = getUsgsStartTime(240);
      const response = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=1&maxlatitude=77&minlongitude=26&maxlongitude=170&orderby=time&starttime=${startTime}`
      );
      const rawData = (await response.json()) as unknown;
      const { features, hasInvalid } = parseUsgsFeatures(rawData);
      if (hasInvalid) {
        console.warn('Some USGS features were invalid and skipped.');
      }

      const normalizedData: Earthquake[] = features.map((feature) => {
        const magnitude = typeof feature.properties.mag === 'number' ? feature.properties.mag : 0;
        return {
          id: feature.id,
          magnitude,
          place: feature.properties.place || 'ไม่ทราบสถานที่',
          time: feature.properties.time,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          depth: feature.geometry.coordinates[2],
          url: feature.properties.url || '#'
        };
      });
      
      setEarthquakes(normalizedData);
      setCurrentPage(1);
      setSearchTerm('');
      setMagnitudeFilter('all');
      setSelectedEarthquakeId(null);
      setMapView({
        center: [20, 0],
        zoom: 2
      });
    } catch (error) {
      console.error('Error fetching Asia data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceChange = (source: DataSource) => {
    setSelectedSource(source);
    if (source === 'world') {
      fetchWorldData();
    } else if (source === 'asia') {
      fetchAsiaData();
    }
  };

  const handleClearMap = () => {
    setSelectedSource(null);
    setEarthquakes([]);
    setCurrentPage(1);
    setSearchTerm('');
    setMagnitudeFilter('all');
    setSelectedModalEq(null);
    setSelectedEarthquakeId(null);
  };

  const handleMagnitudeFilter = (filter: 'all' | 'high' | 'mid' | 'low') => {
    setMagnitudeFilter(filter);
    setCurrentPage(1);
  };

  const magnitudeFiltered = useMemo(() => {
    if (magnitudeFilter === 'all') return earthquakes;
    return earthquakes.filter((eq) => {
      if (magnitudeFilter === 'high') return eq.magnitude >= 5.0;
      if (magnitudeFilter === 'mid') return eq.magnitude >= 3.0 && eq.magnitude < 5.0;
      return eq.magnitude < 3.0;
    });
  }, [earthquakes, magnitudeFilter]);

  const magnitudeCounts = useMemo(() => {
    const counts = { all: earthquakes.length, high: 0, mid: 0, low: 0 };
    earthquakes.forEach((eq) => {
      if (eq.magnitude >= 5.0) counts.high += 1;
      else if (eq.magnitude >= 3.0) counts.mid += 1;
      else counts.low += 1;
    });
    return counts;
  }, [earthquakes]);

  const filteredEarthquakes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return magnitudeFiltered;
    return magnitudeFiltered.filter((eq) =>
      eq.place.toLowerCase().includes(term) ||
      (eq.url && eq.url.toLowerCase().includes(term))
    );
  }, [magnitudeFiltered, searchTerm]);

  const handleSort = (field: 'time' | 'magnitude' | 'depth' | 'place') => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'place' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  const sortedEarthquakes = useMemo(() => {
    const data = [...filteredEarthquakes];
    data.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'time':
          return (a.time - b.time) * dir;
        case 'magnitude':
          return (a.magnitude - b.magnitude) * dir;
        case 'depth':
          return (a.depth - b.depth) * dir;
        case 'place':
        default:
          return a.place.localeCompare(b.place) * (dir === 1 ? 1 : -1);
      }
    });
    return data;
  }, [filteredEarthquakes, sortBy, sortDir]);

  const selectEarthquake = (eq: Earthquake, openModal = false) => {
    setSelectedEarthquakeId(eq.id);
    if (openModal) {
      setSelectedModalEq(eq);
    }
    const index = sortedEarthquakes.findIndex((item) => item.id === eq.id);
    if (index >= 0) {
      setCurrentPage(Math.floor(index / pageSize) + 1);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedEarthquakes.length / pageSize)),
    [sortedEarthquakes.length, pageSize]
  );

  const lastUpdated = useMemo(() => {
    if (!earthquakes.length) return null;
    const latest = Math.max(...earthquakes.map((eq) => eq.time));
    return formatDateTh(latest);
  }, [earthquakes]);

  const pagedEarthquakes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEarthquakes.slice(start, start + pageSize);
  }, [sortedEarthquakes, currentPage, pageSize]);

  useEffect(() => {
    if (!selectedEarthquakeId) return;
    if (!filteredEarthquakes.some((eq) => eq.id === selectedEarthquakeId)) {
      setSelectedEarthquakeId(null);
      setSelectedModalEq(null);
    }
  }, [filteredEarthquakes, selectedEarthquakeId]);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" suppressHydrationWarning>
      <Header
        selectedSource={selectedSource}
        onSourceChange={handleSourceChange}
        onClearMap={handleClearMap}
        isLoading={isLoading}
        earthquakeCount={earthquakes.length}
        visitorCount={visitorCount}
        magnitudeFilter={magnitudeFilter}
        onMagnitudeFilterChange={handleMagnitudeFilter}
        magnitudeCounts={magnitudeCounts}
      />
      
      <div className="flex-1 p-4" suppressHydrationWarning>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {selectedSource ? (
            <Map
              earthquakes={filteredEarthquakes}
              center={mapView.center}
              zoom={mapView.zoom}
              selectedSource={selectedSource}
              selectedEarthquakeId={selectedEarthquakeId}
              onSelect={(eq) => selectEarthquake(eq)}
            />
          ) : (
            <div className="h-[70vh] min-h-[500px] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-6xl mb-4">🌍</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  ยินดีต้อนรับสู่ระบบข้อมูลแผ่นดินไหว
                </h2>
                <p className="text-gray-600 mb-6">
                  เลือกแหล่งข้อมูลเพื่อดูข้อมูลแผ่นดินไหวล่าสุดบนแผนที่
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    🌍 ข้อมูลจาก USGS (ทั่วโลก)
                  </p>
                  <p className="text-sm text-gray-500">
                    🌏 ข้อมูลจาก USGS (เอเชีย)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSource && (
        <div className="px-4 pb-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">รายการข้อมูลแผ่นดินไหว</h3>
              <div className="mt-3 flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="ค้นหา (สถานที่หรือ URL)"
                  className="w-full md:w-80 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
                  >
                    ล้างค้นหา
                  </button>
                )}
                <span className="text-sm text-gray-600">ทั้งหมดจากแหล่งข้อมูล {earthquakes.length} รายการ</span>
                <span className="text-sm text-gray-600">ตามสีขนาด {magnitudeFiltered.length} รายการ</span>
                {lastUpdated && (
                  <span className="text-sm text-gray-500">อัปเดตล่าสุด {lastUpdated}</span>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span className="font-medium text-gray-700">คำอธิบายสี:</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    มากกว่า 5.0
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    3.0 - 5.0
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    น้อยกว่า 3.0
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    {([
                      ['place', 'สถานที่'],
                      ['magnitude', 'ขนาด'],
                      ['depth', 'ความลึก (กม.)'],
                      ['time', 'วันที่/เวลา'],
                    ] as const).map(([field, label]) => (
                      <th key={field} className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort(field)}
                          className="flex items-center gap-1 text-gray-700 hover:text-blue-700"
                        >
                          <span>{label}</span>
                          {sortBy === field && (
                            <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedEarthquakes.length === 0 ? (
                    <tr>
                        <td className="px-4 py-4 text-center text-gray-500" colSpan={5}>
                          ไม่มีข้อมูลในหน้านี้
                        </td>
                      </tr>
                    ) : (
                    pagedEarthquakes.map((eq) => (
                      <tr
                        key={eq.id}
                        className={`group border-t border-gray-200 last:border-b hover:bg-gray-50 cursor-pointer focus-within:bg-blue-50 ${eq.id === selectedEarthquakeId ? 'bg-blue-50' : ''}`}
                        onClick={() => selectEarthquake(eq, true)}
                        role="button"
                        tabIndex={0}
                        aria-selected={eq.id === selectedEarthquakeId}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            selectEarthquake(eq, true);
                          }
                        }}
                      >
                        <td className="px-4 py-3 text-gray-800">
                          <div className="flex items-center gap-2">
                            <span>{highlightNodes(eq.place)}</span>
                            <span className="text-gray-400 group-hover:text-blue-600">→</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <span className={eq.magnitude >= 5 ? 'text-red-600' : eq.magnitude >= 3 ? 'text-yellow-600' : 'text-green-600'}>
                            {eq.magnitude.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{eq.depth}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDateTh(eq.time)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm">
              <div className="flex flex-wrap items-center gap-3 text-gray-700">
                <span>หน้า {currentPage} จาก {totalPages}</span>
                <label className="flex items-center gap-2 text-gray-600">
                  <span>แสดงต่อหน้า</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md border inline-flex items-center gap-2 ${currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M6.5 3.5L2 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.5 3.5L9 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  หน้าแรก
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md border inline-flex items-center gap-2 ${currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M10.5 3.5L6 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  ก่อนหน้า
                </button>

                {pageNumbers.map((p, idx) =>
                  typeof p === 'number' ? (
                    <button
                      key={`${p}-${idx}`}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 rounded-md border ${
                        p === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={`${p}-${idx}`} className="px-2 text-gray-400">{p}</span>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md border inline-flex items-center gap-2 ${currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  ถัดไป
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M5.5 3.5L10 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md border inline-flex items-center gap-2 ${currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  หน้าสุดท้าย
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M2.5 3.5L7 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.5 3.5L14 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedModalEq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">รายละเอียดแผ่นดินไหว</h4>
              <button
                onClick={() => setSelectedModalEq(null)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-2 text-sm text-gray-800">
              <div><span className="font-semibold">สถานที่:</span> {highlightNodes(selectedModalEq.place)}</div>
              <div><span className="font-semibold">ขนาด:</span> <span className={selectedModalEq.magnitude >= 5 ? 'text-red-500' : selectedModalEq.magnitude >= 3 ? 'text-yellow-500' : 'text-green-600'}>{selectedModalEq.magnitude}</span></div>
              <div><span className="font-semibold">ความลึก:</span> {selectedModalEq.depth} กม.</div>
              <div><span className="font-semibold">วันที่/เวลา:</span> {formatDateTh(selectedModalEq.time)}</div>
              <div><span className="font-semibold">พิกัด:</span> {selectedModalEq.lat.toFixed(4)}, {selectedModalEq.lng.toFixed(4)}</div>
              {selectedModalEq.url !== '#' && (
                <div>
                  <span className="font-semibold">ลิงก์:</span>{' '}
                  <a
                    href={selectedModalEq.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-words"
                  >
                    {selectedModalEq.url}
                  </a>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedModalEq(null)}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
