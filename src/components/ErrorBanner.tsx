'use client';

import { useState, useEffect } from 'react';
import { FetchError } from '@/types/earthquake';

interface ErrorBannerProps {
    error: FetchError | null;
    onDismiss: () => void;
}

export default function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (error) {
            setVisible(true);
        }
    }, [error]);

    if (!error || !visible) return null;

    const handleDismiss = () => {
        setVisible(false);
        onDismiss();
    };

    return (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800">เกิดข้อผิดพลาด</h4>
                <p className="text-sm text-red-700 mt-1">{error.message}</p>
            </div>
            <button
                onClick={handleDismiss}
                className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
                aria-label="ปิดข้อความแจ้งเตือน"
            >
                ✕
            </button>
        </div>
    );
}
