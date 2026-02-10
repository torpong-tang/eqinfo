export const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export const isNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

export const isCoordinateArray = (value: unknown): value is [number, number, number] =>
    Array.isArray(value) && value.length >= 3 && value.every(isNumber);

export interface UsgsFeature {
    id: string;
    properties: {
        mag: number | null;
        place?: string;
        time: number;
        url?: string;
    };
    geometry: {
        coordinates: [number, number, number];
    };
}

export const isUsgsFeature = (value: unknown): value is UsgsFeature => {
    if (!isRecord(value)) return false;
    if (typeof value.id !== 'string') return false;
    if (!isRecord(value.properties) || !isNumber(value.properties.time)) return false;
    if (!isRecord(value.geometry) || !isCoordinateArray(value.geometry.coordinates)) return false;
    if (value.properties.mag !== null && typeof value.properties.mag !== 'number') return false;
    return true;
};

export const parseUsgsFeatures = (data: unknown) => {
    if (!isRecord(data) || !Array.isArray(data.features)) {
        return { features: [] as UsgsFeature[], hasInvalid: true };
    }
    const features = data.features.filter(isUsgsFeature);
    return { features, hasInvalid: features.length !== data.features.length };
};

export const isFeature = (value: unknown): value is { type: 'Feature' } =>
    isRecord(value) && value.type === 'Feature';
