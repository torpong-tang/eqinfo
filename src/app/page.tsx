'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Map from '@/components/Map';
import EarthquakeTable from '@/components/EarthquakeTable';
import EarthquakeModal from '@/components/EarthquakeModal';
import PaginationControls from '@/components/PaginationControls';
import ErrorBanner from '@/components/ErrorBanner';
import { useEarthquakeData } from '@/hooks/useEarthquakeData';
import { useEarthquakeFilters } from '@/hooks/useEarthquakeFilters';
import { usePagination } from '@/hooks/usePagination';
import type { Earthquake } from '@/types/earthquake';
import { formatDateTh } from '@/lib/formatters';

export default function Home() {
  const {
    earthquakes,
    selectedSource,
    isLoading,
    error,
    mapView,
    changeSource,
    clearAll,
    dismissError,
    refresh,
  } = useEarthquakeData();

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" suppressHydrationWarning>
      <Header
        selectedSource={selectedSource}
        onSourceChange={changeSource}
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
                  <p className="text-sm text-gray-500">🌍 USGS ทั่วโลก (24 ชม.)</p>
                  <p className="text-sm text-gray-500">🌏 USGS เอเชีย (240 ชม.)</p>
                  <p className="text-sm text-gray-500">🇹🇭 TMD ประเทศไทย</p>
                  <p className="text-sm text-gray-500">🇪🇺 EMSC ยุโรป-เมดิเตอร์เรเนียน (24 ชม.)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSource && (
        <div className="px-4 pb-6">
          <EarthquakeTable
            earthquakes={pagedItems}
            totalCount={earthquakes.length}
            magnitudeFilteredCount={filteredEarthquakes.length}
            lastUpdated={lastUpdated}
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
          <div className="bg-white rounded-b-lg shadow-lg overflow-hidden -mt-px">
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
      )}

      <EarthquakeModal
        earthquake={selectedModalEq}
        searchTerm={searchTerm}
        onClose={() => setSelectedModalEq(null)}
      />
    </div>
  );
}
