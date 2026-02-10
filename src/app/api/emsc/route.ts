import { NextResponse } from 'next/server';
import type { Earthquake } from '@/types/earthquake';
import { isRecord, isNumber } from '@/lib/typeGuards';

interface EmscProperties {
    flynn_region?: string;
    time?: string;
    lat?: number;
    lon?: number;
    depth?: number;
    mag?: number;
    unid?: string;
    source_id?: string;
}

const isEmscProperties = (value: unknown): value is EmscProperties =>
    isRecord(value);

export async function GET() {
    try {
        const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const response = await fetch(
            `https://www.seismicportal.eu/fdsnws/event/1/query?limit=500&format=json&orderby=time&start=${startTime}`,
            { next: { revalidate: 300 } }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch EMSC data' },
                { status: response.status }
            );
        }

        const rawData = (await response.json()) as unknown;
        if (!isRecord(rawData) || !Array.isArray(rawData.features)) {
            return NextResponse.json([]);
        }

        const earthquakes: Earthquake[] = [];

        for (const feature of rawData.features) {
            if (!isRecord(feature) || !isEmscProperties(feature.properties)) continue;
            const props = feature.properties;

            const mag = isNumber(props.mag) ? props.mag : null;
            const lat = isNumber(props.lat) ? props.lat : null;
            const lon = isNumber(props.lon) ? props.lon : null;
            const depth = isNumber(props.depth) ? props.depth : 0;

            if (mag === null || lat === null || lon === null) continue;

            const id = typeof props.unid === 'string'
                ? props.unid
                : typeof props.source_id === 'string'
                    ? `emsc-${props.source_id}`
                    : `emsc-${earthquakes.length}`;

            earthquakes.push({
                id,
                magnitude: mag,
                place: typeof props.flynn_region === 'string' ? props.flynn_region : 'Unknown',
                time: typeof props.time === 'string' ? new Date(props.time).getTime() : Date.now(),
                lat,
                lng: lon,
                depth: Math.abs(depth),
                url: `https://www.seismicportal.eu/eventdetails.html?unid=${id}`,
            });
        }

        return NextResponse.json(earthquakes, {
            headers: { 'Cache-Control': 'public, max-age=300' },
        });
    } catch (error) {
        console.error('Error fetching EMSC data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch EMSC earthquake data' },
            { status: 500 }
        );
    }
}
