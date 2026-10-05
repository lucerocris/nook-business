import { Check, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type FunnelShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

// The account and claim pages: one narrow column on plain white, the step's
// card centered in it. No dot grid here: tried and rejected (2026-10-04).
// These pages lead into the owner portal, so they follow the app's system
// (12–16px cards, 8px inputs, pill buttons), not the landing's editorial
// spread. Pages lay themselves out inside, usually with FunnelSpread.
export function FunnelShell({
  children,
  className,
  contentClassName,
}: FunnelShellProps) {
  return (
    <section
      className={cn(
        "min-h-dvh bg-white px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32",
        className
      )}
    >
      {/* The funnel's main landmark. Every page built on FunnelShell gets it
          from here, so individual pages must not render their own <main>. */}
      <main className={cn("mx-auto w-full max-w-[480px]", contentClassName)}>
        {children}
      </main>
    </section>
  );
}

// The three stages every owner goes through, whether they claim a listed cafe
// or add a new one. Short names so the strip fits a 390px phone.
export const FUNNEL_STAGES = ["Find your cafe", "Verify", "Go live"] as const;
export type FunnelStage = 1 | 2 | 3;

/**
 * Where the owner is in find → verify → go live. Numbered nodes on a thin
 * line, a check once a stage is done, only the current label in ink.
 * `attention` marks the current stage as stuck (claim expired or rejected).
 */
export function FunnelProgress({
  current,
  attention = false,
  firstStageLabel,
}: {
  current: FunnelStage;
  attention?: boolean;
  /** Renames stage 1, e.g. "Add your cafe" for an owner listing a new one. */
  firstStageLabel?: string;
}) {
  const stages = firstStageLabel
    ? [firstStageLabel, ...FUNNEL_STAGES.slice(1)]
    : FUNNEL_STAGES;
  return (
    <ol className="mb-7 grid grid-cols-3" aria-label="Progress">
      {stages.map((name, index) => {
        const stage = (index + 1) as FunnelStage;
        const done = stage < current;
        const isCurrent = stage === current;
        return (
          <li
            key={name}
            aria-current={isCurrent ? "step" : undefined}
            className="relative flex flex-col items-center gap-2 text-center"
          >
            {index > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 top-3 h-px w-full -translate-y-1/2",
                  stage <= current ? "bg-[var(--nk-green)]" : "bg-[var(--nk-line)]"
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative flex size-6 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums",
                done && "bg-[var(--nk-green)] text-white",
                isCurrent && !attention && "bg-[var(--nk-green)] text-white ring-4 ring-[var(--nk-tint)]",
                isCurrent && attention && "bg-[var(--nk-amber-tint)] text-[var(--nk-amber)] ring-4 ring-[var(--nk-amber-tint)]",
                !done && !isCurrent && "border border-[#c9ccc9] bg-white text-[var(--nk-muted)]"
              )}
            >
              {done ? (
                <Check weight="bold" className="size-3.5" aria-hidden />
              ) : isCurrent && attention ? (
                <WarningCircle weight="bold" className="size-4" aria-hidden />
              ) : (
                stage
              )}
            </span>
            <span
              className={cn(
                "text-[12px] leading-tight",
                isCurrent ? "font-semibold text-[var(--nk-ink)]" : "text-[var(--nk-muted)]"
              )}
            >
              {name}
              <span className="sr-only">
                {done ? " (done)" : isCurrent ? (attention ? " (needs attention)" : " (current)") : ""}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

type FunnelSpreadProps = {
  /** Small line above the title, sentence case. Optional. */
  label?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** Shows the find → verify → go live strip at the top of the card. */
  stage?: FunnelStage;
  /** The current stage is stuck (expired or rejected claim). */
  stageAttention?: boolean;
  /** Renames stage 1 in the strip (see FunnelProgress). */
  firstStageLabel?: string;
  /** Secondary notes, under the card in small type. */
  aside?: ReactNode;
  children?: ReactNode;
};

// One funnel step: a white card with the title, one line of explanation and
// the step's form or content. Notes that aren't part of the task sit under it.
export function FunnelSpread({
  label,
  title,
  lead,
  stage,
  stageAttention,
  firstStageLabel,
  aside,
  children,
}: FunnelSpreadProps) {
  return (
    <div>
      <div className="rounded-2xl bg-white p-5 shadow-[var(--nk-shadow-card)] sm:p-8">
        {stage ? <FunnelProgress current={stage} attention={stageAttention} firstStageLabel={firstStageLabel} /> : null}
        {label ? (
          <p className="text-[13px] font-medium text-[var(--nk-green)]">{label}</p>
        ) : null}
        <h1
          className={cn(
            "text-balance text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[var(--nk-ink)] sm:text-[28px]",
            label ? "mt-1.5" : ""
          )}
        >
          {title}
        </h1>
        {lead ? (
          <div className="mt-2 text-[15px] leading-relaxed text-[var(--nk-body)]">
            {lead}
          </div>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
      {aside ? (
        <div className="mt-5 px-1 text-center text-[13px] leading-relaxed text-[var(--nk-muted)]">
          {aside}
        </div>
      ) : null}
    </div>
  );
}

export type TimelineStep = {
  title: string;
  /** One line on the current stage: what's happening or what to do. */
  status?: ReactNode;
  body?: ReactNode;
  state: "done" | "current" | "attention" | "upcoming";
};

/**
 * The claim status page's timeline: the same three stages, stacked on a
 * connector line, with the current one carrying a status line and its action.
 */
export function FunnelTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li
            key={step.title}
            aria-current={step.state === "current" || step.state === "attention" ? "step" : undefined}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-3 top-7 bottom-1 w-px -translate-x-1/2",
                  step.state === "done" ? "bg-[var(--nk-green)]" : "bg-[var(--nk-line)]"
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                step.state === "done" && "bg-[var(--nk-green)] text-white",
                step.state === "current" && "bg-[var(--nk-green)] text-white ring-4 ring-[var(--nk-tint)]",
                step.state === "attention" && "bg-[var(--nk-amber-tint)] text-[var(--nk-amber)] ring-4 ring-[var(--nk-amber-tint)]",
                step.state === "upcoming" && "border border-[#c9ccc9] bg-white text-[var(--nk-muted)]"
              )}
            >
              {step.state === "done" ? (
                <Check weight="bold" className="size-3.5" aria-hidden />
              ) : step.state === "attention" ? (
                <WarningCircle weight="bold" className="size-4" aria-hidden />
              ) : (
                index + 1
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-[15px] font-semibold leading-6",
                  step.state === "upcoming" ? "text-[var(--nk-muted)]" : "text-[var(--nk-ink)]"
                )}
              >
                {step.title}
                <span className="sr-only">
                  {step.state === "done" ? " (done)" : step.state === "upcoming" ? "" : " (current)"}
                </span>
              </p>
              {step.status ? (
                <p
                  className={cn(
                    "mt-0.5 text-[13px] font-medium",
                    step.state === "attention" ? "text-[var(--nk-amber)]" : "text-[var(--nk-green)]"
                  )}
                >
                  {step.status}
                </p>
              ) : null}
              {step.body ? (
                <div className="mt-1 text-[14px] leading-relaxed text-[var(--nk-muted)]">
                  {step.body}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
