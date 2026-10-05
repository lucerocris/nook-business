"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCode, isClaimRole, type ClaimRole } from "@/lib/claims/resolve-claim";
import { notifyNewClaim } from "@/lib/claims/notify-new-claim";

export type ListingInput = {
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  instagram: string;
  role: ClaimRole;
  // Set once the owner has seen the look-alike cafes and said theirs is
  // different.
  force?: boolean;
};

export type DuplicateCafe = {
  id: string;
  name: string;
  address: string | null;
  is_claimed: boolean;
};

export type SubmitListingResult =
  | { status: "created" }
  | { status: "duplicates"; cafes: DuplicateCafe[] }
  | { status: "already_pending" }
  | { status: "being_listed" }
  | { status: "error"; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

// A verification-code collision is unlikely but possible, same as in
// resolveClaim; the RPC rolls back the draft cafe and we try a fresh code.
const CODE_ATTEMPTS = 3;

// Creates a hidden draft cafe plus a pending claim on it, in one transaction
// (submit_cafe_listing). The RPC does the authoritative validation and the
// duplicate check; this only guards types, since server action arguments are
// arbitrary JSON from the client.
export async function submitListing(
  input: ListingInput
): Promise<SubmitListingResult> {
  if (
    !input ||
    typeof input.name !== "string" ||
    typeof input.address !== "string" ||
    typeof input.neighborhood !== "string" ||
    typeof input.city !== "string" ||
    typeof input.instagram !== "string" ||
    !Number.isFinite(input.lat) ||
    !Number.isFinite(input.lng) ||
    !isClaimRole(input.role)
  ) {
    return { status: "error", error: GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;
  if (userError || !user) {
    return { status: "error", error: "Please log in to list your cafe." };
  }

  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const { data, error } = await supabase.rpc("submit_cafe_listing", {
      p_name: input.name,
      p_address: input.address,
      p_neighborhood: input.neighborhood,
      p_city: input.city,
      p_lat: input.lat,
      p_lng: input.lng,
      p_instagram: input.instagram,
      p_role: input.role,
      p_code: generateCode(),
      p_force: input.force === true,
    });

    if (error) {
      if (error.message === "code_taken") continue;
      // 22023 messages are written for the owner ("Enter your cafe's name.").
      if (error.code === "22023") return { status: "error", error: error.message };
      console.error("[LISTING] submit_cafe_listing failed", error);
      return { status: "error", error: GENERIC_ERROR };
    }

    const result = data as
      | { status: "created"; claim_id: string; cafe_id: string; verification_code: string }
      | { status: "duplicates"; cafes: DuplicateCafe[] }
      | { status: "already_pending"; claim_id: string }
      | { status: "being_listed" };

    if (result.status === "created") {
      after(() =>
        notifyNewClaim({
          claimId: result.claim_id,
          cafeId: result.cafe_id,
          claimantId: user.id,
          claimantEmail: user.email ?? null,
          role: input.role,
          verificationCode: result.verification_code,
          isNewListing: true,
          instagramHandle: input.instagram.trim().replace(/^@/, "").toLowerCase(),
        })
      );
      return { status: "created" };
    }
    if (result.status === "duplicates") {
      return { status: "duplicates", cafes: result.cafes };
    }
    return { status: result.status };
  }

  return { status: "error", error: GENERIC_ERROR };
}
