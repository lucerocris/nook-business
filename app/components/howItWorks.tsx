import React from 'react'

export default function HowItWorks() {
  return (
    <section className="relative isolate bg-white py-20 lg:py-28">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#3A5A40]">
            Simple onboarding
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-gray-900 sm:text-4xl">
            Claim your cafe in three calm steps.
          </h2>
        </div>

        <div className="relative grid gap-8 lg:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Search',
              copy: 'Find your unverified listing using the search bar above.',
            },
            {
              step: '02',
              title: 'Verify',
              copy: 'Create an account and submit a quick proof of ownership.',
            },
            {
              step: '03',
              title: 'Manage',
              copy: 'Instant access to update hours, menu, and the details locals look for.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="absolute right-6 top-6 text-xs font-semibold tracking-[0.25em] text-gray-300">
                {item.step}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3A5A40] text-sm font-semibold text-white shadow-[0_10px_25px_rgba(58,90,64,0.35)]">
                {item.step}
              </div>
              <h4 className="mt-6 text-xl font-semibold text-gray-900">
                {item.title}
              </h4>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
