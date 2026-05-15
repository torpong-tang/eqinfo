import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

type FeatureCollection = {
  type: 'FeatureCollection';
  features: unknown[];
};

const THAILAND_URL = 'https://geojson-maps.kyd.au/countries/110m/THA.geojson';
const LOCAL_GEOJSON_PATH = path.join(process.cwd(), 'public', 'data', 'thailand.geojson');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cached: { data: FeatureCollection; at: number } | null = null;
let inflight: Promise<FeatureCollection> | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const loadLocalThailandGeoJson = async (): Promise<FeatureCollection> => {
  const file = await readFile(LOCAL_GEOJSON_PATH, 'utf8');
  const data = JSON.parse(file) as unknown;

  if (!isRecord(data) || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    return { type: 'FeatureCollection', features: [] };
  }

  return data as FeatureCollection;
};

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
      inflight = loadLocalThailandGeoJson().catch(() => loadThailandGeoJson()).finally(() => {
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
