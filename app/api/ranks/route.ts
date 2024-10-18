import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  if (type !== 'score') {
    return NextResponse.json({ error: 'Invalid ranking type' }, { status: 400 });
  }

  try {
    const result = await sql`
      SELECT name, description, score
      FROM rankings
      ORDER BY score DESC
      LIMIT 100
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
  }
}



