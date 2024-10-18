import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'elo';

  if (type !== 'elo' && type !== 'score') {
    return NextResponse.json({ error: 'Invalid type parameter. Use "elo" or "score".' }, { status: 400 });
  }

  try {
    const query = `
      SELECT name, description, elo, score
      FROM rankings
      ORDER BY ${type} DESC
    `;
    const result = await sql.query(query);

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'No rankings found' }, { status: 404 });
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
  }
}


