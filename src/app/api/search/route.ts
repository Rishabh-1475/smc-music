import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  if (!query || !query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const cleanQuery = encodeURIComponent(query.trim());
  const endpoints = [
    `https://saavnapi-beta.vercel.app/search/songs?query=${cleanQuery}&page=${page}&limit=40`,
    `https://jiosaavn-api.vercel.app/search?query=${cleanQuery}`,
    `https://saavn.dev/api/search/songs?query=${cleanQuery}&page=${page}&limit=40`,
    `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${cleanQuery}&page=${page}&limit=40`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } });
      if (!res.ok) continue;
      const json = await res.json();
      const items = json?.data?.results || json?.results || (Array.isArray(json?.data) ? json.data : []);

      if (Array.isArray(items) && items.length > 0) {
        return NextResponse.json({ results: items });
      }
    } catch (e) {
      // Continue to next mirror
    }
  }

  return NextResponse.json({ results: [] });
}
