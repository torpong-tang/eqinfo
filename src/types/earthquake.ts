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

export type DataSource = 'thai' | 'asia' | null;

export interface MapViewState {
  center: [number, number];
  zoom: number;
}