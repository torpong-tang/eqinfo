'use client';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    pageNumbers: (number | string)[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export default function PaginationControls({
    currentPage,
    totalPages,
    pageSize,
    pageNumbers,
    onPageChange,
    onPageSizeChange,
}: PaginationControlsProps) {
    const btnClass = (disabled: boolean) =>
        `inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-medium transition ${disabled
            ? 'cursor-not-allowed border-white/25 bg-white/20 text-blue-900/35'
            : 'border-white/45 bg-white/55 text-blue-950 shadow-sm hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
        }`;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.70),rgba(219,234,254,0.66),rgba(255,237,213,0.58))] px-4 py-3 text-sm backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3 text-blue-950">
                <span className="rounded-full bg-white/55 px-3 py-1 font-semibold ring-1 ring-white/60">
                    หน้า {currentPage} จาก {totalPages}
                </span>
                <label className="flex items-center gap-2 text-blue-950/75">
                    <span>แสดงต่อหน้า</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="rounded-md border border-white/60 bg-white/80 px-2 py-1 text-blue-950 shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                    >
                        <option value={10}>10</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                    </select>
                </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={btnClass(currentPage === 1)}
                >
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                        <path d="M6.5 3.5L2 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.5 3.5L9 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    หน้าแรก
                </button>
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={btnClass(currentPage === 1)}
                >
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                        <path d="M10.5 3.5L6 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    ก่อนหน้า
                </button>

                {pageNumbers.map((p, idx) =>
                    typeof p === 'number' ? (
                        <button
                            key={`${p}-${idx}`}
                            onClick={() => onPageChange(p)}
                            className={`rounded-md border px-3 py-1.5 font-semibold transition ${p === currentPage
                                    ? 'border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-950/20'
                                    : 'border-white/45 bg-white/55 text-blue-950 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700'
                                }`}
                        >
                            {p}
                        </button>
                    ) : (
                        <span key={`${p}-${idx}`} className="px-2 text-blue-900/40">{p}</span>
                    )
                )}

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={btnClass(currentPage === totalPages)}
                >
                    ถัดไป
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                        <path d="M5.5 3.5L10 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={btnClass(currentPage === totalPages)}
                >
                    หน้าสุดท้าย
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                        <path d="M2.5 3.5L7 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.5 3.5L14 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
