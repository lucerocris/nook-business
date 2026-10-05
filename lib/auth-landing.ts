import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Where a sign-in with no ?redirect should land. Owners go to their dashboard.
// Someone with a claim or new listing still in progress has no owner row yet,
// so "/" would show them the marketing page with no sign of what they started;
// the status page holds their code and what happens next.
export async function landingForUser(supabase: Supabase, userId: string): Promise<string> {
  const { data: ownerRow } = await supabase
    .from("cafe_owner_cafe")
    .select("owner_id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();
  if (ownerRow) return "/owner/dashboard";

  const { data: openClaim } = await supabase
    .from("cafe_claims")
    .select("id")
    .eq("claimant_id", userId)
    .in("status", ["pending", "under_review"])
    .limit(1)
    .maybeSingle();
  if (openClaim) return "/claim/status";

  return "/";
}
