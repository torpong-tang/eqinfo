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
        `px-3 py-1 rounded-md border inline-flex items-center gap-2 ${disabled
            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
            : 'text-gray-700 border-gray-300 hover:bg-gray-100'
        }`;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm flex-wrap gap-3">
            <div className="flex flex-wrap items-center gap-3 text-gray-700">
                <span>หน้า {currentPage} จาก {totalPages}</span>
                <label className="flex items-center gap-2 text-gray-600">
                    <span>แสดงต่อหน้า</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1 text-gray-700 bg-white"
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
                            className={`px-3 py-1 rounded-md border ${p === currentPage
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            {p}
                        </button>
                    ) : (
                        <span key={`${p}-${idx}`} className="px-2 text-gray-400">{p}</span>
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
