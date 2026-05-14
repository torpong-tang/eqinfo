import { NextResponse } from 'next/server';

type FeatureCollection = {
  type: 'FeatureCollection';
  features: unknown[];
};

const INDEX_URL = 'https://geojson-maps.kyd.au/countries/110m/index.json';
const BASE_URL = 'https://geojson-maps.kyd.au/countries/110m/';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cached: { data: FeatureCollection; at: number } | null = null;
let inflight: Promise<FeatureCollection> | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isFeature = (value: unknown): value is { type: 'Feature'; properties?: unknown } =>
  isRecord(value) && value.type === 'Feature';

const loadContinentsGeoJson = async (): Promise<FeatureCollection> => {
  const response = await fetch(INDEX_URL);
  const index = (await response.json()) as unknown;

  if (!isRecord(index)) {
    return { type: 'FeatureCollection', features: [] };
  }

  const entries = Object.entries(index).flatMap(([continent, countries]) => {
    if (!isRecord(countries)) return [];
    return Object.values(countries)
      .filter((filename): filename is string => typeof filename === 'string')
      .map((filename) => ({ continent, filename }));
  });

  const features = await Promise.all(
    entries.map(async ({ continent, filename }) => {
      const fileResponse = await fetch(`${BASE_URL}${filename}`);
      const feature = (await fileResponse.json()) as unknown;
      if (!isFeature(feature)) return null;

      return {
        ...feature,
        properties: {
          ...(isRecord(feature.properties) ? feature.properties : {}),
          continent,
        },
      };
    })
  );

  return {
    type: 'FeatureCollection',
    features: features.filter(Boolean),
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
      inflight = loadContinentsGeoJson().finally(() => {
        inflight = null;
      });
    }

    const data = await inflight;
    cached = { data, at: Date.now() };
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (error) {
    console.error('Error fetching continents GeoJSON:', error);
    return NextResponse.json({ error: 'Failed to fetch continent boundaries' }, { status: 500 });
  }
}
