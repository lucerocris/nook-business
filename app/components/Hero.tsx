export function Hero() {
  return (
    <section className="flex flex-col items-center overflow-hidden bg-[#F7FAF7] pt-48">
      {/* Top Content */}
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-balance text-4xl font-bold text-gray-900 sm:text-5xl">
          The discovery platform for PH's finest cafes.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-500 sm:text-lg">
          Claim your free profile, update your amenities, and control your
          digital storefront in minutes.
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

      {/* Mockups + Background */}
      <div className="relative mt-16 flex w-full flex-col items-center">
        

        {/* Mockups */}
        <div
          style={{ position: "relative", zIndex: 10 }}
          className="w-full max-w-6xl px-8"
        >
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <img
              src="/dashboardScreen.png"
              alt="Dashboard interface"
              className="h-auto w-full object-cover"
            />
          </div>

          <div
            style={{ position: "absolute", zIndex: 20 }}
            className="bottom-[-2rem] right-0 w-[30%] min-w-[150px] max-w-[320px] overflow-hidden rounded-[2rem] border-[6px] border-white shadow-2xl sm:bottom-[-3rem] sm:right-[-1rem]"
          >
            <img
              src="/phoneScreen.png"
              alt="Mobile interface"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

        <div className="h-24 w-full" style={{ zIndex: 5 }} />
      </div>

    </section>
  );
}