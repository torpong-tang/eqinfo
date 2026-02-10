'use client';

import { useEffect, useCallback } from 'react';
import { Earthquake } from '@/types/earthquake';
import { formatDateTh } from '@/lib/formatters';

interface EarthquakeModalProps {
    earthquake: Earthquake | null;
    searchTerm?: string;
    onClose: () => void;
}

export default function EarthquakeModal({ earthquake, searchTerm = '', onClose }: EarthquakeModalProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (!earthquake) return;
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [earthquake, handleKeyDown]);

    if (!earthquake) return null;

    const highlight = (text: string) => {
        const term = searchTerm.trim();
        if (!term) return text;
        const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safe})`, 'gi');
        const parts = text.split(regex);
        const lower = term.toLowerCase();
        return parts.map((part, i) =>
            part.toLowerCase() === lower ? (
                <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark>
            ) : (
                <span key={i}>{part}</span>
            )
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">รายละเอียดแผ่นดินไหว</h4>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-xl leading-none"
                        aria-label="ปิด"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4 space-y-2 text-sm text-gray-800">
                    <div><span className="font-semibold">สถานที่:</span> {highlight(earthquake.place)}</div>
                    <div>
                        <span className="font-semibold">ขนาด:</span>{' '}
                        <span className={earthquake.magnitude >= 5 ? 'text-red-500' : earthquake.magnitude >= 3 ? 'text-yellow-500' : 'text-green-600'}>
                            {earthquake.magnitude.toFixed(1)}
                        </span>
                    </div>
                    <div><span className="font-semibold">ความลึก:</span> {earthquake.depth.toFixed(1)} กม.</div>
                    <div><span className="font-semibold">วันที่/เวลา:</span> {formatDateTh(earthquake.time)}</div>
                    <div><span className="font-semibold">พิกัด:</span> {earthquake.lat.toFixed(4)}, {earthquake.lng.toFixed(4)}</div>
                    {earthquake.url !== '#' && (
                        <div>
                            <span className="font-semibold">ลิงก์:</span>{' '}
                            <a
                                href={earthquake.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-words"
                            >
                                {earthquake.url}
                            </a>
                        </div>
                    )}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
