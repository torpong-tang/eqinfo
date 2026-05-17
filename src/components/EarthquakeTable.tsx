'use client';

import type { ReactNode } from 'react';
import { Earthquake } from '@/types/earthquake';
import { formatDateTh } from '@/lib/formatters';

interface EarthquakeTableProps {
    earthquakes: Earthquake[];
    totalCount: number;
    magnitudeFilteredCount: number;
    lastUpdated: string | null;
    fetchedAt: string | null;
    sourceUpdatedAt: string | null;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sortBy: 'time' | 'magnitude' | 'depth' | 'place';
    sortDir: 'asc' | 'desc';
    onSort: (field: 'time' | 'magnitude' | 'depth' | 'place') => void;
    selectedEarthquakeId: string | null;
    onSelect: (eq: Earthquake) => void;
    isLoading: boolean;
}

const highlightText = (text: string, term: string): ReactNode => {
    const trimmed = term.trim();
    if (!trimmed) return text;
    const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safe})`, 'gi');
    const parts = text.split(regex);
    const lower = trimmed.toLowerCase();

    return parts.map((part, i) =>
        part.toLowerCase() === lower ? (
            <mark key={`m-${i}`} className="bg-yellow-200 text-gray-900">{part}</mark>
        ) : (
            <span key={`t-${i}`}>{part}</span>
        )
    );
};

const COLUMNS = [
    ['place', 'สถานที่', 'w-[46%] min-w-[260px]'],
    ['magnitude', 'ขนาด', 'w-[16%] min-w-[110px]'],
    ['depth', 'ความลึก (กม.)', 'w-[18%] min-w-[130px]'],
    ['time', 'วันที่/เวลา', 'w-[20%] min-w-[170px]'],
] as const;

const getMagnitudeStyle = (magnitude: number) => {
    if (magnitude >= 5) {
        return {
            badge: 'bg-red-500/15 text-red-700 ring-red-300/70',
            dot: 'bg-red-500',
            row: 'border-l-red-500',
            glow: 'shadow-red-500/10',
            label: 'สูง',
        };
    }
    if (magnitude >= 3) {
        return {
            badge: 'bg-orange-500/15 text-orange-700 ring-orange-300/70',
            dot: 'bg-orange-500',
            row: 'border-l-orange-400',
            glow: 'shadow-orange-500/10',
            label: 'กลาง',
        };
    }
    return {
        badge: 'bg-sky-500/15 text-sky-700 ring-sky-300/70',
        dot: 'bg-sky-500',
        row: 'border-l-sky-500',
        glow: 'shadow-sky-500/10',
        label: 'ต่ำ',
    };
};

export default function EarthquakeTable({
    earthquakes,
    totalCount,
    magnitudeFilteredCount,
    lastUpdated,
    fetchedAt,
    sourceUpdatedAt,
    searchTerm,
    onSearchChange,
    sortBy,
    sortDir,
    onSort,
    selectedEarthquakeId,
    onSelect,
    isLoading,
}: EarthquakeTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border border-white/55 bg-white/55 shadow-xl shadow-blue-950/10 backdrop-blur-xl">
            <div className="border-b border-white/50 bg-[linear-gradient(135deg,rgba(30,64,175,0.92),rgba(14,165,233,0.66)_58%,rgba(249,115,22,0.72))] p-4 text-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">รายการข้อมูลแผ่นดินไหว</h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-white/18 px-3 py-1 font-medium text-white ring-1 ring-white/30 backdrop-blur">
                                ทั้งหมด {totalCount} รายการ
                            </span>
                            <span className="rounded-full bg-white/18 px-3 py-1 font-medium text-white ring-1 ring-white/30 backdrop-blur">
                                ตามตัวกรอง {magnitudeFilteredCount} รายการ
                            </span>
                            {lastUpdated && (
                                <span className="rounded-full bg-orange-400/22 px-3 py-1 font-medium text-white ring-1 ring-orange-200/60 backdrop-blur">
                                    เหตุการณ์ล่าสุด {lastUpdated}
                                </span>
                            )}
                            <span className="rounded-full bg-blue-500/18 px-3 py-1 font-medium text-white ring-1 ring-blue-100/40 backdrop-blur">
                                {sourceUpdatedAt
                                    ? `แหล่งข้อมูลอัปเดตเมื่อ ${sourceUpdatedAt}`
                                    : 'แหล่งข้อมูลไม่ระบุเวลาอัปเดต'}
                            </span>
                            {fetchedAt && (
                                <span className="rounded-full bg-white/18 px-3 py-1 font-medium text-white ring-1 ring-white/30 backdrop-blur">
                                    โหลดข้อมูลในแอปเมื่อ {fetchedAt}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
                        <div className="flex w-full gap-2 sm:w-auto">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="ค้นหา (สถานที่หรือ URL)"
                                className="h-10 w-full rounded-md border border-white/40 bg-white/85 px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/70 sm:w-80"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => onSearchChange('')}
                                    className="h-10 rounded-md bg-orange-500 px-3 text-sm font-semibold text-white shadow-sm shadow-orange-950/20 transition hover:bg-orange-600"
                                >
                                    ล้าง
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-white/88">
                            <span className="font-medium text-white">ระดับ:</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-white ring-1 ring-white/30 backdrop-blur">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                5.0 ขึ้นไป
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-white ring-1 ring-white/30 backdrop-blur">
                                <span className="h-2 w-2 rounded-full bg-orange-400" />
                                3.0 - 4.9
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-white ring-1 ring-white/30 backdrop-blur">
                                <span className="h-2 w-2 rounded-full bg-sky-400" />
                                น้อยกว่า 3.0
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto overscroll-x-contain">
                {isLoading ? (
                    <LoadingRows />
                ) : (
                    <table className="min-w-full table-auto text-sm">
                        <colgroup>
                            <col className="w-[46%]" />
                            <col className="w-[16%]" />
                            <col className="w-[18%]" />
                            <col className="w-[20%]" />
                        </colgroup>
                        <thead className="bg-blue-950/90 text-white backdrop-blur">
                            <tr>
                                {COLUMNS.map(([field, label, widthClass]) => (
                                    <th key={field} className={`px-4 py-3 text-left first:pl-5 ${widthClass}`}>
                                        <button
                                            onClick={() => onSort(field)}
                                            className="flex items-center gap-1 font-semibold text-white/90 transition hover:text-orange-200"
                                        >
                                            <span>{label}</span>
                                            {sortBy === field && (
                                                <span className="rounded bg-orange-400/25 px-1.5 py-0.5 text-[10px] text-orange-100">
                                                    {sortDir === 'asc' ? '▲' : '▼'}
                                                </span>
                                            )}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {earthquakes.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-8 text-center text-slate-500" colSpan={4}>
                                        ไม่มีข้อมูลในหน้านี้
                                    </td>
                                </tr>
                            ) : (
                                earthquakes.map((eq, index) => {
                                    const style = getMagnitudeStyle(eq.magnitude);
                                    const isSelected = eq.id === selectedEarthquakeId;
                                    const rowTint = index % 2 === 0 ? 'bg-white/68' : 'bg-blue-100/72';

                                    return (
                                        <tr
                                            key={eq.id}
                                            className={`group cursor-pointer border-l-4 ${style.row} border-t border-white/55 transition hover:bg-orange-50/70 focus-within:bg-blue-100/75 ${isSelected ? 'bg-blue-100/85 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.25)]' : rowTint} ${style.glow}`}
                                            onClick={() => onSelect(eq)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    onSelect(eq);
                                                }
                                            }}
                                        >
                                            <td className="min-w-[260px] px-4 py-3 pl-5 text-slate-800">
                                                <div className="flex w-full min-w-0 items-center gap-3">
                                                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot} shadow-sm`} />
                                                    <span className="min-w-0 flex-1 break-words font-medium leading-6">
                                                        {highlightText(eq.place, searchTerm)}
                                                    </span>
                                                    <span className="shrink-0 text-blue-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500">→</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex min-w-16 items-center justify-center gap-1 rounded-full px-3 py-1.5 font-bold tabular-nums ring-1 ${style.badge}`}>
                                                    {eq.magnitude.toFixed(1)}
                                                    <span className="text-[10px] font-semibold opacity-75">{style.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                <span className="inline-flex rounded-md bg-blue-50/85 px-2.5 py-1 font-medium tabular-nums text-blue-900 ring-1 ring-blue-100">
                                                    {eq.depth.toFixed(1)}
                                                </span>
                                            </td>
                                            <td className="min-w-[170px] px-4 py-3 font-medium text-slate-600">{formatDateTh(eq.time)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function LoadingRows() {
    return (
        <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-4 flex-[3] rounded bg-slate-200" />
                    <div className="h-4 flex-[1] rounded bg-slate-200" />
                    <div className="h-4 flex-[1] rounded bg-slate-200" />
                    <div className="h-4 flex-[2] rounded bg-slate-200" />
                </div>
            ))}
        </div>
    );
}
