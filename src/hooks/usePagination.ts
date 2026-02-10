'use client';

import { useState, useMemo, useCallback } from 'react';

interface UsePaginationReturn<T> {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    pagedItems: T[];
    pageNumbers: (number | string)[];
    goToPage: (page: number) => void;
    setPageSize: (size: number) => void;
    goToItemIndex: (index: number) => void;
}

export function usePagination<T>(items: T[], initialPageSize = 10): UsePaginationReturn<T> {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSizeState] = useState(initialPageSize);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(items.length / pageSize)),
        [items.length, pageSize]
    );

    // Clamp current page when data changes
    const safePage = Math.min(currentPage, totalPages);
    if (safePage !== currentPage) {
        setCurrentPage(safePage);
    }

    const pagedItems = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, safePage, pageSize]);

    const pageNumbers = useMemo(() => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (safePage > 3) pages.push('...');
            const start = Math.max(2, safePage - 1);
            const end = Math.min(totalPages - 1, safePage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (safePage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    }, [safePage, totalPages]);

    const goToPage = useCallback(
        (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages))),
        [totalPages]
    );

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size);
        setCurrentPage(1);
    }, []);

    const goToItemIndex = useCallback(
        (index: number) => {
            if (index >= 0) {
                setCurrentPage(Math.floor(index / pageSize) + 1);
            }
        },
        [pageSize]
    );

    return {
        currentPage: safePage,
        pageSize,
        totalPages,
        pagedItems,
        pageNumbers,
        goToPage,
        setPageSize,
        goToItemIndex,
    };
}
