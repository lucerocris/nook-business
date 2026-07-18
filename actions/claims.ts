"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Claim creation lives in lib/claims/resolve-claim.ts and is called from the
// claim page (server render) so the form arrives with the claim already set up
// — no client "Setting up your claim…" round-trip.

type WithdrawClaimResult = {
  error: string;
} | null;

export async function withdrawClaim(
  claimId: string
): Promise<WithdrawClaimResult> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return { error: "Please log in to update your claim." };
  }

  const { data, error } = await supabase
    .from("cafe_claims")
    .update({ status: "withdrawn" })
    .eq("id", claimId)
    .eq("claimant_id", user.id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/claim");
}
