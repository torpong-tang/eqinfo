import { XMLParser } from 'fast-xml-parser';
import { NextResponse } from 'next/server';
import type { Earthquake } from '@/types/earthquake';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
});

interface RssItem {
  description?: string;
  title?: string;
  pubDate?: string;
  link?: string;
}

interface RssChannel {
  item?: RssItem | RssItem[];
}

interface RssResponse {
  rss?: {
    channel?: RssChannel;
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRssItem = (value: unknown): value is RssItem => isRecord(value);

export async function GET() {
  try {
    const response = await fetch('https://earthquake.tmd.go.th/feed/rss_tmd.xml');
    const xmlText = await response.text();
    const jsonData = parser.parse(xmlText) as RssResponse;
    
    const earthquakes: Earthquake[] = [];
    
    if (jsonData.rss && jsonData.rss.channel && jsonData.rss.channel.item) {
      const items = Array.isArray(jsonData.rss.channel.item)
        ? jsonData.rss.channel.item
        : [jsonData.rss.channel.item];

      items.filter(isRssItem).forEach((item, index) => {
        try {
          const description = item.description || '';
          const magnitudeMatch = description.match(/Magnitude\s*:\s*([\d.]+)/);
          const depthMatch = description.match(/Depth\s*:\s*([\d.]+)\s*km/);
          const latMatch = description.match(/Lat\s*:\s*([-\d.]+)/);
          const lngMatch = description.match(/Lon\s*:\s*([-\d.]+)/);
          
          if (magnitudeMatch && depthMatch && latMatch && lngMatch) {
            earthquakes.push({
              id: `tmd-${index}`,
              magnitude: parseFloat(magnitudeMatch[1]),
              place: item.title || 'ไม่ทราบสถานที่',
              time: new Date(item.pubDate || Date.now()).getTime(),
              lat: parseFloat(latMatch[1]),
              lng: parseFloat(lngMatch[1]),
              depth: parseFloat(depthMatch[1]),
              url: item.link || '#'
            });
          }
        } catch (error) {
          console.error('Error parsing earthquake item:', error);
        }
      });
    }
    
    return NextResponse.json(earthquakes);
  } catch (error) {
    console.error('Error fetching Thai earthquake data:', error);
    return NextResponse.json({ error: 'Failed to fetch earthquake data' }, { status: 500 });
  }
}
