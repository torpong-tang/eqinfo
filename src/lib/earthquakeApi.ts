import type { Earthquake, DataSource, MapViewState } from '@/types/earthquake';
import { isRecord, parseUsgsFeatures } from '@/lib/typeGuards';

export interface EarthquakeFetchResult {
    earthquakes: Earthquake[];
    sourceUpdatedAt: number | null;
}

const getStartTime = (hoursAgo: number) =>
    new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

const normalizeUsgsFeatures = (data: unknown): Earthquake[] => {
    const { features, hasInvalid } = parseUsgsFeatures(data);
    if (hasInvalid) {
        console.warn('Some USGS features were invalid and skipped.');
    }
    return features.map((f) => ({
        id: f.id,
        magnitude: typeof f.properties.mag === 'number' ? f.properties.mag : 0,
        place: f.properties.place || 'ไม่ทราบสถานที่',
        time: f.properties.time,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2],
        url: f.properties.url || '#',
    }));
};

const getUsgsGeneratedTime = (data: unknown) => {
    if (!isRecord(data) || !isRecord(data.metadata)) return null;
    const generated = data.metadata.generated;
    return typeof generated === 'number' && Number.isFinite(generated) ? generated : null;
};

const fetchUsgsWorld = async (signal?: AbortSignal): Promise<EarthquakeFetchResult> => {
    const startTime = getStartTime(24);
    const res = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time&starttime=${startTime}`,
        { signal }
    );
    const data = await res.json();
    return {
        earthquakes: normalizeUsgsFeatures(data),
        sourceUpdatedAt: getUsgsGeneratedTime(data),
    };
};

const fetchUsgsAsia = async (signal?: AbortSignal): Promise<EarthquakeFetchResult> => {
    const startTime = getStartTime(240);
    const res = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=1&maxlatitude=77&minlongitude=26&maxlongitude=170&orderby=time&starttime=${startTime}`,
        { signal }
    );
    const data = await res.json();
    return {
        earthquakes: normalizeUsgsFeatures(data),
        sourceUpdatedAt: getUsgsGeneratedTime(data),
    };
};

const getSourceUpdatedAtHeader = (res: Response) => {
    const value = res.headers.get('x-source-updated-at');
    if (!value) return null;
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
};

const fetchGeofonAsia = async (signal?: AbortSignal): Promise<EarthquakeFetchResult> => {
    const res = await fetch('/api/geofon', { signal });
    const data = (await res.json()) as unknown;
    return {
        earthquakes: Array.isArray(data) ? filterEarthquakeItems(data) : [],
        sourceUpdatedAt: getSourceUpdatedAtHeader(res),
    };
};

const filterEarthquakeItems = (data: unknown[]): Earthquake[] =>
    data.filter(
        (item): item is Earthquake =>
            isRecord(item) &&
            typeof item.id === 'string' &&
            typeof item.magnitude === 'number' &&
            typeof item.lat === 'number'
    );

const fetchBmkg = async (signal?: AbortSignal): Promise<EarthquakeFetchResult> => {
    const res = await fetch('/api/bmkg', { signal });
    const data = (await res.json()) as unknown;
    return {
        earthquakes: Array.isArray(data) ? filterEarthquakeItems(data) : [],
        sourceUpdatedAt: getSourceUpdatedAtHeader(res),
    };
};

const fetchTmd = async (signal?: AbortSignal): Promise<EarthquakeFetchResult> => {
    const res = await fetch('/api/thai', { signal });
    const data = (await res.json()) as unknown;
    return {
        earthquakes: Array.isArray(data) ? filterEarthquakeItems(data) : [],
        sourceUpdatedAt: getSourceUpdatedAtHeader(res),
    };
};

const fetchEmsc = async (signal?: AbortSignal): Promise<EarthquakeFetchResult> => {
    const res = await fetch('/api/emsc', { signal });
    const data = (await res.json()) as unknown;
    return {
        earthquakes: Array.isArray(data) ? filterEarthquakeItems(data) : [],
        sourceUpdatedAt: getSourceUpdatedAtHeader(res),
    };
};

export const fetchEarthquakes = async (
    source: DataSource,
    signal?: AbortSignal
): Promise<EarthquakeFetchResult> => {
    switch (source) {
        case 'usgs-world':
            return fetchUsgsWorld(signal);
        case 'usgs-asia':
            return fetchUsgsAsia(signal);
        case 'geofon-asia':
            return fetchGeofonAsia(signal);
        case 'bmkg':
            return fetchBmkg(signal);
        case 'tmd':
            return fetchTmd(signal);
        case 'emsc':
            return fetchEmsc(signal);
        default:
            return { earthquakes: [], sourceUpdatedAt: null };
    }
};

export const getDefaultMapView = (source: DataSource): MapViewState => {
    switch (source) {
        case 'usgs-world':
            return { center: [10, 0], zoom: 2 };
        case 'usgs-asia':
            return { center: [25, 100], zoom: 3 };
        case 'geofon-asia':
            return { center: [25, 100], zoom: 3 };
        case 'bmkg':
            return { center: [-2, 118], zoom: 4 };
        case 'tmd':
            return { center: [13, 101], zoom: 5 };
        case 'emsc':
            return { center: [40, 20], zoom: 3 };
        default:
            return { center: [15, 0], zoom: 2 };
    }
};
