import type { Metadata } from "next";
import { Geist_Mono, Prompt } from "next/font/google";
import "./globals.css";
import ApiBasePathPatch from "@/components/ApiBasePathPatch";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "ข้อมูลแผ่นดินไหว | EQInfo",
  description: "ระบบแสดงข้อมูลแผ่นดินไหวแบบเรียลไทม์จากหลายแหล่งข้อมูล (USGS, TMD, EMSC) พร้อมแผนที่แสดงตำแหน่งและรายละเอียด",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${prompt.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ApiBasePathPatch />
        {children}
      </body>
    </html>
  );
}
