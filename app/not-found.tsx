import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nk-container flex min-h-[70vh] flex-col items-start justify-center bg-white pb-16 pt-32">
      <p className="text-[14px] font-medium text-[var(--nk-muted)]">
        404
      </p>
      <h1 className="nk-h2 mt-4 max-w-[16ch] border-b border-[var(--nk-ink)] pb-6">
        Page not found.
      </h1>
      <p className="mt-6 max-w-[48ch] text-[16px] leading-relaxed text-[var(--nk-body)]">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="nk-btn nk-btn-primary mt-8 min-h-11"
      >
        Back to home
      </Link>
    </main>
  );
}
