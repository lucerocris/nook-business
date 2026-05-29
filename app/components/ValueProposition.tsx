import { Users, Store, Tag } from 'lucide-react'

export default function ValueProposition() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Why partner with Nook?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Take control of your cafe&apos;s digital presence and connect with the modern worker.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Column 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3A5A40]/20 mb-6">
              <Users className="w-8 h-8 text-[#3A5A40]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Reach the right crowd.
            </h3>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              Stop paying for generic ads. Put your brand directly in front of thousands of local students, remote workers, and specialty coffee enthusiasts.
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3A5A40]/20 mb-6">
              <Store className="w-8 h-8 text-[#3A5A40]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Control your aesthetic.
            </h3>
            <p className="text-gray-500 leading-relaxed text-sm md:text-base">
              Ditch the outdated photos and wrong operating hours. Instantly update your menu, highlight your Wi-Fi speeds, and showcase your best interior angles.
            </p>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#3A5A40]/20 mb-6">
              <Tag className="w-8 h-8 text-[#3A5A40]" strokeWidth={1.5} />
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
    </section>
  )
}