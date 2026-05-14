import { NextResponse } from 'next/server';
import type { Earthquake } from '@/types/earthquake';

const ASIA_QUERY = {
    minlat: 1,
    maxlat: 77,
    minlon: 26,
    maxlon: 170,
};

const parseGeofonLine = (line: string): Earthquake | null => {
    if (!line || line.startsWith('#')) return null;

    const columns = line.split('|');
    if (columns.length < 13) return null;

    const [
        id,
        timeText,
        latText,
        lngText,
        depthText,
        ,
        ,
        ,
        ,
        ,
        magnitudeText,
        ,
        placeText,
    ] = columns;

    const time = new Date(timeText).getTime();
    const lat = Number(latText);
    const lng = Number(lngText);
    const depth = Number(depthText);
    const magnitude = Number(magnitudeText);

    if (!id || !Number.isFinite(time) || !Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(magnitude)) {
        return null;
    }

    return {
        id: `geofon-${id}`,
        magnitude,
        place: placeText || 'Unknown',
        time,
        lat,
        lng,
        depth: Number.isFinite(depth) ? Math.abs(depth) : 0,
        url: `https://geofon.gfz.de/eqinfo/event.php?id=${encodeURIComponent(id)}`,
    };
};

export async function GET() {
    try {
        const startTime = new Date(Date.now() - 240 * 60 * 60 * 1000).toISOString();
        const params = new URLSearchParams({
            format: 'text',
            orderby: 'time',
            starttime: startTime,
            minlat: String(ASIA_QUERY.minlat),
            maxlat: String(ASIA_QUERY.maxlat),
            minlon: String(ASIA_QUERY.minlon),
            maxlon: String(ASIA_QUERY.maxlon),
        });

        const response = await fetch(`https://geofon.gfz.de/fdsnws/event/1/query?${params}`, {
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch GEOFON data' },
                { status: response.status }
            );
        }

        const text = await response.text();
        const earthquakes = text
            .split(/\r?\n/)
            .map(parseGeofonLine)
            .filter((event): event is Earthquake => event !== null);

        return NextResponse.json(earthquakes, {
            headers: { 'Cache-Control': 'public, max-age=300' },
        });
    } catch (error) {
        console.error('Error fetching GEOFON data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GEOFON earthquake data' },
            { status: 500 }
        );
    }
}
