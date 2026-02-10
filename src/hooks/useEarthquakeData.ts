'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Earthquake, DataSource, MapViewState, FetchError } from '@/types/earthquake';
import { fetchEarthquakes, getDefaultMapView } from '@/lib/earthquakeApi';

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

interface UseEarthquakeDataReturn {
    earthquakes: Earthquake[];
    selectedSource: DataSource;
    isLoading: boolean;
    error: FetchError | null;
    mapView: MapViewState;
    changeSource: (source: DataSource) => void;
    clearAll: () => void;
    dismissError: () => void;
    refresh: () => void;
}

export function useEarthquakeData(): UseEarthquakeDataReturn {
    const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
    const [selectedSource, setSelectedSource] = useState<DataSource>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<FetchError | null>(null);
    const [mapView, setMapView] = useState<MapViewState>({ center: [15, 0], zoom: 2 });
    const abortRef = useRef<AbortController | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const loadData = useCallback(async (source: DataSource) => {
        if (!source) return;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchEarthquakes(source, controller.signal);
            if (!controller.signal.aborted) {
                setEarthquakes(data);
                setMapView(getDefaultMapView(source));
            }
        } catch (err) {
            if ((err as { name?: string }).name === 'AbortError') return;
            console.error('Error fetching earthquake data:', err);
            setError({
                message: `ไม่สามารถโหลดข้อมูลจากแหล่งที่เลือกได้ กรุณาลองใหม่อีกครั้ง`,
                source,
            });
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    const changeSource = useCallback((source: DataSource) => {
        setSelectedSource(source);
        if (source) {
            loadData(source);
        }
    }, [loadData]);

    const clearAll = useCallback(() => {
        abortRef.current?.abort();
        if (timerRef.current) clearInterval(timerRef.current);
        setSelectedSource(null);
        setEarthquakes([]);
        setError(null);
        setMapView({ center: [15, 0], zoom: 2 });
    }, []);

    const refresh = useCallback(() => {
        if (selectedSource) {
            loadData(selectedSource);
        }
    }, [selectedSource, loadData]);

    const dismissError = useCallback(() => setError(null), []);

    // Auto-refresh
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!selectedSource) return;

        timerRef.current = setInterval(() => {
            loadData(selectedSource);
        }, AUTO_REFRESH_MS);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [selectedSource, loadData]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return {
        earthquakes,
        selectedSource,
        isLoading,
        error,
        mapView,
        changeSource,
        clearAll,
        dismissError,
        refresh,
    };
}
