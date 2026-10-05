import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  FunnelShell,
  FunnelSpread,
  FunnelTimeline,
  type TimelineStep,
} from "@/app/components/funnel-shell";
import { createClient } from "@/lib/supabase/server";
import { CodeHandoff } from "@/app/components/claim/code-handoff";
import { CancelListing } from "@/app/components/claim/cancel-listing";

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
    .select("id, status, verification_code, expires_at, created_at, is_new_listing, rejection_reason, cafes(name)")
    .eq("claimant_id", user.id)
    .neq("status", "withdrawn")
    .order("created_at", { ascending: false });

  const activeClaims = (claims ?? []) as unknown as {
    id: string;
    status: string;
    verification_code: string | null;
    expires_at: string | null;
    created_at: string | null;
    is_new_listing: boolean;
    rejection_reason: string | null;
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
        title={
          hasInProgress
            ? "Your claim is in progress."
            : activeClaims.length > 0
              ? "Your claims."
              : "You haven't claimed a cafe yet."
        }
        lead={
          hasInProgress
            ? "Here's where things stand. We'll email you when anything changes."
            : activeClaims.length > 0
              ? "None of your claims are waiting on review right now."
              : "Find your cafe on Nook, or add it if it isn't listed yet."
        }
      >
        {activeClaims.length === 0 ? (
          <Link href="/claim" className="nk-btn nk-btn-primary min-h-11 w-full">
            Find your cafe
          </Link>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--nk-line)]">
            {activeClaims.map((claim) => (
              <section key={claim.id} className="py-6 first:pt-0 last:pb-0">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <h2 className="min-w-0 break-words text-[17px] font-semibold text-[var(--nk-ink)]">
                    {claim.cafes?.name ?? "Your cafe"}
                  </h2>
                  {claim.is_new_listing ? (
                    <span className="rounded-full bg-[var(--nk-tint)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--nk-green)]">
                      New listing
                    </span>
                  ) : null}
                </div>
                <FunnelTimeline steps={claimSteps(claim, isExpired(claim))} />
                {claim.is_new_listing &&
                (claim.status === "pending" || claim.status === "under_review") ? (
                  <CancelListing claimId={claim.id} cafeName={claim.cafes?.name ?? "this listing"} />
                ) : null}
              </section>
            ))}
          </div>
        )}
      </FunnelSpread>
    </FunnelShell>
  );
}

type StatusClaim = {
  id: string;
  status: string;
  verification_code: string | null;
  expires_at: string | null;
  is_new_listing: boolean;
  rejection_reason: string | null;
};

// The same three stages as the strip on the other claim pages, with the
// current one saying what's happening and what to do next.
function claimSteps(claim: StatusClaim, expired: boolean): TimelineStep[] {
  const find: TimelineStep = {
    title: claim.is_new_listing ? "Add your cafe" : "Find your cafe",
    state: "done",
    body: claim.is_new_listing
      ? "Submitted. It stays hidden until it's verified and published."
      : undefined,
  };
  const goLive: TimelineStep = {
    title: "Go live",
    state: "upcoming",
    body: claim.is_new_listing
      ? "Once approved, set up your photos, hours and menu, then we publish your page."
      : "Once approved, your owner dashboard opens.",
  };

  let verify: TimelineStep;
  if (claim.status === "rejected") {
    verify = {
      title: "Verify it's yours",
      state: "attention",
      status: "Not approved",
      body: (
        <>
          {claim.rejection_reason ? (
            <span className="mb-2 block text-[var(--nk-body)]">
              {claim.rejection_reason}
            </span>
          ) : null}
          If you think that&apos;s a mistake, message us on Instagram at{" "}
          <a
            href="https://instagram.com/nook_cafefinder"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--nk-green)] hover:underline"
          >
            @nook_cafefinder
          </a>{" "}
          and we&apos;ll take another look.
        </>
      ),
    };
  } else if (expired) {
    verify = {
      title: "Verify it's yours",
      state: "attention",
      status: "Code expired",
      body: (
        <>
          The code wasn&apos;t sent within 7 days.{" "}
          <Link href="/claim" className="font-semibold text-[var(--nk-green)] hover:underline">
            Start again
          </Link>{" "}
          to get a fresh one.
        </>
      ),
    };
  } else if (claim.status === "under_review") {
    verify = {
      title: "Verify it's yours",
      state: "current",
      status: "Under review · usually 1–2 working days",
      body: "We got your code and we're checking it. We'll email you once it's approved.",
    };
  } else {
    verify = {
      title: "Verify it's yours",
      state: "current",
      status: "Waiting for your code",
      body: claim.verification_code ? (
        <CodeHandoff code={claim.verification_code} expiresAt={claim.expires_at} />
      ) : (
        <>
          Message us on Instagram at{" "}
          <a
            href="https://ig.me/m/nook_cafefinder"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--nk-green)] hover:underline"
          >
            @nook_cafefinder
          </a>{" "}
          and we&apos;ll send you a code.
        </>
      ),
    };
  }

  return [find, verify, goLive];
}

