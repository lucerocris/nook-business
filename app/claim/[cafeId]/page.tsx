import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClaimForm } from "@/app/components/claim/claim-form";
import { FunnelShell } from "@/app/components/funnel-shell";

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
      <FunnelShell contentClassName="max-w-4xl">
        <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 text-center ring-1 ring-zinc-200/70 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#101514]">
            {cafe.name} already has an owner on Nook
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-[#3b3b3b]">
            If you run this cafe and didn&apos;t claim it, message us on
            Instagram and we&apos;ll sort it out.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://instagram.com/nook_cafefinder"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#3A5A40] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2f4833]"
            >
              Message @nook_cafefinder
            </a>
            <Link
              href="/claim"
              className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-[#3b3b3b] transition-colors hover:bg-zinc-50"
            >
              Search again
            </Link>
          </div>
        </div>
      </FunnelShell>
    );
  }

  const redirectPath = encodeURIComponent(`/claim/${cafeId}`);

  if (!user) {
    return (
      <FunnelShell contentClassName="max-w-4xl">
        <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-[0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/70 sm:p-8">
          {cafe.featured_image_url ? (
            <img
              src={cafe.featured_image_url}
              alt={cafe.name ?? "Cafe"}
              className="mx-auto mb-6 h-24 w-24 rounded-2xl object-cover shadow-[0_16px_35px_rgba(58,90,64,0.18)]"
            />
          ) : (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#3A5A40]/10 text-xs font-semibold uppercase tracking-[0.24em] text-[#3A5A40]">
              Nook
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
            Claim verification
          </p>
          <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-[#101514] sm:text-4xl">
            Claim {cafe.name ?? "this cafe"}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-[#3b3b3b]">
            Create a free business account to verify ownership and manage {cafe.name ?? "this cafe"} on Nook.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              href={`/register?redirect=${redirectPath}`}
              className="inline-flex w-full items-center justify-center min-h-11 rounded-full bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2f4833]"
            >
              Create free account
            </Link>

            <Link
              href={`/login?redirect=${redirectPath}`}
              className="text-sm font-semibold text-[#3A5A40] transition hover:text-[#2b442f]"
            >
              
              Already have an account? Log in
            </Link>
          </div>
        </div>
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
    <FunnelShell contentClassName="max-w-5xl">
      <ClaimForm
        cafeId={String(cafe.id)}
        cafeName={cafe.name ?? "this cafe"}
        initialClaim={existingClaim ?? null}
      />
    </FunnelShell>
  );
}
