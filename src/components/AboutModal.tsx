'use client';

import { useCallback, useEffect } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const dataSources = [
  {
    name: 'USGS',
    description: 'บริการข้อมูลแผ่นดินไหวจาก United States Geological Survey ใช้เป็นแหล่งข้อมูลสากลสำหรับเหตุการณ์ทั่วโลกและเอเชีย',
    url: 'https://earthquake.usgs.gov/',
  },
  {
    name: 'GFZ GEOFON',
    description: 'เครือข่ายข้อมูลแผ่นดินไหวจาก GFZ German Research Centre for Geosciences ใช้เปรียบเทียบเหตุการณ์ในภูมิภาคเอเชีย',
    url: 'https://geofon.gfz.de/',
  },
  {
    name: 'BMKG',
    description: 'ข้อมูลจากหน่วยงานอุตุนิยมวิทยา ภูมิอากาศ และธรณีฟิสิกส์ของอินโดนีเซีย เหมาะกับการติดตามเหตุการณ์ใกล้สุมาตราและภูมิภาคอินโดนีเซีย',
    url: 'https://www.bmkg.go.id/',
  },
  {
    name: 'TMD',
    description: 'ข้อมูลจากกรมอุตุนิยมวิทยา ประเทศไทย ใช้ติดตามเหตุการณ์ที่เกี่ยวข้องกับประเทศไทย',
    url: 'https://earthquake.tmd.go.th/',
  },
  {
    name: 'EMSC',
    description: 'ข้อมูลจาก European-Mediterranean Seismological Centre ใช้เป็นแหล่งข้อมูลเสริมสำหรับเหตุการณ์ในยุโรปและเมดิเตอร์เรเนียน',
    url: 'https://www.emsc-csem.org/',
  },
];

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-blue-950/70 px-4 py-6 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/45 bg-white/88 shadow-2xl shadow-blue-950/35 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 bg-[linear-gradient(135deg,rgba(30,64,175,0.95),rgba(249,115,22,0.78))] px-5 py-4 text-white">
          <div>
            <h2 className="text-xl font-bold">About EQInfo</h2>
            <p className="mt-1 text-sm text-blue-50">ระบบรวมข้อมูลแผ่นดินไหวจากหลายแหล่งเพื่อดูภาพรวมบนแผนที่และตาราง</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด About"
            className="rounded-full bg-white/16 px-3 py-1.5 text-lg leading-none text-white ring-1 ring-white/35 transition hover:bg-white/25"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-5 text-sm text-slate-800">
          <section className="rounded-xl bg-blue-50/80 p-4 ring-1 ring-blue-100">
            <h3 className="font-semibold text-blue-950">แอปนี้ทำอะไร</h3>
            <p className="mt-2 leading-6">
              EQInfo ใช้สำหรับติดตามข้อมูลแผ่นดินไหวล่าสุดจากหลายหน่วยงาน แสดงตำแหน่งบนแผนที่
              พร้อมตารางค้นหา กรองระดับความรุนแรง และเรียงลำดับข้อมูล เพื่อช่วยให้ดูภาพรวมเหตุการณ์ได้เร็วขึ้น
            </p>
          </section>

          <section className="mt-4">
            <h3 className="font-semibold text-blue-950">แหล่งข้อมูลและความน่าเชื่อถือ</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {dataSources.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/70 bg-white/72 p-4 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/70"
                >
                  <div className="font-semibold text-blue-900">{source.name}</div>
                  <p className="mt-1 leading-6 text-slate-700">{source.description}</p>
                </a>
              ))}
            </div>
            <p className="mt-3 leading-6 text-slate-600">
              ข้อมูลในแอปมาจาก API หรือ feed สาธารณะของหน่วยงานที่เกี่ยวข้องโดยตรง จึงเหมาะสำหรับการติดตามและวิเคราะห์เบื้องต้น
              อย่างไรก็ตาม สำหรับการแจ้งเตือนภัยหรือการตัดสินใจด้านความปลอดภัย ควรอ้างอิงประกาศทางการจากหน่วยงานรัฐในพื้นที่เสมอ
            </p>
          </section>

          <section className="mt-4 rounded-xl bg-orange-50/80 p-4 ring-1 ring-orange-100">
            <h3 className="font-semibold text-orange-900">Cookies และการจัดเก็บข้อมูล</h3>
            <p className="mt-2 leading-6 text-slate-700">
              จากการทำงานปัจจุบัน แอปนี้ไม่จำเป็นต้องใช้ cookies เพราะไม่ได้มีระบบล็อกอิน ไม่ได้บันทึก session ผู้ใช้
              และไม่ได้เก็บข้อมูลส่วนบุคคลบนเบราว์เซอร์ การเลือก source/filter เป็น state ชั่วคราวในหน้าเว็บเท่านั้น
            </p>
            <p className="mt-2 leading-6 text-slate-700">
              ถ้าในอนาคตเพิ่ม analytics, จำค่าการตั้งค่าผู้ใช้, หรือระบบบัญชีผู้ใช้ ค่อยเพิ่ม cookie/privacy notice ให้เหมาะสมครับ
            </p>
          </section>

          <section className="mt-4 rounded-xl bg-white/76 p-4 ring-1 ring-blue-100">
            <h3 className="font-semibold text-blue-950">ติดต่อผู้จัดทำ</h3>
            <p className="mt-2 leading-6 text-slate-700">
              ผู้จัดทำ: TPT Team
            </p>
            <p className="mt-1 leading-6 text-slate-700">
              ติดต่อเรื่องการแจ้งปัญหาข้อมูล เสนอแนะฟีเจอร์ หรือแจ้ง bug ได้ที่{' '}
              <a
                href="mailto:torpong.t@gmail.com"
                className="font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-orange-600"
              >
                torpong.t@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="flex justify-end border-t border-blue-100 bg-white/75 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
