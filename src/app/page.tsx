'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import AboutModal from '@/components/AboutModal';
import EarthquakeTable from '@/components/EarthquakeTable';
import EarthquakeModal from '@/components/EarthquakeModal';
import PaginationControls from '@/components/PaginationControls';
import SituationSummary from '@/components/SituationSummary';
import UsageStats from '@/components/UsageStats';
import ErrorBanner from '@/components/ErrorBanner';
import { useEarthquakeData } from '@/hooks/useEarthquakeData';
import { useAnonymousAnalytics } from '@/hooks/useAnonymousAnalytics';
import { useEarthquakeFilters } from '@/hooks/useEarthquakeFilters';
import { usePagination } from '@/hooks/usePagination';
import { DATA_SOURCES, type Earthquake } from '@/types/earthquake';
import { formatDateTh } from '@/lib/formatters';

const welcomeSourceCardStyles = {
  'usgs-world': {
    card: 'from-sky-50/94 via-white/82 to-blue-100/86 text-sky-950 hover:border-sky-300 hover:shadow-sky-900/18 focus:ring-sky-400',
    accent: 'from-sky-500 to-blue-700',
    badge: 'bg-sky-100 text-sky-800',
  },
  'usgs-asia': {
    card: 'from-cyan-50/94 via-white/82 to-teal-100/86 text-cyan-950 hover:border-cyan-300 hover:shadow-cyan-900/18 focus:ring-cyan-400',
    accent: 'from-cyan-500 to-teal-600',
    badge: 'bg-cyan-100 text-cyan-800',
  },
  'geofon-asia': {
    card: 'from-violet-50/94 via-white/82 to-indigo-100/86 text-violet-950 hover:border-violet-300 hover:shadow-violet-900/18 focus:ring-violet-400',
    accent: 'from-violet-500 to-indigo-700',
    badge: 'bg-violet-100 text-violet-800',
  },
  bmkg: {
    card: 'from-orange-50/94 via-white/82 to-amber-100/86 text-orange-950 hover:border-orange-300 hover:shadow-orange-900/18 focus:ring-orange-400',
    accent: 'from-orange-500 to-amber-600',
    badge: 'bg-orange-100 text-orange-800',
  },
  tmd: {
    card: 'from-emerald-50/94 via-white/82 to-lime-100/86 text-emerald-950 hover:border-emerald-300 hover:shadow-emerald-900/18 focus:ring-emerald-400',
    accent: 'from-emerald-500 to-lime-600',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  emsc: {
    card: 'from-rose-50/94 via-white/82 to-pink-100/86 text-rose-950 hover:border-rose-300 hover:shadow-rose-900/18 focus:ring-rose-400',
    accent: 'from-rose-500 to-pink-700',
    badge: 'bg-rose-100 text-rose-800',
  },
} as const;

type WelcomeSourceKey = keyof typeof welcomeSourceCardStyles;

export default function Home() {
  const {
    earthquakes,
    selectedSource,
    isLoading,
    error,
    fetchedAt,
    sourceUpdatedAt,
    mapView,
    changeSource,
    dismissError,
    refresh,
  } = useEarthquakeData();
  const {
    isStatsLoading,
    stats,
  } = useAnonymousAnalytics(selectedSource);

  const {
    searchTerm,
    setSearchTerm,
    magnitudeFilter,
    setMagnitudeFilter,
    sortBy,
    sortDir,
    handleSort,
    filteredEarthquakes,
    sortedEarthquakes,
    magnitudeCounts,
    resetFilters,
  } = useEarthquakeFilters(earthquakes);

  const {
    currentPage,
    pageSize,
    totalPages,
    pagedItems,
    pageNumbers,
    goToPage,
    setPageSize,
    goToItemIndex,
  } = usePagination(sortedEarthquakes);

  const [selectedModalEq, setSelectedModalEq] = useState<Earthquake | null>(null);
  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  // Reset filters when source changes
  useEffect(() => {
    resetFilters();
    setSelectedEarthquakeId(null);
    setSelectedModalEq(null);
  }, [selectedSource, resetFilters]);

  // Clear selection if filtered out
  useEffect(() => {
    if (!selectedEarthquakeId) return;
    if (!filteredEarthquakes.some((eq) => eq.id === selectedEarthquakeId)) {
      setSelectedEarthquakeId(null);
      setSelectedModalEq(null);
    }
  }, [filteredEarthquakes, selectedEarthquakeId]);

  const selectEarthquake = useCallback(
    (eq: Earthquake, openModal = false) => {
      setSelectedEarthquakeId(eq.id);
      if (openModal) setSelectedModalEq(eq);
      const index = sortedEarthquakes.findIndex((item) => item.id === eq.id);
      if (index >= 0) goToItemIndex(index);
    },
    [sortedEarthquakes, goToItemIndex]
  );

  const scrollToDetails = useCallback(() => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const scrollToMap = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const lastUpdated = earthquakes.length
    ? formatDateTh(Math.max(...earthquakes.map((eq) => eq.time)))
    : null;
  const fetchedAtText = fetchedAt ? formatDateTh(fetchedAt) : null;
  const sourceUpdatedAtText = sourceUpdatedAt ? formatDateTh(sourceUpdatedAt) : null;

  return (
    <div className={`min-h-screen flex flex-col ${selectedSource ? 'bg-gray-100' : 'bg-blue-950'}`} suppressHydrationWarning>
      <Header
        selectedSource={selectedSource}
        onSourceChange={changeSource}
        onAboutClick={() => setIsAboutOpen(true)}
        onRefresh={refresh}
        isLoading={isLoading}
        earthquakeCount={earthquakes.length}
        magnitudeFilter={magnitudeFilter}
        onMagnitudeFilterChange={(f) => {
          setMagnitudeFilter(f);
          goToPage(1);
        }}
        magnitudeCounts={magnitudeCounts}
      />

      <ErrorBanner error={error} onDismiss={dismissError} />

      <div className={selectedSource ? 'flex-1 p-4' : 'flex flex-1'} suppressHydrationWarning>
        <div className={selectedSource ? 'overflow-hidden rounded-lg bg-white shadow-lg' : 'flex flex-1 overflow-hidden'}>
          {selectedSource ? (
            <div>
              <div className="flex items-center justify-end border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
                <button
                  type="button"
                  onClick={scrollToDetails}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  ดูรายละเอียด
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M8 3v10m0 0 4-4m-4 4L4 9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  </svg>
                </button>
              </div>
              <Map
                earthquakes={filteredEarthquakes}
                center={mapView.center}
                zoom={mapView.zoom}
                selectedSource={selectedSource}
                selectedEarthquakeId={selectedEarthquakeId}
                onSelect={(eq) => selectEarthquake(eq)}
              />
            </div>
          ) : (
            <div className="welcome-earthquake-bg relative flex min-h-[calc(100vh-168px)] flex-1 items-center justify-center overflow-hidden px-4 py-10">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.58))]" />
              <div className="relative w-full max-w-3xl px-1 py-4 text-center text-white sm:px-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/18 text-5xl shadow-xl shadow-blue-950/20 ring-1 ring-white/30 backdrop-blur-md">
                  🌍
                </div>
                <h2 className="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl">
                  ยินดีต้อนรับสู่ระบบข้อมูลแผ่นดินไหว
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-50 drop-shadow sm:text-base">
                  เลือกแหล่งข้อมูลเพื่อดูข้อมูลแผ่นดินไหวล่าสุดบนแผนที่
                </p>
                <div className="mt-6 grid gap-2 text-left sm:grid-cols-2 lg:grid-cols-3">
                  {DATA_SOURCES.map((source) => {
                    const sourceKey = source.key as WelcomeSourceKey;
                    const sourceStyle = welcomeSourceCardStyles[sourceKey];

                    return (
                      <button
                        type="button"
                        key={sourceKey}
                        onClick={() => changeSource(source.key)}
                        disabled={isLoading}
                        className={`group relative overflow-hidden rounded-xl border border-white/70 bg-gradient-to-br px-3 py-3 text-left text-sm shadow-md shadow-slate-900/10 backdrop-blur transition duration-200 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-xl focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${sourceStyle.card}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${sourceStyle.accent}`}
                        />
                        <span
                          aria-hidden="true"
                          className={`absolute -right-6 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${sourceStyle.accent} opacity-12 transition group-hover:scale-125 group-hover:opacity-20`}
                        />
                        <div className="relative flex items-start gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/72 text-2xl shadow-sm transition group-hover:scale-110">
                            {source.emoji}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-bold">{source.label}</div>
                            <div className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${sourceStyle.badge}`}>
                              {source.timeRange}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSource && (
        <div ref={detailsRef} className="relative scroll-mt-4 px-4 pb-6">
          <div className="pointer-events-none absolute inset-x-4 top-0 h-64 rounded-lg bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.20),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.08),rgba(255,255,255,0))]" />
          <div className="relative space-y-4">
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={scrollToMap}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              ดูแผนที่
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                <path d="M8 13V3m0 0 4 4M8 3 4 7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </button>
          </div>
          <SituationSummary
            earthquakes={earthquakes}
          />
          <UsageStats isLoading={isStatsLoading} stats={stats} selectedSource={selectedSource} />
          <EarthquakeTable
            earthquakes={pagedItems}
            totalCount={earthquakes.length}
            magnitudeFilteredCount={filteredEarthquakes.length}
            lastUpdated={lastUpdated}
            fetchedAt={fetchedAtText}
            sourceUpdatedAt={sourceUpdatedAtText}
            searchTerm={searchTerm}
            onSearchChange={(term) => {
              setSearchTerm(term);
              goToPage(1);
            }}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={(field) => {
              handleSort(field);
              goToPage(1);
            }}
            selectedEarthquakeId={selectedEarthquakeId}
            onSelect={(eq) => selectEarthquake(eq, true)}
            isLoading={isLoading}
          />
          <div className="-mt-px overflow-hidden rounded-b-lg border-x border-b border-white/50 bg-white/50 shadow-lg shadow-blue-950/10 backdrop-blur-xl">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageNumbers={pageNumbers}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
            />
          </div>
          </div>
        </div>
      )}

      <EarthquakeModal
        earthquake={selectedModalEq}
        searchTerm={searchTerm}
        onClose={() => setSelectedModalEq(null)}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <footer className="border-t border-white/50 bg-blue-950 px-4 py-4 text-center text-sm font-medium text-blue-100">
        © 2026 TPT Team • Version 1.0
      </footer>
    </div>
  );
}
