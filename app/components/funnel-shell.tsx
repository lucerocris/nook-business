import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type FunnelShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

// Plain paper, like the landing (design.md): no glow, no dot grid, no
// floating card. Pages lay themselves out inside, usually with FunnelSpread.
export function FunnelShell({
  children,
  className,
  contentClassName,
}: FunnelShellProps) {
  return (
    <section
      className={cn(
        "min-h-[calc(100dvh-72px)] bg-white px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-36 lg:px-8",
        className
      )}
    >
      {/* The funnel's main landmark. Every page built on FunnelShell gets it
          from here, so individual pages must not render their own <main>. */}
      <main className={cn("mx-auto w-full max-w-6xl", contentClassName)}>
        {children}
      </main>
    </section>
  );
}

type FunnelSpreadProps = {
  /** Small line above the headline, sentence case. Optional. */
  label?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** Extra notes under the lead in the heading column. */
  aside?: ReactNode;
  children?: ReactNode;
};

// The landing's section shape applied to a funnel step: headline and
// explanation on the left, the step's form or content on the right under a
// ruled line. Stacks on a phone.
export function FunnelSpread({ label, title, lead, aside, children }: FunnelSpreadProps) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-20 lg:gap-y-0 [&>*]:min-w-0">
      <div className="lg:col-start-1 lg:row-start-1">
        {label ? (
          <p className="text-[14px] font-medium text-[var(--nk-muted)]">{label}</p>
        ) : null}
        <h1 className={cn("nk-h2 max-w-[16ch]", label ? "mt-4" : "")}>{title}</h1>
        {lead ? (
          <div className="mt-6 max-w-[48ch] text-[16px] leading-relaxed text-[var(--nk-body)] sm:text-[17px]">
            {lead}
          </div>
        ) : null}
      </div>
      {children ? (
        <div className="border-t border-[var(--nk-ink)] pt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-10">
          {children}
        </div>
      ) : null}
      {/* After the form on a phone, so the action comes first; under the lead
          in the heading column on desktop. */}
      {aside ? (
        <div className="max-w-[48ch] text-[14px] leading-relaxed text-[var(--nk-muted)] lg:col-start-1 lg:row-start-2 lg:mt-8">
          {aside}
        </div>
      ) : null}
    </div>
  );
}
