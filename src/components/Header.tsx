'use client';

import { DataSource } from '@/types/earthquake';

interface HeaderProps {
  selectedSource: DataSource;
  onSourceChange: (source: DataSource) => void;
  onClearMap: () => void;
  isLoading: boolean;
  earthquakeCount: number;
  visitorCount: number | null;
  magnitudeFilter: 'all' | 'high' | 'mid' | 'low';
  onMagnitudeFilterChange: (filter: 'all' | 'high' | 'mid' | 'low') => void;
}

export default function Header({ 
  selectedSource, 
  onSourceChange, 
  onClearMap, 
  isLoading, 
  earthquakeCount,
  visitorCount,
  magnitudeFilter,
  onMagnitudeFilterChange
}: HeaderProps) {
  const isActive = (filter: 'all' | 'high' | 'mid' | 'low') => magnitudeFilter === filter;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">🌍 ข้อมูลแผ่นดินไหว</h1>
            <p className="text-blue-100">
              {isLoading ? 'กำลังโหลดข้อมูล...' : `พบ ${earthquakeCount} รายการ`}
              {visitorCount !== null && ` • ผู้เข้าชม ${visitorCount}`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
            <div className="flex bg-white/10 rounded-lg p-1 w-full sm:w-auto">
              <button
                onClick={() => onSourceChange('thai')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md transition-all duration-200 ${
                  selectedSource === 'thai'
                    ? 'bg-white text-blue-800 font-semibold'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                🇹🇭 ไทย
              </button>
              <button
                onClick={() => onSourceChange('asia')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md transition-all duration-200 ${
                  selectedSource === 'asia'
                    ? 'bg-white text-blue-800 font-semibold'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                🌏 เอเชีย
              </button>
            </div>
            
            <button
              onClick={onClearMap}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              ล้างแผนที่
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <button
            onClick={() => onMagnitudeFilterChange('all')}
            className={`px-3 py-1 rounded-full border transition-colors ${
              isActive('all')
                ? 'bg-white text-blue-800 border-white'
                : 'border-white/40 text-white/90 hover:bg-white/10'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => onMagnitudeFilterChange('high')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
              isActive('high')
                ? 'bg-white text-blue-800 border-white'
                : 'border-white/40 text-white/90 hover:bg-white/10'
            }`}
          >
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            มากกว่า 5.0
          </button>
          <button
            onClick={() => onMagnitudeFilterChange('mid')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
              isActive('mid')
                ? 'bg-white text-blue-800 border-white'
                : 'border-white/40 text-white/90 hover:bg-white/10'
            }`}
          >
            <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
            3.0 - 5.0
          </button>
          <button
            onClick={() => onMagnitudeFilterChange('low')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${
              isActive('low')
                ? 'bg-white text-blue-800 border-white'
                : 'border-white/40 text-white/90 hover:bg-white/10'
            }`}
          >
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            น้อยกว่า 3.0
          </button>
        </div>
      </div>
    </div>
  );
}
