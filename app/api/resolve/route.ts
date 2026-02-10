import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (!id) {
    return NextResponse.json({ error: 'Missing "id" parameter' }, { status: 400, headers });
  }

  try {
    // 1. Get Metadata to find the MP3 file name
    const res = await fetch(`https://archive.org/metadata/${id}`);
    const data = await res.json();

    if (!data.files) throw new Error('No files found');

    // 2. Find the .mp3 file
    const file = data.files.find((f: any) => f.name.endsWith('.mp3') && f.format !== 'Metadata');

    if (!file) {
      return NextResponse.json({ error: 'No MP3 found' }, { status: 404, headers });
    }

    // 3. Construct Direct URL
    const directUrl = `https://archive.org/download/${id}/${file.name}`;

    return NextResponse.json({ 
      success: true, 
      url: directUrl,
      filename: file.name
    }, { status: 200, headers });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500, headers });
  }
}
