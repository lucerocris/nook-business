import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FunnelShell } from "@/app/components/funnel-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your claim" };

// Owners who submit a claim have a cafe_claims row but no cafe_owner_cafe row
// until an admin approves them, so middleware bounces them out of /owner/* and
// leaves them on the marketing homepage with no sign their claim exists. This
// page is the destination for that in-between state.
export default async function ClaimStatusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/claim/status");

  // If the claim already went through, the dashboard is the right place.
  const { data: ownerRow } = await supabase
    .from("cafe_owner_cafe")
    .select("owner_id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (ownerRow) redirect("/owner/dashboard");

  // RLS scopes this to the caller's own claims.
  const { data: claims } = await supabase
    .from("cafe_claims")
    .select("id, status, verification_code, expires_at, created_at, cafes(name)")
    .order("created_at", { ascending: false });

  const activeClaims = (claims ?? []) as unknown as {
    id: string;
    status: string;
    verification_code: string | null;
    expires_at: string | null;
    created_at: string | null;
    cafes: { name: string | null } | null;
  }[];

  return (
    <FunnelShell contentClassName="max-w-3xl">
      <main className="mx-auto w-full max-w-2xl rounded-2xl bg-white px-5 py-8 shadow-[0_12px_28px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200/70 sm:px-8 sm:py-10">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
            Claim status
          </p>
          <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-[#101514] sm:text-4xl">
            {activeClaims.length > 0
              ? "Your claim is in progress"
              : "You haven't claimed a cafe yet"}
          </h1>
        </div>

        {activeClaims.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="mx-auto max-w-lg text-base text-[#3b3b3b]">
              Once you claim your cafe, you&apos;ll be able to track its progress
              here.
            </p>
            <Link
              href="/claim"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#3A5A40] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b442f]"
            >
              Find your cafe
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {activeClaims.map((claim) => {
              const isPending =
                claim.status === "pending" || claim.status === "under_review";

              return (
                <li
                  key={claim.id}
                  className="rounded-2xl border border-zinc-200 bg-[#e3ebe4]/30 px-5 py-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold text-[#101514]">
                      {claim.cafes?.name ?? "Your cafe"}
                    </h2>
                    <span className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-[#3b3b3b]">
                      {formatStatus(claim.status)}
                    </span>
                  </div>

                  {isPending && claim.verification_code ? (
                    <div className="mt-4">
                      <p className="text-sm text-[#3b3b3b]">
                        Send this code to us from the cafe&apos;s official
                        Instagram account to finish verifying:
                      </p>
                      <p className="mt-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center font-mono text-2xl font-semibold tracking-[0.3em] text-[#101514]">
                        {claim.verification_code}
                      </p>
                      <p className="mt-3 text-sm text-[#6b6b6b]">
                        We usually review claims within 1&ndash;2 business days
                        of receiving the code, and we&apos;ll email you once
                        it&apos;s approved.
                      </p>
                      <a
                        href="https://instagram.com/nook_cafefinder"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-[#3A5A40] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b442f]"
                      >
                        Message @nook_cafefinder
                      </a>
                    </div>
                  ) : null}

                  {claim.status === "rejected" ? (
                    <p className="mt-3 text-sm text-[#3b3b3b]">
                      This claim wasn&apos;t approved. If you think that&apos;s a
                      mistake, message us on Instagram and we&apos;ll take
                      another look.
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </FunnelShell>
  );
}

function formatStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pending verification";
    case "under_review":
      return "Under review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Not approved";
    default:
      return status;
  }
}
