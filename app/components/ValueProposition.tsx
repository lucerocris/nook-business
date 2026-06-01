import { Users, Store, Tag, Sparkles } from 'lucide-react'

export default function ValueProposition() {
  return (
    <section
      id="features"
      className="relative isolate bg-white py-20 lg:py-28"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3A5A40]/20 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
              <Sparkles className="h-4 w-4" />
              Grow with intention
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-gray-900 sm:text-4xl">
              Every detail of your cafe, curated and in your control.
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              Nook keeps you visible to the right customers and puts you in
              charge of the story they see.
            </p>

            <div className="mt-10 rounded-3xl border border-[#3A5A40]/10 bg-white p-8 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#3A5A40]">
                What you get
              </p>
              <div className="mt-6 grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#3A5A40]" />
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Verified discovery
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Show up where remote workers and students already search.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#3A5A40]" />
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Real-time updates
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Edit menus, hours, Wi-Fi speeds, and vibe photos instantly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#3A5A40]" />
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      No fees, ever
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Own your profile with zero subscriptions to manage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3A5A40]/15 mb-5">
                <Users className="w-7 h-7 text-[#3A5A40]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Reach the right crowd.
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                Stop paying for generic ads. Put your brand directly in front of thousands of local students, remote workers, and specialty coffee enthusiasts.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3A5A40]/15 mb-5">
                <Store className="w-7 h-7 text-[#3A5A40]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Control your aesthetic.
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                Ditch the outdated photos and wrong operating hours. Instantly update your menu, highlight your Wi-Fi speeds, and showcase your best interior angles.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3A5A40]/15 mb-5">
                <Tag className="w-7 h-7 text-[#3A5A40]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                100% Free to use.
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                No hidden fees and no premium subscriptions to manage your core profile. Claim your page and take control of your digital storefront today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
