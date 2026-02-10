import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Disable caching

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // 1. CORS Headers (Allows access from any app)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (!query) {
    return NextResponse.json({ error: 'Missing "q" parameter' }, { status: 400, headers });
  }

  try {
    // 2. Search Archive.org (Audio only, sorted by popularity)
    const archiveUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
      `title:(${query}) AND mediatype:(audio)`
    )}&fl[]=identifier,title,creator,length,downloads&sort[]=downloads+desc&output=json&rows=10`;

    const res = await fetch(archiveUrl);
    const data = await res.json();

    // 3. Format Data
    const songs = data.response.docs.map((doc: any) => ({
      id: doc.identifier,
      title: doc.title,
      artist: doc.creator || 'Unknown',
      duration: doc.length || '0:00',
      thumbnail: `https://archive.org/services/img/${doc.identifier}`
    }));

    return NextResponse.json({ success: true, data: songs }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500, headers });
  }
}
