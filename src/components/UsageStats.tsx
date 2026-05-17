'use client';

import { useState } from 'react';
import { DATA_SOURCES, type DataSource } from '@/types/earthquake';
import type { AnalyticsStats } from '@/hooks/useAnonymousAnalytics';

type ConcreteDataSource = Exclude<DataSource, null>;

interface UsageStatsProps {
  isLoading: boolean;
  stats: AnalyticsStats | null;
  selectedSource: DataSource;
}

const sourceStyles: Record<ConcreteDataSource, { bar: string; soft: string; text: string; hex: string }> = {
  'usgs-world': {
    bar: 'from-sky-400 to-blue-600',
    soft: 'bg-sky-50 ring-sky-100',
    text: 'text-sky-800',
    hex: '#2563eb',
  },
  'usgs-asia': {
    bar: 'from-cyan-400 to-teal-600',
    soft: 'bg-cyan-50 ring-cyan-100',
    text: 'text-cyan-800',
    hex: '#0891b2',
  },
  'geofon-asia': {
    bar: 'from-violet-400 to-indigo-700',
    soft: 'bg-violet-50 ring-violet-100',
    text: 'text-violet-800',
    hex: '#6d28d9',
  },
  bmkg: {
    bar: 'from-orange-400 to-amber-600',
    soft: 'bg-orange-50 ring-orange-100',
    text: 'text-orange-800',
    hex: '#ea580c',
  },
  tmd: {
    bar: 'from-emerald-400 to-lime-600',
    soft: 'bg-emerald-50 ring-emerald-100',
    text: 'text-emerald-800',
    hex: '#047857',
  },
  emsc: {
    bar: 'from-rose-400 to-pink-700',
    soft: 'bg-rose-50 ring-rose-100',
    text: 'text-rose-800',
    hex: '#be123c',
  },
};

const formatCount = (value: number) => value.toLocaleString('th-TH');

const formatUpdatedAt = (value: number | null | undefined) => {
  if (!value) return 'ยังไม่มีข้อมูล';

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

export default function UsageStats({ isLoading, stats, selectedSource }: UsageStatsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const sourceRows = DATA_SOURCES.map((source) => {
    const key = source.key as ConcreteDataSource;
    const style = sourceStyles[key];

    return {
      key,
      label: `${source.emoji} ${source.label}`,
      count: stats?.sourceSelections[key] ?? 0,
      style,
    };
  }).sort((a, b) => b.count - a.count);

  const topSource = sourceRows[0];
  const totalSourceSelections = sourceRows.reduce((sum, row) => sum + row.count, 0);
  const maxSourceCount = Math.max(...sourceRows.map((row) => row.count), 1);
  const topPercent = totalSourceSelections > 0 && topSource
    ? Math.round((topSource.count / totalSourceSelections) * 100)
    : 0;
  const selectedSourceConfig = DATA_SOURCES.find((source) => source.key === selectedSource);
  const selectedSourceLabel = selectedSourceConfig
    ? `${selectedSourceConfig.emoji} ${selectedSourceConfig.label}`
    : 'ยังไม่เลือก';
  const topRingColor = topSource?.style.hex ?? '#2563eb';

  return (
    <section className="overflow-hidden rounded-lg border border-blue-100/80 bg-white/60 shadow-xl shadow-blue-950/10 backdrop-blur-xl">
      <div className="flex flex-col gap-3 bg-[linear-gradient(135deg,rgba(30,64,175,0.96),rgba(14,165,233,0.72)_58%,rgba(249,115,22,0.72))] px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/16 text-xl ring-1 ring-white/30">
            ◔
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">สถิติการใช้งานแบบไม่ระบุตัวตน</h2>
            <p className="mt-1 text-sm leading-6 text-blue-50/90">
              เก็บเฉพาะยอดรวมการเปิดหน้าและการเลือกแหล่งข้อมูล ไม่ใช้ cookies และไม่เก็บข้อมูลส่วนบุคคล
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'ยุบส่วนสถิติการใช้งานแบบไม่ระบุตัวตน' : 'ขยายส่วนสถิติการใช้งานแบบไม่ระบุตัวตน'}
            title={isOpen ? 'ยุบ' : 'ขยาย'}
            className="inline-flex h-9 w-9 items-center justify-center self-start rounded-lg bg-white/16 text-base font-bold text-white ring-1 ring-white/30 shadow-sm transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/60 sm:self-auto"
          >
            <span aria-hidden="true">{isOpen ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>

      <div className={`grid gap-3 p-4 lg:grid-cols-[280px_1fr] ${isOpen ? '' : 'hidden'}`}>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-xl bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 p-4 text-white shadow-lg shadow-blue-950/10">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/75">Visits</div>
            <div className="mt-2 text-3xl font-bold">
              {isLoading ? '-' : formatCount(stats?.pageViews ?? 0)}
            </div>
            <div className="mt-2 text-xs leading-5 text-white/80">เปิดหน้า EQInfo ทั้งหมด</div>
          </div>

          <div className="rounded-xl bg-white/72 p-4 ring-1 ring-blue-100">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected source</div>
            <div className="mt-2 text-lg font-bold text-blue-950">{selectedSourceLabel}</div>
            <div className="mt-1 text-xs text-slate-500">Source ที่กำลังดูอยู่ในหน้านี้</div>
          </div>

          <div className="rounded-xl bg-white/72 p-4 ring-1 ring-blue-100">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last used</div>
            <div className="mt-2 text-sm font-bold leading-6 text-blue-950">{formatUpdatedAt(stats?.updatedAt)}</div>
            <div className="mt-1 text-xs text-slate-500">อัปเดตจาก anonymous analytics</div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[240px_1fr]">
          <div className="rounded-xl border border-white/65 bg-white/72 p-4 shadow-sm">
            <div className="text-sm font-semibold text-blue-950">Source ที่ใช้มากที่สุด</div>
            <div className="mt-4 flex items-center justify-center">
              <div
                className="relative flex h-36 w-36 items-center justify-center rounded-full shadow-inner"
                style={{
                  background: `conic-gradient(${topRingColor} ${topPercent * 3.6}deg, rgba(219, 234, 254, 0.9) 0deg)`,
                }}
              >
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                  <div className="text-3xl font-black text-blue-950">{topPercent}%</div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-500">of selections</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="truncate text-sm font-bold text-blue-950">
                {topSource && topSource.count > 0 ? topSource.label : 'ยังไม่มีข้อมูล'}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                รวมการเลือก source {formatCount(totalSourceSelections)} ครั้ง
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/65 bg-white/72 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-blue-950">การเปิดใช้แต่ละแหล่งข้อมูล</div>
                <div className="text-xs text-slate-600">กราฟแท่งเรียงจาก source ที่ถูกเลือกบ่อยที่สุด</div>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
                {formatCount(totalSourceSelections)} selections
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {sourceRows.map((row) => {
                const barPercent = Math.max((row.count / maxSourceCount) * 100, row.count > 0 ? 8 : 0);

                return (
                  <div key={row.key} className={`rounded-lg px-3 py-3 ring-1 ${row.style.soft}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 truncate text-sm font-bold text-blue-950">{row.label}</div>
                      <div className={`shrink-0 text-sm font-black tabular-nums ${row.style.text}`}>
                        {formatCount(row.count)}
                        <span className="ml-1 text-[11px] font-semibold text-slate-500">ครั้ง</span>
                      </div>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/78 ring-1 ring-white/80">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${row.style.bar} transition-all duration-500`}
                        style={{ width: `${barPercent}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
