'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Earthquake } from '@/types/earthquake';

type SortField = 'time' | 'magnitude' | 'depth' | 'place';
type SortDir = 'asc' | 'desc';
type MagnitudeFilter = 'all' | 'high' | 'mid' | 'low';

interface UseEarthquakeFiltersReturn {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    magnitudeFilter: MagnitudeFilter;
    setMagnitudeFilter: (filter: MagnitudeFilter) => void;
    sortBy: SortField;
    sortDir: SortDir;
    handleSort: (field: SortField) => void;
    filteredEarthquakes: Earthquake[];
    sortedEarthquakes: Earthquake[];
    magnitudeCounts: { all: number; high: number; mid: number; low: number };
    resetFilters: () => void;
}

export function useEarthquakeFilters(earthquakes: Earthquake[]): UseEarthquakeFiltersReturn {
    const [searchTerm, setSearchTerm] = useState('');
    const [magnitudeFilter, setMagnitudeFilter] = useState<MagnitudeFilter>('all');
    const [sortBy, setSortBy] = useState<SortField>('time');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const magnitudeCounts = useMemo(() => {
        const counts = { all: earthquakes.length, high: 0, mid: 0, low: 0 };
        for (const eq of earthquakes) {
            if (eq.magnitude >= 5.0) counts.high += 1;
            else if (eq.magnitude >= 3.0) counts.mid += 1;
            else counts.low += 1;
        }
        return counts;
    }, [earthquakes]);

    const magnitudeFiltered = useMemo(() => {
        if (magnitudeFilter === 'all') return earthquakes;
        return earthquakes.filter((eq) => {
            if (magnitudeFilter === 'high') return eq.magnitude >= 5.0;
            if (magnitudeFilter === 'mid') return eq.magnitude >= 3.0 && eq.magnitude < 5.0;
            return eq.magnitude < 3.0;
        });
    }, [earthquakes, magnitudeFilter]);

    const filteredEarthquakes = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return magnitudeFiltered;
        return magnitudeFiltered.filter(
            (eq) =>
                eq.place.toLowerCase().includes(term) ||
                (eq.url && eq.url.toLowerCase().includes(term))
        );
    }, [magnitudeFiltered, searchTerm]);

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

    const handleSort = useCallback((field: SortField) => {
        setSortBy((prev) => {
            if (prev === field) {
                setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                return field;
            }
            setSortDir(field === 'place' ? 'asc' : 'desc');
            return field;
        });
    }, []);

    const resetFilters = useCallback(() => {
        setSearchTerm('');
        setMagnitudeFilter('all');
        setSortBy('time');
        setSortDir('desc');
    }, []);

    return {
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
    };
}
