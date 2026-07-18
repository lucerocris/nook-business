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
        "relative isolate min-h-[calc(100dvh-72px)] overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8",
        className
      )}
    >
      {/* Background visual effects */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,_rgba(247,250,247,0.98),_rgba(247,250,247,0))]" />
      <div className="pointer-events-none absolute left-1/2 top-16 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(58,90,64,0.22),_transparent_66%)] blur-2xl" />
      <div className="pointer-events-none absolute -left-24 bottom-16 h-56 w-56 rounded-full border border-[#3A5A40]/20" />
      <div className="pointer-events-none absolute -right-20 top-44 h-44 w-44 rounded-[2.4rem] border border-[#3A5A40]/15" />

      {/* Main Content Area */}
      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-5xl animate-funnel-rise",
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}