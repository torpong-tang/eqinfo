export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  lat: number;
  lng: number;
  depth: number;
  url: string;
}

export type DataSource = 'usgs-world' | 'usgs-asia' | 'tmd' | 'emsc' | null;

export interface DataSourceConfig {
  key: DataSource;
  label: string;
  emoji: string;
  description: string;
  timeRange: string;
}

export const DATA_SOURCES: DataSourceConfig[] = [
  {
    key: 'usgs-world',
    emoji: '🌍',
    label: 'USGS ทั่วโลก',
    description: 'ข้อมูลจาก USGS ทั่วโลก',
    timeRange: '24 ชม.',
  },
  {
    key: 'usgs-asia',
    emoji: '🌏',
    label: 'USGS เอเชีย',
    description: 'ข้อมูลจาก USGS เฉพาะเอเชีย',
    timeRange: '240 ชม.',
  },
  {
    key: 'tmd',
    emoji: '🇹🇭',
    label: 'TMD ประเทศไทย',
    description: 'กรมอุตุนิยมวิทยา ประเทศไทย',
    timeRange: 'ล่าสุด',
  },
  {
    key: 'emsc',
    emoji: '🇪🇺',
    label: 'EMSC ยุโรป-เมดิเตอร์เรเนียน',
    description: 'ศูนย์แผ่นดินไหวยุโรป-เมดิเตอร์เรเนียน',
    timeRange: '24 ชม.',
  },
];

export interface MapViewState {
  center: [number, number];
  zoom: number;
}

export interface FetchError {
  message: string;
  source: DataSource;
}
