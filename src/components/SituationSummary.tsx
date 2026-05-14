'use client';

import { useState } from 'react';
import type { Earthquake } from '@/types/earthquake';
import { formatDateTh } from '@/lib/formatters';

interface SituationSummaryProps {
  earthquakes: Earthquake[];
}

const THAI_REFERENCE_POINTS = [
  { name: 'กรุงเทพฯ', lat: 13.7563, lng: 100.5018 },
  { name: 'เชียงใหม่', lat: 18.7883, lng: 98.9853 },
  { name: 'แม่สาย', lat: 20.4335, lng: 99.884 },
  { name: 'ภูเก็ต', lat: 7.8804, lng: 98.3923 },
];

const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const radius = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const findNearestThailandPoint = (earthquakes: Earthquake[]) => {
  let nearest: {
    earthquake: Earthquake;
    pointName: string;
    distance: number;
  } | null = null;

  for (const earthquake of earthquakes) {
    for (const point of THAI_REFERENCE_POINTS) {
      const distance = distanceKm(point.lat, point.lng, earthquake.lat, earthquake.lng);
      if (!nearest || distance < nearest.distance) {
        nearest = { earthquake, pointName: point.name, distance };
      }
    }
  }

  return nearest;
};

const findNearestByThaiPoint = (earthquakes: Earthquake[]) =>
  THAI_REFERENCE_POINTS.map((point) => {
    let nearest: { earthquake: Earthquake; distance: number } | null = null;

    for (const earthquake of earthquakes) {
      const distance = distanceKm(point.lat, point.lng, earthquake.lat, earthquake.lng);
      if (!nearest || distance < nearest.distance) {
        nearest = { earthquake, distance };
      }
    }

    return { pointName: point.name, nearest };
  });

const getSeverityLabel = (magnitude: number) => {
  if (magnitude >= 5) return { label: 'สูง', className: 'bg-red-500/15 text-red-700 ring-red-200' };
  if (magnitude >= 3) return { label: 'กลาง', className: 'bg-orange-500/15 text-orange-700 ring-orange-200' };
  return { label: 'ต่ำ', className: 'bg-sky-500/15 text-sky-700 ring-sky-200' };
};

export default function SituationSummary({
  earthquakes,
}: SituationSummaryProps) {
  const [isThailandOpen, setIsThailandOpen] = useState(false);
  const highCount = earthquakes.filter((eq) => eq.magnitude >= 5).length;
  const latest = earthquakes.length
    ? earthquakes.reduce((current, eq) => (eq.time > current.time ? eq : current), earthquakes[0])
    : null;
  const strongest = earthquakes.length
    ? earthquakes.reduce((current, eq) => (eq.magnitude > current.magnitude ? eq : current), earthquakes[0])
    : null;
  const nearest = findNearestThailandPoint(earthquakes);
  const nearestByPoint = findNearestByThaiPoint(earthquakes);

  const impactText = nearest
    ? nearest.distance <= 500
      ? 'ควรติดตามใกล้ชิด'
      : nearest.distance <= 1000
        ? 'เฝ้าดูภูมิภาคใกล้ไทย'
        : 'ยังห่างจากไทย'
    : 'ยังไม่มีข้อมูล';

  return (
    <section className="relative overflow-hidden rounded-lg border border-white/55 bg-white/60 p-4 shadow-xl shadow-blue-950/10 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_94%_4%,rgba(249,115,22,0.18),transparent_30%)]" />
      <div className="relative">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-blue-950">สรุปสถานการณ์</h2>
            <p className="mt-1 text-sm text-slate-600">
              ภาพรวมจากข้อมูลที่เลือก พร้อมประเมินระยะใกล้ประเทศไทยแบบเบื้องต้น
            </p>
          </div>
          <div className="rounded-lg bg-orange-50/90 px-3 py-2 text-xs font-medium text-orange-800 ring-1 ring-orange-200">
            แอปนี้ไม่ใช่ระบบแจ้งเตือนภัยอย่างเป็นทางการ
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="จำนวนเหตุการณ์"
            value={`${earthquakes.length} รายการ`}
            detail={`M5.0 ขึ้นไป ${highCount} รายการ`}
            tone="blue"
          />
          <SummaryCard
            label="เหตุการณ์ล่าสุด"
            value={latest ? `M${latest.magnitude.toFixed(1)}` : '-'}
            detail={latest ? `${latest.place} • ${formatDateTh(latest.time)}` : 'ยังไม่มีข้อมูล'}
            tone="sky"
          />
          <SummaryCard
            label="รุนแรงที่สุด"
            value={strongest ? `M${strongest.magnitude.toFixed(1)}` : '-'}
            detail={strongest ? `${strongest.place} • ลึก ${strongest.depth.toFixed(1)} กม. • ${formatDateTh(strongest.time)}` : 'ยังไม่มีข้อมูล'}
            tone="orange"
          />
          <SummaryCard
            label="ใกล้ประเทศไทย"
            value={nearest ? `${Math.round(nearest.distance).toLocaleString('th-TH')} กม.` : '-'}
            detail={nearest ? `${nearest.earthquake.place} • ใกล้${nearest.pointName} • ${impactText} • ${formatDateTh(nearest.earthquake.time)}` : 'ยังไม่มีข้อมูล'}
            tone="violet"
          />
        </div>

        {nearestByPoint.some((item) => item.nearest) && (
          <div className="mt-4 rounded-xl border border-white/60 bg-white/62 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-blue-950">ใกล้ประเทศไทยรอบทิศ</h3>
                <p className="text-xs text-slate-600">
                  แสดงเหตุการณ์ที่ใกล้จุดอ้างอิงในไทยแต่ละตำแหน่ง พร้อมขนาดและระดับความรุนแรง
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsThailandOpen((value) => !value)}
                aria-expanded={isThailandOpen}
                aria-label={isThailandOpen ? 'ยุบส่วนใกล้ประเทศไทยรอบทิศ' : 'ขยายส่วนใกล้ประเทศไทยรอบทิศ'}
                title={isThailandOpen ? 'ยุบ' : 'ขยาย'}
                className="inline-flex h-9 w-9 items-center justify-center self-start rounded-lg bg-blue-700 text-base font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:self-auto"
              >
                <span aria-hidden="true">{isThailandOpen ? '↑' : '↓'}</span>
              </button>
            </div>

            <div className={`mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4 ${isThailandOpen ? '' : 'hidden'}`}>
              {nearestByPoint.map(({ nearest, pointName }) => {
                if (!nearest) {
                  return (
                    <div key={pointName} className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
                      <div className="text-xs font-semibold text-slate-500">{pointName}</div>
                      <div className="mt-2 text-sm text-slate-500">ยังไม่มีข้อมูล</div>
                    </div>
                  );
                }

                const severity = getSeverityLabel(nearest.earthquake.magnitude);

                return (
                  <div
                    key={pointName}
                    className="rounded-lg bg-gradient-to-br from-blue-50/95 to-orange-50/80 p-3 ring-1 ring-blue-100"
                  >
                    <div className="text-xs font-semibold text-blue-900">{pointName}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-blue-950">
                        M{nearest.earthquake.magnitude.toFixed(1)}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${severity.className}`}>
                        {severity.label}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-orange-700">
                      {Math.round(nearest.distance).toLocaleString('th-TH')} กม.
                    </div>
                    <div className="mt-1 text-xs font-medium text-blue-800">
                      {formatDateTh(nearest.earthquake.time)}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-700">
                      {nearest.earthquake.place}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone: 'blue' | 'sky' | 'orange' | 'violet';
  value: string;
}) {
  const tones = {
    blue: 'from-blue-900 to-blue-700 text-blue-50',
    sky: 'from-sky-800 to-cyan-600 text-sky-50',
    orange: 'from-orange-700 to-amber-500 text-orange-50',
    violet: 'from-violet-800 to-blue-700 text-violet-50',
  };

  return (
    <div className={`rounded-xl bg-gradient-to-br ${tones[tone]} p-4 shadow-lg shadow-blue-950/10`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="mt-2 line-clamp-3 text-xs leading-5 opacity-90">{detail}</div>
    </div>
  );
}
