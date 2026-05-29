import React from 'react'

export default function HowItWorks() {
  return (
    <section className=" py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Claim your cafe in 3 simple steps
          </h2>
        </div>

        {/* Journey Row Container */}
        <div className="relative">
          
          {/* Horizontal Connecting Line (Desktop Only) */}
          {/* We use left-[16%] and w-[68%] so the line doesn't poke out past the first and last circles */}
          <div className="hidden md:block absolute top-6 left-[16%] w-[68%] h-1 bg-gray-200" aria-hidden="true" />

          {/* Vertical Connecting Line (Mobile Only) */}
          <div className="block md:hidden absolute top-6 bottom-6 left-[23px] w-1 bg-gray-200" aria-hidden="true" />

          {/* 3-Step Nodes Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            
            {/* Step 1: Search */}
            <div className="relative flex md:flex-col items-start md:items-center text-left md:text-center group">
              <div className="flex-shrink-0 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[#3A5A40] text-white font-bold text-xl md:mx-auto mb-0 md:mb-6 ring-8 ring-gray-50 shadow-sm transition-transform duration-300 group-hover:scale-110">
                1
              </div>
              <div className="ml-6 md:ml-0 mt-2 md:mt-0">
                <h4 className="text-xl font-bold text-gray-900 mb-2 md:mb-3">
                  Search
                </h4>
                <p className="text-gray-500 leading-relaxed text-sm md:text-base max-w-[260px] mx-auto">
                  Find your unverified listing using the search bar above.
                </p>
              </div>
            </div>

            {/* Step 2: Verify */}
            <div className="relative flex md:flex-col items-start md:items-center text-left md:text-center group">
              <div className="flex-shrink-0 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[#3A5A40] text-white font-bold text-xl md:mx-auto mb-0 md:mb-6 ring-8 ring-gray-50 shadow-sm transition-transform duration-300 group-hover:scale-110">
                2
              </div>
              <div className="ml-6 md:ml-0 mt-2 md:mt-0">
                <h4 className="text-xl font-bold text-gray-900 mb-2 md:mb-3">
                  Verify
                </h4>
                <p className="text-gray-500 leading-relaxed text-sm md:text-base max-w-[260px] mx-auto">
                  Create an account and submit a quick proof of ownership.
                </p>
              </div>
            </div>

            {/* Step 3: Manage */}
            <div className="relative flex md:flex-col items-start md:items-center text-left md:text-center group">
              <div className="flex-shrink-0 z-10 flex items-center justify-center w-12 h-12 rounded-full bg-[#3A5A40] text-white font-bold text-xl md:mx-auto mb-0 md:mb-6 ring-8 ring-gray-50 shadow-sm transition-transform duration-300 group-hover:scale-110">
                3
              </div>
              <div className="ml-6 md:ml-0 mt-2 md:mt-0">
                <h4 className="text-xl font-bold text-gray-900 mb-2 md:mb-3">
                  Manage
                </h4>
                <p className="text-gray-500 leading-relaxed text-sm md:text-base max-w-[260px] mx-auto">
                  Get instant access to your dashboard to update your hours and menu.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}