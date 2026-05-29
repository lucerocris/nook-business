export function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-balance text-4xl font-bold text-gray-900 sm:text-5xl">
          The discovery platform for Cebu's finest cafes.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-500 sm:text-lg">
          Claim your free profile, update your amenities, and control your digital storefront in minutes.
        </p>
        <form className="mt-8 w-full max-w-xl">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search for your cafe..."
              className="w-full rounded-md border border-gray-200 bg-white px-5 py-4 text-base text-gray-900 shadow-sm outline-none transition focus:border-gray-300 focus:ring-2 focus:ring-[#3A5A40]/20"
            />
            <button
              type="button"
              className="w-full shrink-0 rounded-md bg-[#3A5A40] px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#2b442f] sm:w-auto"
            >
              Verify &amp; Claim
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
