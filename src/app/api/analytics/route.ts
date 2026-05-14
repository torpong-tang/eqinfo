import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { DATA_SOURCES, type DataSource } from '@/types/earthquake';
import { isRecord } from '@/lib/typeGuards';

type ConcreteDataSource = Exclude<DataSource, null>;

interface AnalyticsStats {
  pageViews: number;
  sourceSelections: Record<ConcreteDataSource, number>;
  updatedAt: number | null;
}

const dataDir = path.join(process.cwd(), '.data');
const dataFile = path.join(dataDir, 'analytics.json');
const sourceKeys = DATA_SOURCES.map((source) => source.key) as ConcreteDataSource[];
let writeQueue = Promise.resolve();

const createEmptyStats = (): AnalyticsStats => ({
  pageViews: 0,
  sourceSelections: sourceKeys.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<ConcreteDataSource, number>),
  updatedAt: null,
});

const normalizeStats = (value: unknown): AnalyticsStats => {
  const empty = createEmptyStats();
  if (!isRecord(value)) return empty;

  const stats = {
    ...empty,
    pageViews: typeof value.pageViews === 'number' ? value.pageViews : 0,
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : null,
  };

  if (isRecord(value.sourceSelections)) {
    for (const key of sourceKeys) {
      const count = value.sourceSelections[key];
      stats.sourceSelections[key] = typeof count === 'number' ? count : 0;
    }
  }

  return stats;
};

const readStats = async () => {
  try {
    const text = await readFile(dataFile, 'utf8');
    return normalizeStats(JSON.parse(text) as unknown);
  } catch {
    return createEmptyStats();
  }
};

const writeStats = async (stats: AnalyticsStats) => {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');
};

export async function GET() {
  const stats = await readStats();
  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as unknown;

  const stats = await new Promise<AnalyticsStats>((resolve, reject) => {
    writeQueue = writeQueue
      .then(async () => {
        const nextStats = await readStats();

        if (isRecord(body) && body.event === 'page_view') {
          nextStats.pageViews += 1;
        }

        if (isRecord(body) && body.event === 'source_select' && typeof body.source === 'string') {
          const source = body.source as ConcreteDataSource;
          if (sourceKeys.includes(source)) {
            nextStats.sourceSelections[source] += 1;
          }
        }

        nextStats.updatedAt = Date.now();
        await writeStats(nextStats);
        resolve(nextStats);
      })
      .catch(reject);
  });

  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
