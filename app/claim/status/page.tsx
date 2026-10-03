import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FunnelShell, FunnelSpread } from "@/app/components/funnel-shell";
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

  // RLS scopes this to the caller's own claims; the claimant filter is kept
  // explicit so the page doesn't depend on that policy. Withdrawn claims were
  // cancelled by the owner and aren't worth showing.
  const { data: claims } = await supabase
    .from("cafe_claims")
    .select("id, status, verification_code, expires_at, created_at, cafes(name)")
    .eq("claimant_id", user.id)
    .neq("status", "withdrawn")
    .order("created_at", { ascending: false });

  const activeClaims = (claims ?? []) as unknown as {
    id: string;
    status: string;
    verification_code: string | null;
    expires_at: string | null;
    created_at: string | null;
    cafes: { name: string | null } | null;
  }[];

  const now = new Date();
  const isExpired = (claim: (typeof activeClaims)[number]) =>
    claim.status === "pending" &&
    !!claim.expires_at &&
    new Date(claim.expires_at) < now;
  const hasInProgress = activeClaims.some(
    (claim) =>
      (claim.status === "pending" || claim.status === "under_review") &&
      !isExpired(claim),
  );

  return (
    <FunnelShell>
      <FunnelSpread
        label="Claim status"
        title={
          hasInProgress
            ? "Your claim is in progress."
            : activeClaims.length > 0
              ? "Your claims."
              : "You haven't claimed a cafe yet."
        }
        lead={
          hasInProgress
            ? "We usually review claims within 1–2 business days of receiving your code, and we'll email you once it's approved."
            : activeClaims.length > 0
              ? "None of your claims are awaiting review right now."
              : "Once you claim your cafe, you'll be able to track it here."
        }
      >
        {activeClaims.length === 0 ? (
          <Link href="/claim" className="nk-btn nk-btn-primary min-h-11">
            Find your cafe
          </Link>
        ) : (
          <ul className="border-t border-[var(--nk-line)]">
            {activeClaims.map((claim) => {
              const expired = isExpired(claim);
              const isPending =
                !expired &&
                (claim.status === "pending" || claim.status === "under_review");

              return (
                <li key={claim.id} className="border-b border-[var(--nk-line)] py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--nk-ink)]">
                      {claim.cafes?.name ?? "Your cafe"}
                    </h2>
                    <span className="rounded-full bg-[var(--nk-tint)] px-3 py-1 text-[12px] font-medium text-[var(--nk-green)]">
                      {expired ? "Expired" : formatStatus(claim.status)}
                    </span>
                  </div>

                  {isPending && claim.verification_code ? (
                    <div className="mt-5">
                      <p className="text-[15px] text-[var(--nk-body)]">
                        Send this code to us from the cafe&apos;s official
                        Instagram account to finish verifying:
                      </p>
                      <p className="mt-4 rounded-[2px] border border-[var(--nk-line)] bg-[var(--nk-bg-2)] px-4 py-4 text-center font-mono text-2xl font-semibold tracking-[0.3em] text-[var(--nk-ink)]">
                        {claim.verification_code}
                      </p>
                      <a
                        href="https://instagram.com/nook_cafefinder"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nk-btn nk-btn-primary mt-5 min-h-11"
                      >
                        Message @nook_cafefinder
                      </a>
                    </div>
                  ) : null}

                  {expired ? (
                    <p className="mt-3 text-[15px] text-[var(--nk-body)]">
                      This claim expired before it was verified. Start a new
                      claim from the cafe&apos;s page to get a fresh code.
                    </p>
                  ) : null}

                  {claim.status === "rejected" ? (
                    <p className="mt-3 text-[15px] text-[var(--nk-body)]">
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
      </FunnelSpread>
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
    case "withdrawn":
      return "Withdrawn";
    default:
      return status;
  }
}
