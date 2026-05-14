'use client';

import { useState } from 'react';
import { DATA_SOURCES, type DataSource } from '@/types/earthquake';
import type { AnalyticsStats } from '@/hooks/useAnonymousAnalytics';

type ConcreteDataSource = Exclude<DataSource, null>;

interface UsageStatsProps {
  isLoading: boolean;
  stats: AnalyticsStats | null;
}

export default function UsageStats({ isLoading, stats }: UsageStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sourceRows = DATA_SOURCES.map((source) => {
    const key = source.key as ConcreteDataSource;
    return {
      key,
      label: `${source.emoji} ${source.label}`,
      count: stats?.sourceSelections[key] ?? 0,
    };
  }).sort((a, b) => b.count - a.count);

  const topSource = sourceRows[0];
  const totalSourceSelections = sourceRows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section className="overflow-hidden rounded-lg border border-white/55 bg-white/60 p-4 shadow-xl shadow-blue-950/10 backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-blue-950">สถิติการใช้งานแบบไม่ระบุตัวตน</h2>
          <p className="mt-1 text-sm text-slate-600">
            เก็บเฉพาะยอดรวมการเปิดหน้าและการเลือกแหล่งข้อมูล ไม่ใช้ cookies และไม่เก็บข้อมูลส่วนบุคคล
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
            Anonymous
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'ยุบส่วนสถิติการใช้งานแบบไม่ระบุตัวตน' : 'ขยายส่วนสถิติการใช้งานแบบไม่ระบุตัวตน'}
            title={isOpen ? 'ยุบ' : 'ขยาย'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-base font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <span aria-hidden="true">{isOpen ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>

      <div className={`mt-4 grid gap-3 md:grid-cols-[220px_1fr] ${isOpen ? '' : 'hidden'}`}>
        <div className="rounded-xl bg-gradient-to-br from-blue-900 to-orange-500 p-4 text-white shadow-lg shadow-blue-950/10">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/75">จำนวนครั้งที่เปิดหน้า</div>
          <div className="mt-2 text-3xl font-bold">
            {isLoading ? '-' : (stats?.pageViews ?? 0).toLocaleString('th-TH')}
          </div>
          <div className="mt-2 text-xs leading-5 text-white/80">
            Source ที่ถูกเลือกทั้งหมด {totalSourceSelections.toLocaleString('th-TH')} ครั้ง
          </div>
        </div>

        <div className="rounded-xl border border-white/65 bg-white/68 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-blue-950">Source ที่เลือกบ่อย</div>
              <div className="text-xs text-slate-600">
                {topSource && topSource.count > 0
                  ? `อันดับหนึ่ง: ${topSource.label} (${topSource.count.toLocaleString('th-TH')} ครั้ง)`
                  : 'ยังไม่มีการเลือก source'}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {sourceRows.map((row) => (
              <div key={row.key} className="rounded-lg bg-blue-50/70 px-3 py-2 ring-1 ring-blue-100">
                <div className="truncate text-xs font-semibold text-blue-950">{row.label}</div>
                <div className="mt-1 text-lg font-bold text-orange-600">
                  {row.count.toLocaleString('th-TH')}
                  <span className="ml-1 text-xs font-medium text-slate-500">ครั้ง</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
