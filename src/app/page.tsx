'use client';

import { useState, useEffect, useCallback } from 'react';
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
    clearAll,
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

  const handleClearMap = useCallback(() => {
    clearAll();
    resetFilters();
    setSelectedModalEq(null);
    setSelectedEarthquakeId(null);
  }, [clearAll, resetFilters]);

  const lastUpdated = earthquakes.length
    ? formatDateTh(Math.max(...earthquakes.map((eq) => eq.time)))
    : null;
  const fetchedAtText = fetchedAt ? formatDateTh(fetchedAt) : null;
  const sourceUpdatedAtText = sourceUpdatedAt ? formatDateTh(sourceUpdatedAt) : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" suppressHydrationWarning>
      <Header
        selectedSource={selectedSource}
        onSourceChange={changeSource}
        onAboutClick={() => setIsAboutOpen(true)}
        onClearMap={handleClearMap}
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
            <div className="welcome-earthquake-bg relative flex h-[70vh] min-h-[500px] items-center justify-center overflow-hidden px-4 py-10">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(15,23,42,0.34))]" />
              <div className="relative w-full max-w-3xl rounded-2xl border border-white/55 bg-white/76 px-5 py-7 text-center text-slate-950 shadow-2xl shadow-slate-950/24 backdrop-blur-md sm:px-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-950/10 text-5xl ring-1 ring-blue-950/10">
                  🌍
                </div>
                <h2 className="text-2xl font-bold text-blue-950 sm:text-3xl">
                  ยินดีต้อนรับสู่ระบบข้อมูลแผ่นดินไหว
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
                  เลือกแหล่งข้อมูลเพื่อดูข้อมูลแผ่นดินไหวล่าสุดบนแผนที่
                </p>
                <div className="mt-6 grid gap-2 text-left sm:grid-cols-2 lg:grid-cols-3">
                  {DATA_SOURCES.map((source) => (
                    <div
                      key={source.key}
                      className="rounded-lg border border-white/70 bg-white/68 px-3 py-2 text-sm text-blue-950 shadow-sm backdrop-blur"
                    >
                      <div className="truncate font-semibold">{source.emoji} {source.label}</div>
                      <div className="mt-0.5 text-xs text-slate-600">{source.timeRange}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSource && (
        <div className="relative px-4 pb-6">
          <div className="pointer-events-none absolute inset-x-4 top-0 h-64 rounded-lg bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.20),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.08),rgba(255,255,255,0))]" />
          <div className="relative space-y-4">
          <SituationSummary
            earthquakes={earthquakes}
          />
          <UsageStats isLoading={isStatsLoading} stats={stats} />
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
