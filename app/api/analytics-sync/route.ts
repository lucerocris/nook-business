import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

// Constant-time comparison so the bearer check doesn't short-circuit on the
// first differing byte.
function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Built lazily. At module scope this threw "supabaseKey is required" during
// `next build` (and at import time in any environment missing the key), which
// fails the route before the try/catch below can report anything.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Analytics sync is not configured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
    );
  }
  return createClient(url, key);
}

export async function GET(request: Request) {
  // ------------------------------------------------------------------
  // 1. SECURITY
  // ------------------------------------------------------------------         
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  // Fail closed if the secret isn't configured — otherwise the check becomes
  // `Bearer undefined`, which anyone could send.
  if (!cronSecret || !authHeader || !timingSafeEqualStr(authHeader, `Bearer ${cronSecret}`)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Validate PostHog config up front. Without this the project id fell
    // through as `undefined` into the request URL, PostHog 404s, and the cron
    // fails every night indistinguishably from "this cafe had no traffic".
    const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
    const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
    if (!POSTHOG_PROJECT_ID || !POSTHOG_PERSONAL_API_KEY) {
      throw new Error(
        'Analytics sync is not configured: POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY are required'
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ------------------------------------------------------------------
    // 2. FETCH FROM POSTHOG
    // ------------------------------------------------------------------
    // Aggregate the COMPLETE previous day in the reporting timezone. Using the
    // current date would only capture the partial day up to the cron's run time
    // (and PostHog's toDate() evaluates in the project timezone), silently
    // dropping the rest of the day's events.
    const REPORT_TZ = 'Asia/Manila';
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const targetDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: REPORT_TZ,
    }).format(yesterday);

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
              WHERE toDate(timestamp) = '${targetDate}'
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
    const aggregatedData = results.map((row: unknown[]) => {
      const entry: Record<string, unknown> = {};
      columns.forEach((col: string, i: number) => {
        entry[col] = row[i];
      });

      return {
        cafe_id:                 entry.cafe_id,
        summary_date:            targetDate,
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
      date: targetDate,
    });

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}