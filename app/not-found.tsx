import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 pb-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
        404
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#3A5A40] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(58,90,64,0.3)] transition hover:-translate-y-0.5 hover:bg-[#2f4a35]"
      >
        Back to home
      </Link>
    </div>
  );
}
