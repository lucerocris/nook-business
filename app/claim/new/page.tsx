import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FunnelShell, FunnelSpread } from "@/app/components/funnel-shell";
import { ListCafeForm } from "@/app/components/claim/list-cafe-form";

export const metadata: Metadata = { title: "List your cafe" };

// For owners whose cafe isn't on Nook yet: /claim search found nothing. The
// submission is a hidden draft until an admin verifies and publishes it.
export default async function ListCafePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const initialName = (name ?? "").trim().slice(0, 120);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const back = encodeURIComponent(
      initialName ? `/claim/new?name=${encodeURIComponent(initialName)}` : "/claim/new"
    );
    return (
      <FunnelShell>
        <FunnelSpread
          stage={1}
          firstStageLabel="Add your cafe"
          title="Add your cafe to Nook."
          lead="Create a free owner account first. It's how you'll manage your cafe's page once it's live."
        >
          <div className="flex flex-col gap-4">
            {/* Said before sign-up, so nobody makes an account and then finds
                out the cafe's Instagram is the only way to verify. */}
            <div className="rounded-xl bg-[var(--nk-bg-2)] px-4 py-3.5 text-[14px] leading-relaxed text-[var(--nk-body)]">
              <p className="font-semibold text-[var(--nk-ink)]">You&apos;ll need</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                <li>Your cafe&apos;s address</li>
                <li>Access to your cafe&apos;s Instagram account, to send us a code</li>
              </ul>
              <p className="mt-2 text-[13px] text-[var(--nk-muted)]">
                We usually check it within 1–2 working days of getting your code.
              </p>
            </div>
            <Link
              href={`/register?redirect=${back}`}
              className="nk-btn nk-btn-primary min-h-11 w-full"
            >
              Create free account
            </Link>
            <p className="text-[14px] text-[var(--nk-muted)]">
              Already have an account?{" "}
              <Link href={`/login?redirect=${back}`} className="nk-link">
                Log in
              </Link>
            </p>
          </div>
        </FunnelSpread>
      </FunnelShell>
    );
  }

  // One open listing per account (the RPC enforces it too). Send them to the
  // status page, which shows their code, rather than a form they can't submit.
  const { data: open } = await supabase
    .from("cafe_claims")
    .select("id")
    .eq("claimant_id", user.id)
    .eq("is_new_listing", true)
    .or(`status.eq.under_review,and(status.eq.pending,expires_at.gt.${new Date().toISOString()})`)
    .limit(1)
    .maybeSingle();

  if (open) redirect("/claim/status");

  return (
    <FunnelShell>
      <FunnelSpread
        stage={1}
        firstStageLabel="Add your cafe"
        title="Add your cafe to Nook."
        lead="Tell us where it is. It stays hidden until we've verified it's yours and you've set up your page."
      >
        <ListCafeForm initialName={initialName} />
      </FunnelSpread>
    </FunnelShell>
  );
}
