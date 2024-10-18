import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getWikiPage } from '@/lib/util';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;

  try {
    const query = `
      SELECT * FROM rankings
      WHERE name = $1
    `;
    const result = await sql.query(query, [slug]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json(row);
  } catch (error) {
    console.error('Error fetching rating data:', error);
    return NextResponse.json({ error: 'Failed to fetch rating data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug
  const { score } = await request.json();

  if (!score || score < 1 || score > 10) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  const page = await getWikiPage(slug)

  try {
    // Attempt to update the existing record
    const query = `
      INSERT INTO rankings (name, description, rating_${score}, score)
      VALUES ($1, $2, 1, $3)
      ON CONFLICT (name) DO UPDATE SET
        rating_${score} = rankings.rating_${score} + 1,
        description = $2,
        score = (
          (rankings.rating_1 * 1 + rankings.rating_2 * 2 + rankings.rating_3 * 3 + rankings.rating_4 * 4 + rankings.rating_5 * 5 +
            rankings.rating_6 * 6 + rankings.rating_7 * 7 + rankings.rating_8 * 8 + rankings.rating_9 * 9 + rankings.rating_10 * 10 + ${score}) * 1.0 /
          (rankings.rating_1 + rankings.rating_2 + rankings.rating_3 + rankings.rating_4 + rankings.rating_5 +
            rankings.rating_6 + rankings.rating_7 + rankings.rating_8 + rankings.rating_9 + rankings.rating_10 + 1)
        )
      RETURNING *
    `;
    const result = await sql.query(query, [slug, page?.description || null, score]);

    const updatedRow = result.rows[0];

    return NextResponse.json(updatedRow);
  } catch (error) {
    console.error('Error updating rating:', error);
    return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
  }
}
