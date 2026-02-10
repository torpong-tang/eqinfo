'use client';

import type { ReactNode } from 'react';
import { Earthquake } from '@/types/earthquake';
import { formatDateTh } from '@/lib/formatters';

interface EarthquakeTableProps {
    earthquakes: Earthquake[];
    totalCount: number;
    magnitudeFilteredCount: number;
    lastUpdated: string | null;
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
    ['place', 'สถานที่'],
    ['magnitude', 'ขนาด'],
    ['depth', 'ความลึก (กม.)'],
    ['time', 'วันที่/เวลา'],
] as const;

export default function EarthquakeTable({
    earthquakes,
    totalCount,
    magnitudeFilteredCount,
    lastUpdated,
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">รายการข้อมูลแผ่นดินไหว</h3>
                <div className="mt-3 flex flex-wrap gap-3 items-center">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="ค้นหา (สถานที่หรือ URL)"
                        className="w-full md:w-80 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
                        >
                            ล้างค้นหา
                        </button>
                    )}
                    <span className="text-sm text-gray-600">ทั้งหมด {totalCount} รายการ</span>
                    <span className="text-sm text-gray-600">ตามตัวกรอง {magnitudeFilteredCount} รายการ</span>
                    {lastUpdated && (
                        <span className="text-sm text-gray-500">อัปเดตล่าสุด {lastUpdated}</span>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="font-medium text-gray-700">คำอธิบายสี:</span>
                        <span className="inline-flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            มากกว่า 5.0
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            3.0 - 5.0
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            น้อยกว่า 3.0
                        </span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                {isLoading ? (
                    <LoadingRows />
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                {COLUMNS.map(([field, label]) => (
                                    <th key={field} className="px-4 py-3 text-left">
                                        <button
                                            onClick={() => onSort(field)}
                                            className="flex items-center gap-1 text-gray-700 hover:text-blue-700"
                                        >
                                            <span>{label}</span>
                                            {sortBy === field && (
                                                <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
                                            )}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {earthquakes.length === 0 ? (
                                <tr>
                                    <td className="px-4 py-4 text-center text-gray-500" colSpan={4}>
                                        ไม่มีข้อมูลในหน้านี้
                                    </td>
                                </tr>
                            ) : (
                                earthquakes.map((eq) => (
                                    <tr
                                        key={eq.id}
                                        className={`group border-t border-gray-200 last:border-b hover:bg-gray-50 cursor-pointer focus-within:bg-blue-50 ${eq.id === selectedEarthquakeId ? 'bg-blue-50' : ''}`}
                                        onClick={() => onSelect(eq)}
                                        role="button"
                                        tabIndex={0}
                                        aria-selected={eq.id === selectedEarthquakeId}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                onSelect(eq);
                                            }
                                        }}
                                    >
                                        <td className="px-4 py-3 text-gray-800">
                                            <div className="flex items-center gap-2">
                                                <span>{highlightText(eq.place, searchTerm)}</span>
                                                <span className="text-gray-400 group-hover:text-blue-600">→</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            <span className={eq.magnitude >= 5 ? 'text-red-600' : eq.magnitude >= 3 ? 'text-yellow-600' : 'text-green-600'}>
                                                {eq.magnitude.toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{eq.depth.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-gray-700">{formatDateTh(eq.time)}</td>
                                    </tr>
                                ))
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
        <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded flex-[3]" />
                    <div className="h-4 bg-gray-200 rounded flex-[1]" />
                    <div className="h-4 bg-gray-200 rounded flex-[1]" />
                    <div className="h-4 bg-gray-200 rounded flex-[2]" />
                </div>
            ))}
        </div>
    );
}
