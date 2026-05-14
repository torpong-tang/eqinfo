'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataSource } from '@/types/earthquake';

type ConcreteDataSource = Exclude<DataSource, null>;

export interface AnalyticsStats {
  pageViews: number;
  sourceSelections: Record<ConcreteDataSource, number>;
  updatedAt: number | null;
}

const fetchStats = async () => {
  const response = await fetch('/api/analytics', { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to load analytics stats');
  return (await response.json()) as AnalyticsStats;
};

const postEvent = async (event: 'page_view' | 'source_select', source?: ConcreteDataSource) => {
  const response = await fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, source }),
  });
  if (!response.ok) throw new Error('Failed to save analytics event');
  return (await response.json()) as AnalyticsStats;
};

export function useAnonymousAnalytics(selectedSource: DataSource) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const hasTrackedPageView = useRef(false);
  const lastTrackedSource = useRef<DataSource>(null);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        const nextStats = await fetchStats();
        if (!isCancelled) setStats(nextStats);
      } catch (error) {
        console.error('Failed to load anonymous analytics:', error);
      } finally {
        if (!isCancelled) setIsStatsLoading(false);
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hasTrackedPageView.current) return;
    hasTrackedPageView.current = true;

    postEvent('page_view')
      .then(setStats)
      .catch((error) => console.error('Failed to track page view:', error));
  }, []);

  useEffect(() => {
    if (!selectedSource || lastTrackedSource.current === selectedSource) return;
    lastTrackedSource.current = selectedSource;

    postEvent('source_select', selectedSource)
      .then(setStats)
      .catch((error) => console.error('Failed to track source selection:', error));
  }, [selectedSource]);

  const refreshStats = useCallback(() => {
    fetchStats()
      .then(setStats)
      .catch((error) => console.error('Failed to refresh anonymous analytics:', error));
  }, []);

  return { isStatsLoading, refreshStats, stats };
}
