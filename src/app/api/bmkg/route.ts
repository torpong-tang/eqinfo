import { NextResponse } from 'next/server';
import type { Earthquake } from '@/types/earthquake';
import { isRecord } from '@/lib/typeGuards';

const BMKG_ENDPOINTS = [
    'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json',
    'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
    'https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json',
];

interface BmkgEvent {
    DateTime?: string;
    Coordinates?: string;
    Magnitude?: string;
    Kedalaman?: string;
    Wilayah?: string;
    Dirasakan?: string;
    Potensi?: string;
}

const isBmkgEvent = (value: unknown): value is BmkgEvent =>
    isRecord(value);

const extractBmkgEvents = (payload: unknown): BmkgEvent[] => {
    if (!isRecord(payload) || !isRecord(payload.Infogempa)) return [];
    const raw = payload.Infogempa.gempa;
    if (Array.isArray(raw)) return raw.filter(isBmkgEvent);
    return isBmkgEvent(raw) ? [raw] : [];
};

const parseCoordinatePair = (value?: string) => {
    if (!value) return null;
    const [latText, lngText] = value.split(',').map((part) => part.trim());
    const lat = Number(latText);
    const lng = Number(lngText);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
};

const parseDepth = (value?: string) => {
    if (!value) return 0;
    const depth = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(depth) ? Math.abs(depth) : 0;
};

const normalizeBmkgEvent = (event: BmkgEvent): Earthquake | null => {
    const coords = parseCoordinatePair(event.Coordinates);
    const magnitude = Number(event.Magnitude);
    const time = event.DateTime ? new Date(event.DateTime).getTime() : NaN;

    if (!coords || !Number.isFinite(magnitude) || !Number.isFinite(time)) {
        return null;
    }

    const detail = [event.Wilayah, event.Potensi, event.Dirasakan]
        .filter((item): item is string => typeof item === 'string' && item.length > 0)
        .join(' • ');
    const idSeed = `${event.DateTime}-${event.Coordinates}-${event.Magnitude}`;

    return {
        id: `bmkg-${Buffer.from(idSeed).toString('base64url')}`,
        magnitude,
        place: detail || 'Indonesia',
        time,
        lat: coords.lat,
        lng: coords.lng,
        depth: parseDepth(event.Kedalaman),
        url: 'https://www.bmkg.go.id/gempabumi',
    };
};

export async function GET() {
    try {
        const cutoff = Date.now() - 240 * 60 * 60 * 1000;
        const responses = await Promise.allSettled(
            BMKG_ENDPOINTS.map((url) =>
                fetch(url, { next: { revalidate: 300 } }).then((response) => {
                    if (!response.ok) throw new Error(`BMKG request failed: ${response.status}`);
                    return response.json().then((payload) => ({
                        lastModified: response.headers.get('last-modified'),
                        payload: payload as unknown,
                    }));
                })
            )
        );

        const seen = new Set<string>();
        const earthquakes: Earthquake[] = [];
        let sourceUpdatedAt: number | null = null;

        for (const result of responses) {
            if (result.status !== 'fulfilled') continue;
            if (result.value.lastModified) {
                const timestamp = new Date(result.value.lastModified).getTime();
                if (Number.isFinite(timestamp)) {
                    sourceUpdatedAt = sourceUpdatedAt === null ? timestamp : Math.max(sourceUpdatedAt, timestamp);
                }
            }
            for (const event of extractBmkgEvents(result.value.payload)) {
                const normalized = normalizeBmkgEvent(event);
                if (!normalized || normalized.time < cutoff || seen.has(normalized.id)) continue;
                seen.add(normalized.id);
                earthquakes.push(normalized);
            }
        }

        earthquakes.sort((a, b) => b.time - a.time);

        return NextResponse.json(earthquakes, {
            headers: {
                'Cache-Control': 'public, max-age=300',
                ...(sourceUpdatedAt ? { 'X-Source-Updated-At': new Date(sourceUpdatedAt).toISOString() } : {}),
            },
        });
    } catch (error) {
        console.error('Error fetching BMKG data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch BMKG earthquake data' },
            { status: 500 }
        );
    }
}
