"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type InitiateClaimPayload = {
  cafeId: string;
  role: "owner" | "manager";
};

type ClaimRecord = {
  id: string;
  verification_code: string | null;
  status: string;
};

type InitiateClaimResult =
  | {
      claim: ClaimRecord;
    }
  | {
      error: string;
    };

export async function initiateClaim(
  payload: InitiateClaimPayload
): Promise<InitiateClaimResult> {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return { error: "Please log in to submit a claim." };
  }

  const { data: existingClaim, error: existingError } = await supabase
    .from("cafe_claims")
    .select("id, verification_code, status")
    .eq("cafe_id", payload.cafeId)
    .eq("claimant_id", user.id)
    .in("status", ["pending", "under_review"])
    .maybeSingle<ClaimRecord>();

  if (existingError) {
    return { error: "Something went wrong. Please try again." };
  }

  if (existingClaim) {
    return { claim: existingClaim };
  }

  const codeCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let verificationCode = "";

  for (let index = 0; index < 4; index += 1) {
    const randomIndex = Math.floor(Math.random() * codeCharacters.length);
    verificationCode += codeCharacters[randomIndex];
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { data: claim, error: insertError } = await supabase
    .from("cafe_claims")
    .insert({
      cafe_id: payload.cafeId,
      claimant_id: user.id,
      status: "pending",
      role: payload.role,
      verification_code: verificationCode,
      verification_method: "instagram_dm",
      expires_at: expiresAt.toISOString(),
    })
    .select("id, verification_code, status")
    .single<ClaimRecord>();

  if (insertError || !claim) {
    return { error: "Something went wrong. Please try again." };
  }

  return { claim };
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
