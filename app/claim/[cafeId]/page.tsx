import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveClaim } from "@/lib/claims/resolve-claim";
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

  if (error || !cafe || cafe.is_claimed) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectPath = encodeURIComponent(`/claim/${cafeId}`);

  if (!user) {
    return (
      <FunnelShell contentClassName="max-w-4xl">
        <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-sm sm:p-11">
          {cafe.featured_image_url ? (
            <img
              src={cafe.featured_image_url}
              alt={cafe.name ?? "Cafe"}
              className="animate-funnel-rise mx-auto mb-7 h-24 w-24 rounded-2xl object-cover shadow-[0_16px_35px_rgba(58,90,64,0.18)]"
            />
          ) : (
            <div className="animate-funnel-rise mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#3A5A40]/10 text-xs font-semibold uppercase tracking-[0.24em] text-[#3A5A40]">
              Nook
            </div>
          )}

          <p className="animate-funnel-fade text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
            Claim verification
          </p>
          <h1 className="animate-funnel-rise funnel-delay-1 mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Claim {cafe.name ?? "this cafe"}
          </h1>

          <p className="animate-funnel-fade funnel-delay-2 mx-auto mt-4 max-w-xl text-base text-gray-600">
            Create a free business account to verify ownership and manage {cafe.name ?? "this cafe"} on Nook.
          </p>

          <div className="animate-funnel-rise funnel-delay-3 mt-9 flex flex-col items-center gap-4">
            <Link
              href={`/register?redirect=${redirectPath}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#3A5A40] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(58,90,64,0.3)] transition hover:-translate-y-0.5 hover:bg-[#2f4a35]"
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

  // Create-or-get the claim here (server-side) so the form renders ready — no
  // client "Setting up your claim…" round-trip / spinner.
  const result = await resolveClaim(supabase, user.id, String(cafe.id), "owner");

  return (
    <FunnelShell contentClassName="max-w-5xl">
      <ClaimForm
        cafeName={cafe.name ?? "this cafe"}
        claim={"claim" in result ? result.claim : null}
        error={"error" in result ? result.error : null}
      />
    </FunnelShell>
  );
}
