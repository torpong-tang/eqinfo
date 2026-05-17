'use client';

import { DataSource, DATA_SOURCES } from '@/types/earthquake';

type ConcreteDataSource = Exclude<DataSource, null>;

interface HeaderProps {
  selectedSource: DataSource;
  onSourceChange: (source: DataSource) => void;
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
  onSourceChange,
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
  const activeSourceButtonStyles: Record<ConcreteDataSource, string> = {
    'usgs-world': 'bg-sky-700 text-white ring-sky-200/50 shadow-sm',
    'usgs-asia': 'bg-cyan-700 text-white ring-cyan-200/50 shadow-sm',
    'geofon-asia': 'bg-violet-700 text-white ring-violet-200/50 shadow-sm',
    bmkg: 'bg-orange-600 text-white ring-orange-200/50 shadow-sm',
    tmd: 'bg-emerald-700 text-white ring-emerald-200/50 shadow-sm',
    emsc: 'bg-rose-700 text-white ring-rose-200/50 shadow-sm',
  };
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
            {selectedSource && (
              <>
                <div className="relative w-full sm:w-80">
                  <select
                    value={selectedSource}
                    onChange={(event) => onSourceChange(event.target.value as DataSource)}
                    disabled={isLoading}
                    title="เลือกแหล่งข้อมูล"
                    className={`h-11 w-full appearance-none rounded-xl border border-white/35 px-4 pr-10 text-sm font-semibold shadow-lg shadow-blue-950/10 outline-none ring-1 backdrop-blur transition focus:border-orange-200 focus:ring-2 focus:ring-orange-200/70 disabled:cursor-not-allowed disabled:opacity-60 ${activeSourceButtonStyles[selectedSource]}`}
                  >
                    {DATA_SOURCES.map((source) => {
                      const sourceKey = source.key as ConcreteDataSource;

                      return (
                        <option key={sourceKey} value={sourceKey} className="bg-white text-slate-900">
                          {source.emoji} {source.label} ({source.timeRange})
                        </option>
                      );
                    })}
                  </select>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-current"
                  >
                    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors duration-200 hover:bg-blue-400 disabled:opacity-60"
                  title="รีเฟรชข้อมูล"
                  aria-label="รีเฟรชข้อมูล"
                >
                  🔄
                </button>
              </>
            )}
            <button
              onClick={onAboutClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/30 transition-colors duration-200 hover:bg-white/25"
              title="About"
              aria-label="About"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M12 11v5M12 8h.01"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
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
