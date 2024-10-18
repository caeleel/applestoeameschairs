import { callWikipediaSearch } from '@/lib/util';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  const data = await callWikipediaSearch(query, searchParams.get('limit') || '6');
  if (data) {
    return NextResponse.json(data);
  } else {
    return NextResponse.json({ error: 'Failed to fetch data from Wikipedia' }, { status: 500 });
  }
}