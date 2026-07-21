import type { SupabaseClient } from "@supabase/supabase-js";

export type ResolvedClaim = {
  id: string;
  verification_code: string | null;
  status: string;
};

// `created` distinguishes a brand-new claim from re-opening the caller's
// existing one, so callers can act on genuinely new claims only.
export type ResolveClaimResult =
  | { claim: ResolvedClaim; created: boolean }
  | { error: string };

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// 6 chars, which the varchar(8) column holds comfortably. Length also sets the
// collision odds against the unique `idx_active_cafe_verification_code` index
// over pending claims: 36^6 instead of 36^4.
const CODE_LENGTH = 6;

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// Get-or-create the caller's active claim for a cafe, in as few round-trips as
// possible. Insert-first: the DB's `one_active_claim_per_cafe` unique index is
// the source of truth, so on the common (no existing claim) path this is a
// single INSERT. On a conflict we resolve whose claim it is — RLS lets the
// caller read only their own claims, so a visible row is theirs (return it),
// and an invisible one belongs to someone else.
export async function resolveClaim(
  supabase: SupabaseClient,
  userId: string,
  cafeId: string,
  role: "owner" | "manager",
): Promise<ResolveClaimResult> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { data: claim, error } = await supabase
    .from("cafe_claims")
    .insert({
      cafe_id: cafeId,
      claimant_id: userId,
      status: "pending",
      role,
      verification_code: generateCode(),
      verification_method: "instagram_dm",
      expires_at: expiresAt.toISOString(),
    })
    .select("id, verification_code, status")
    .single();

  if (!error && claim) {
    return { claim: claim as ResolvedClaim, created: true };
  }

  if (
    error?.code === "23505" &&
    error.message?.includes("one_active_claim_per_cafe")
  ) {
    const { data: existing } = await supabase
      .from("cafe_claims")
      .select("id, verification_code, status, claimant_id")
      .eq("cafe_id", cafeId)
      .in("status", ["pending", "under_review"])
      .maybeSingle();

    if (existing && existing.claimant_id === userId) {
      return {
        claim: {
          id: existing.id,
          verification_code: existing.verification_code,
          status: existing.status,
        },
        created: false,
      };
    }

    return {
      error:
        "Someone has already submitted a claim for this cafe and it's under review. If this is your cafe, message us on Instagram and we'll sort it out.",
    };
  }

  return { error: "Something went wrong. Please try again." };
}
