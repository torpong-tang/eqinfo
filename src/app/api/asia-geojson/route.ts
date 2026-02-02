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
const SIMPLIFY_TOLERANCE = 0.3;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isFeature = (value: unknown): value is { type: 'Feature' } =>
  isRecord(value) && value.type === 'Feature';

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

type Position = [number, number];
type Ring = Position[];
type PolygonCoords = Ring[];
type MultiPolygonCoords = Ring[][];

const isPosition = (value: unknown): value is Position =>
  Array.isArray(value) && value.length >= 2 && isNumber(value[0]) && isNumber(value[1]);

const isRing = (value: unknown): value is Ring =>
  Array.isArray(value) && value.length >= 4 && value.every(isPosition);

const isPolygonCoords = (value: unknown): value is PolygonCoords =>
  Array.isArray(value) && value.every(isRing);

const isMultiPolygonCoords = (value: unknown): value is MultiPolygonCoords =>
  Array.isArray(value) && value.every((polygon) => Array.isArray(polygon) && polygon.every(isRing));

const getSqSegDist = (p: Position, p1: Position, p2: Position) => {
  let x = p1[0];
  let y = p1[1];
  let dx = p2[0] - x;
  let dy = p2[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
};

const simplifyRdp = (points: Position[], tolerance: number) => {
  if (points.length <= 2) return points;
  const sqTolerance = tolerance * tolerance;
  const markers = new Uint8Array(points.length);
  markers[0] = 1;
  markers[points.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, points.length - 1]];

  while (stack.length) {
    const [first, last] = stack.pop() as [number, number];
    let maxSqDist = 0;
    let index = 0;
    for (let i = first + 1; i < last; i += 1) {
      const sqDist = getSqSegDist(points[i], points[first], points[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }
    if (maxSqDist > sqTolerance) {
      markers[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  const result: Position[] = [];
  for (let i = 0; i < points.length; i += 1) {
    if (markers[i]) result.push(points[i]);
  }
  return result;
};

const simplifyRing = (ring: Ring, tolerance: number): Ring => {
  const isClosed = ring.length > 0 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
  const openRing = isClosed ? ring.slice(0, -1) : ring;
  const simplified = simplifyRdp(openRing, tolerance);
  const safe = simplified.length >= 3 ? simplified : openRing;
  return [...safe, safe[0]];
};

const simplifyPolygon = (coords: PolygonCoords, tolerance: number): PolygonCoords =>
  coords.map((ring) => simplifyRing(ring, tolerance)).filter((ring) => ring.length >= 4);

const simplifyMultiPolygon = (coords: MultiPolygonCoords, tolerance: number): MultiPolygonCoords =>
  coords.map((polygon) => simplifyPolygon(polygon, tolerance)).filter((polygon) => polygon.length > 0);

const simplifyFeature = (feature: { type: 'Feature'; geometry?: unknown }, tolerance: number) => {
  if (!isRecord(feature.geometry) || typeof feature.geometry.type !== 'string') return feature;
  const geometry = feature.geometry;

  if (geometry.type === 'Polygon' && isPolygonCoords(geometry.coordinates)) {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: simplifyPolygon(geometry.coordinates, tolerance)
      }
    };
  }

  if (geometry.type === 'MultiPolygon' && isMultiPolygonCoords(geometry.coordinates)) {
    return {
      ...feature,
      geometry: {
        ...geometry,
        coordinates: simplifyMultiPolygon(geometry.coordinates, tolerance)
      }
    };
  }

  return feature;
};

const loadAsiaGeoJson = async (): Promise<FeatureCollection> => {
  const response = await fetch(INDEX_URL);
  const index = (await response.json()) as unknown;
  const asiaIndex = isRecord(index) && isRecord(index.Asia) ? index.Asia : null;
  if (!asiaIndex) {
    return { type: 'FeatureCollection', features: [] };
  }

  const filenames = Object.values(asiaIndex).filter((value): value is string => typeof value === 'string');
  const features = await Promise.all(
    filenames.map(async (filename) => {
      const fileResponse = await fetch(`${BASE_URL}${filename}`);
      return (await fileResponse.json()) as unknown;
    })
  );

  const simplified = features
    .filter(isFeature)
    .map((feature) => simplifyFeature(feature, SIMPLIFY_TOLERANCE));

  return {
    type: 'FeatureCollection',
    features: simplified
  };
};

export async function GET() {
  try {
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, max-age=86400' }
      });
    }

    if (!inflight) {
      inflight = loadAsiaGeoJson().finally(() => {
        inflight = null;
      });
    }

    const data = await inflight;
    cached = { data, at: Date.now() };
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=86400' }
    });
  } catch (error) {
    console.error('Error fetching Asia GeoJSON:', error);
    return NextResponse.json({ error: 'Failed to fetch Asia boundary' }, { status: 500 });
  }
}
