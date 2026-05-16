'use client';

import { DataSource, DATA_SOURCES } from '@/types/earthquake';

interface HeaderProps {
  selectedSource: DataSource;
  onClearMap: () => void;
  onAboutClick: () => void;
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
  onClearMap,
  onAboutClick,
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
            {selectedSource && (
              <p className="text-blue-100">
                {isLoading ? 'กำลังโหลดข้อมูล...' : `พบ ${earthquakeCount} รายการ`}
                {` • ${sourceNote}`}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
            <a
              href="https://2startup.cloud/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/30 transition-colors duration-200 hover:bg-white/25"
              title="กลับหน้าหลัก"
              aria-label="กลับหน้าหลัก"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9M9.5 19v-5h5v5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </a>

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
                🧹 ล้างแผนที่
              </button>
              <button
                onClick={onAboutClick}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg ring-1 ring-white/30 transition-colors duration-200 font-medium text-sm"
              >
                About
              </button>
          </div>
        </div>

        {selectedSource && (
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
              5.0 ขึ้นไป <span className="text-xs opacity-80">({magnitudeCounts.high})</span>
            </button>
            <button
              onClick={() => onMagnitudeFilterChange('mid')}
              className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${isActive('mid')
                  ? 'bg-white text-blue-800 border-white'
                  : 'border-white/40 text-white/90 hover:bg-white/10'
                }`}
            >
              <span className="w-3 h-3 bg-yellow-400 rounded-full" />
              3.0 - 4.9 <span className="text-xs opacity-80">({magnitudeCounts.mid})</span>
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
        )}
      </div>
    </div>
  );
}
