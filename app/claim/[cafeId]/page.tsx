import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimForm } from "@/app/components/claim/claim-form";
import { FunnelShell, FunnelSpread } from "@/app/components/funnel-shell";

type ClaimPageProps = {
  params: Promise<{
    cafeId: string;
  }>;
};

export async function generateMetadata({
  params,
}: ClaimPageProps): Promise<Metadata> {
  const { cafeId } = await params;
  const supabase = await createClient();
  const { data: cafe } = await supabase
    .from("cafes")
    .select("name")
    .eq("id", cafeId)
    .maybeSingle<{ name: string | null }>();

  return {
    title: cafe?.name ? `Claim ${cafe.name}` : "Claim your cafe",
  };
}

type CafeRecord = {
  id: string | number;
  name: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  featured_image_url: string | null;
  is_claimed: boolean | null;
};

export default async function ClaimPage({
  params,
}: ClaimPageProps) {
  const supabase = await createClient();

  const { cafeId } = await params;

  const { data: cafe, error } = await supabase
    .from("cafes")
    .select(
      "id, name, address, neighborhood, city, featured_image_url, is_claimed"
    )
    .eq("id", cafeId)
    .maybeSingle<CafeRecord>();

  if (error || !cafe) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Claimed cafes used to 404 here, including for the owner who had just been
  // approved and came back to this page as the claim form tells them to.
  if (cafe.is_claimed) {
    if (user) {
      const { data: link } = await supabase
        .from("cafe_owner_cafe")
        .select("cafe_id")
        .eq("owner_id", user.id)
        .eq("cafe_id", cafe.id)
        .maybeSingle();
      if (link) redirect("/owner/dashboard");
    }

    return (
      <FunnelShell>
        <FunnelSpread
          label="Claim your cafe"
          title={`${cafe.name ?? "This cafe"} already has an owner on Nook.`}
          lead="If you run this cafe and didn't claim it, message us on Instagram and we'll sort it out."
        >
          <div className="flex flex-wrap gap-3">
            <a
              href="https://instagram.com/nook_cafefinder"
              target="_blank"
              rel="noopener noreferrer"
              className="nk-btn nk-btn-primary"
            >
              Message @nook_cafefinder
            </a>
            <Link href="/claim" className="nk-btn nk-btn-secondary">
              Search again
            </Link>
          </div>
        </FunnelSpread>
      </FunnelShell>
    );
  }

  const redirectPath = encodeURIComponent(`/claim/${cafeId}`);

  if (!user) {
    return (
      <FunnelShell>
        <FunnelSpread
          label="Claim your cafe · step 2 of 3"
          title={`Claim ${cafe.name ?? "this cafe"}.`}
          lead={`Create a free owner account to verify that ${cafe.name ?? "this cafe"} is yours and manage it on Nook.`}
        >
          {cafe.featured_image_url ? (
            <img
              src={cafe.featured_image_url}
              alt={cafe.name ?? "Cafe"}
              className="mb-8 aspect-[16/9] w-full max-w-md rounded-[2px] object-cover"
            />
          ) : null}
          <div className="flex max-w-md flex-col gap-4">
            <Link
              href={`/register?redirect=${redirectPath}`}
              className="nk-btn nk-btn-primary min-h-11 w-full"
            >
              Create free account
            </Link>
            <p className="text-[14px] text-[var(--nk-muted)]">
              Already have an account?{" "}
              <Link href={`/login?redirect=${redirectPath}`} className="nk-link">
                Log in
              </Link>
            </p>
          </div>
        </FunnelSpread>
      </FunnelShell>
    );
  }

  // Read-only: fetch the caller's existing active claim (if any). Creating a
  // claim is an explicit action (the "Confirm" button → startClaim), never a
  // side effect of rendering this page.
  const { data: existingClaim } = await supabase
    .from("cafe_claims")
    .select("id, verification_code, status")
    .eq("cafe_id", cafe.id)
    .eq("claimant_id", user.id)
    .in("status", ["pending", "under_review"])
    .maybeSingle<{
      id: string;
      verification_code: string | null;
      status: string;
    }>();

  return (
    <FunnelShell>
      <ClaimForm
        cafeId={String(cafe.id)}
        cafeName={cafe.name ?? "this cafe"}
        initialClaim={existingClaim ?? null}
      />
    </FunnelShell>
  );
}
