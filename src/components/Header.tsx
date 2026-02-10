'use client';

import { DataSource, DATA_SOURCES } from '@/types/earthquake';

interface HeaderProps {
  selectedSource: DataSource;
  onSourceChange: (source: DataSource) => void;
  onClearMap: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  earthquakeCount: number;
  magnitudeFilter: 'all' | 'high' | 'mid' | 'low';
  onMagnitudeFilterChange: (filter: 'all' | 'high' | 'mid' | 'low') => void;
  magnitudeCounts: {
    all: number;
    high: number;
    mid: number;
    low: number;
  };
}

export default function Header({
  selectedSource,
  onSourceChange,
  onClearMap,
  onRefresh,
  isLoading,
  earthquakeCount,
  magnitudeFilter,
  onMagnitudeFilterChange,
  magnitudeCounts,
}: HeaderProps) {
  const isActive = (filter: 'all' | 'high' | 'mid' | 'low') => magnitudeFilter === filter;
  const currentSourceConfig = DATA_SOURCES.find((s) => s.key === selectedSource);
  const sourceNote = currentSourceConfig
    ? `แหล่งข้อมูล: ${currentSourceConfig.label} (${currentSourceConfig.timeRange})`
    : 'แหล่งข้อมูล: ยังไม่เลือก';

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">🌍 ข้อมูลแผ่นดินไหว</h1>
            <p className="text-blue-100">
              {isLoading ? 'กำลังโหลดข้อมูล...' : `พบ ${earthquakeCount} รายการ`}
              {` • ${sourceNote}`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
            <div className="flex flex-wrap bg-white/10 rounded-lg p-1 gap-1">
              {DATA_SOURCES.map((source) => (
                <button
                  key={source.key}
                  onClick={() => onSourceChange(source.key)}
                  disabled={isLoading}
                  title={source.description}
                  className={`px-3 py-2 rounded-md transition-all duration-200 text-sm whitespace-nowrap ${selectedSource === source.key
                      ? 'bg-white text-blue-800 font-semibold shadow-sm'
                      : 'text-white hover:bg-white/20'
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {source.emoji} {source.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {selectedSource && (
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors duration-200 font-medium text-sm disabled:opacity-60"
                  title="รีเฟรชข้อมูล"
                >
                  🔄 รีเฟรช
                </button>
              )}
              <button
                onClick={onClearMap}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                ล้างแผนที่
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <button
            onClick={() => onMagnitudeFilterChange('all')}
            className={`px-3 py-1 rounded-full border transition-colors ${isActive('all')
                ? 'bg-white text-blue-800 border-white'
                : 'border-white/40 text-white/90 hover:bg-white/10'
              }`}
          >
            ทั้งหมด <span className="ml-1 text-xs opacity-80">({magnitudeCounts.all})</span>
          </button>
          <button
            onClick={() => onMagnitudeFilterChange('high')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${isActive('high')
                ? 'bg-white text-blue-800 border-white'
                : 'border-white/40 text-white/90 hover:bg-white/10'
              }`}
          >
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            มากกว่า 5.0 <span className="text-xs opacity-80">({magnitudeCounts.high})</span>
          </button>
          <button
            onClick={() => onMagnitudeFilterChange('mid')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${isActive('mid')
                ? 'bg-white text-blue-800 border-white'
                : 'border-white/40 text-white/90 hover:bg-white/10'
              }`}
          >
            <span className="w-3 h-3 bg-yellow-400 rounded-full" />
            3.0 - 5.0 <span className="text-xs opacity-80">({magnitudeCounts.mid})</span>
          </button>
          <button
            onClick={() => onMagnitudeFilterChange('low')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${isActive('low')
                ? 'bg-white text-blue-800 border-white'
                : 'border-white/40 text-white/90 hover:bg-white/10'
              }`}
          >
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            น้อยกว่า 3.0 <span className="text-xs opacity-80">({magnitudeCounts.low})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
