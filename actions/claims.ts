"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  resolveClaim,
  type ResolveClaimResult,
} from "@/lib/claims/resolve-claim";

// Explicit POST action to create-or-get the caller's claim for a cafe. Kept off
// the page's GET render so visiting /claim/[id] (or a crafted link) can't create
// a claim as a side effect — the owner must click "Confirm".
export async function startClaim(params: {
  cafeId: string;
  role: "owner" | "manager";
}): Promise<ResolveClaimResult> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return { error: "Please log in to submit a claim." };
  }

  return resolveClaim(supabase, user.id, params.cafeId, params.role);
}

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
