import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

export async function GET(request: Request) {
  // ------------------------------------------------------------------
  // 1. SECURITY
  // ------------------------------------------------------------------         
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {                                                     
    // ------------------------------------------------------------------
    // 2. FETCH FROM POSTHOG
    // ------------------------------------------------------------------
    const today = new Date().toISOString().split('T')[0];

    const posthogResponse = await fetch(
      `https://app.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`,
      {
        method: 'POST',
        headers: {
          // CRITICAL: This must be a Personal API Key created in your PostHog account settings,
          // NOT the public Project API key you use in Flutter.
          'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            kind: 'HogQLQuery',
            query: `
              SELECT
                properties.cafe_id AS cafe_id,
                countIf(event = 'cafe_detail_viewed')  AS views_count,
                countIf(event = 'check_hours')         AS hours_checked_count,
                countIf(event = 'directions_tapped')   AS directions_tapped_count,
                countIf(event = 'cafe_favorited')      AS favorites_count
              FROM events
              WHERE toDate(timestamp) = '${today}'
                AND event IN ('cafe_detail_viewed', 'check_hours', 'directions_tapped', 'cafe_favorited')
                AND properties.cafe_id IS NOT NULL
              GROUP BY properties.cafe_id
            `,
          },
        }),
      }
    );

    if (!posthogResponse.ok) {
      throw new Error(`PostHog API error: ${posthogResponse.status} ${posthogResponse.statusText}`);
    }

    const posthogJson = await posthogResponse.json();
    const { results, columns } = posthogJson;

    if (!results || results.length === 0) {
      return NextResponse.json({ success: true, message: 'No events to sync for today', synced: 0 });
    }

    // ------------------------------------------------------------------
    // 3. SHAPE THE DATA
    // ------------------------------------------------------------------
    const aggregatedData = results.map((row: any[]) => {
      const entry: Record<string, any> = {};
      columns.forEach((col: string, i: number) => {
        entry[col] = row[i];
      });

      return {
        cafe_id:                 entry.cafe_id,
        summary_date:            today,
        views_count:             Number(entry.views_count)             || 0,
        hours_checked_count:     Number(entry.hours_checked_count)     || 0,
        directions_tapped_count: Number(entry.directions_tapped_count) || 0,
        favorites_count:         Number(entry.favorites_count)         || 0,
      };
    });

    // ------------------------------------------------------------------
    // 4. UPSERT TO SUPABASE
    // ------------------------------------------------------------------
    const { error, count } = await supabaseAdmin
      .from('cafe_analytics_summaries')
      .upsert(aggregatedData, {
        onConflict: 'cafe_id, summary_date',
        count: 'exact',
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Daily analytics synced successfully',
      synced: count,
      date: today,
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}