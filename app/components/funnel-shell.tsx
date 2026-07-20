import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type FunnelShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function FunnelShell({
  children,
  className,
  contentClassName,
}: FunnelShellProps) {
  return (
    <section
      className={cn(
        // Tighter top padding on small screens so the card isn't pushed below
        // the fold on a phone; generous again from sm up.
        "relative isolate min-h-[calc(100dvh-72px)] overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8",
        className
      )}
    >
      {/* Same green radial as the hero, over the page's dot grid. The old
          mint gradient panel and floating circle/rounded-square outlines were
          removed — neither exists in the webapp design system. */}
      <div
        aria-hidden="true"
        className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]"
      />

      {/* The funnel's main landmark. Every page built on FunnelShell gets it
          from here, so individual pages must not render their own <main>. */}
      <main className={cn("relative z-10 mx-auto w-full max-w-5xl", contentClassName)}>
        {children}
      </main>
    </section>
  );
}