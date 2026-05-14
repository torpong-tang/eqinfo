import { NextResponse } from 'next/server';

type FeatureCollection = {
  type: 'FeatureCollection';
  features: unknown[];
};

const THAILAND_URL = 'https://geojson-maps.kyd.au/countries/110m/THA.geojson';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cached: { data: FeatureCollection; at: number } | null = null;
let inflight: Promise<FeatureCollection> | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const loadThailandGeoJson = async (): Promise<FeatureCollection> => {
  const response = await fetch(THAILAND_URL);
  const feature = (await response.json()) as unknown;

  if (!isRecord(feature) || feature.type !== 'Feature') {
    return { type: 'FeatureCollection', features: [] };
  }

  return {
    type: 'FeatureCollection',
    features: [feature],
  };
};

export async function GET() {
  try {
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, max-age=86400' },
      });
    }

    if (!inflight) {
      inflight = loadThailandGeoJson().finally(() => {
        inflight = null;
      });
    }

    const data = await inflight;
    cached = { data, at: Date.now() };
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (error) {
    console.error('Error fetching Thailand GeoJSON:', error);
    return NextResponse.json({ error: 'Failed to fetch Thailand boundary' }, { status: 500 });
  }
}
