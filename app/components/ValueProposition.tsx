"use client";

import { useEffect, useRef, useState } from "react";
import { Target, Faders, Storefront } from "@phosphor-icons/react";

type Feature = {
  id: string;
  title: string;
  copy: string;
  Icon: React.ElementType;
};

const features: Feature[] = [
  {
    id: "reach-right-crowd",
    title: "Reach the right crowd.",
    copy: "Stop paying for generic ads. Put your brand directly in front of thousands of local students, remote workers, and specialty coffee enthusiasts.",
    Icon: Target,
  },
  {
    id: "control-your-aesthetic",
    title: "Control your aesthetic.",
    copy: "Ditch the outdated photos and wrong operating hours. Instantly update your menu, highlight your Wi-Fi speeds, and showcase your best interior angles.",
    Icon: Faders,
  },
  {
    id: "free-to-use",
    title: "100% Free to use.",
    copy: "No hidden fees and no premium subscriptions to manage your core profile. Claim your page and take control of your digital storefront today.",
    Icon: Storefront,
  },
];

export default function ValueProposition() {
  const [activeId, setActiveId] = useState(features[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const ratiosRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sectionId = (entry.target as HTMLElement).dataset.sectionId;
          if (!sectionId) continue;
          ratiosRef.current[sectionId] = entry.isIntersecting
            ? entry.intersectionRatio
            : 0;
        }

        const mostVisible = features.reduce(
          (best, feature) => {
            const ratio = ratiosRef.current[feature.id] ?? 0;
            return ratio > best.ratio ? { id: feature.id, ratio } : best;
          },
          { id: activeId, ratio: 0 }
        );

        if (mostVisible.ratio > 0 && mostVisible.id !== activeId) {
          setActiveId(mostVisible.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65, 0.8],
        rootMargin: "-18% 0px -35% 0px",
      }
    );

    for (const feature of features) {
      const el = sectionRefs.current[feature.id];
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [activeId]);

  return (
    <section id="features" className="relative isolate bg-white py-20 lg:py-28">
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          
          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#3A5A40]">
                Grow with intention
              </p>
              <h2 className="mt-5 text-3xl font-semibold text-gray-900 sm:text-4xl">
                Every detail of your cafe, curated and in your control.
              </h2>
              <p className="mt-5 text-base text-gray-600 sm:text-lg">
                Nook keeps you visible to the right customers and puts you in
                charge of the story they see.
              </p>

              <nav className="mt-10 border-l border-gray-200 pl-5">
                <ul className="space-y-5">
                  {features.map((feature, index) => {
                    const isActive = activeId === feature.id;

                    return (
                      <li key={feature.id}>
                        <a
                          href={`#${feature.id}`}
                          className={`group flex items-center gap-3 text-sm transition-colors ${
                            isActive
                              ? "text-[#3A5A40]"
                              : "text-gray-400 hover:text-gray-700"
                          }`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full transition-all ${
                              isActive
                                ? "bg-[#3A5A40] ring-4 ring-[#3A5A40]/15"
                                : "bg-gray-300 group-hover:bg-gray-500"
                            }`}
                          />
                          <span className="font-medium">
                            {String(index + 1).padStart(2, "0")}. {feature.title}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Scrolling Content Cards */}
          <div className="lg:col-span-8">
            <div className="space-y-16 lg:space-y-24">
              {features.map((feature) => (
                <article
                  key={feature.id}
                  id={feature.id}
                  data-section-id={feature.id}
                  ref={(node) => {
                    sectionRefs.current[feature.id] = node;
                  }}
                  className="scroll-mt-28 flex flex-col gap-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10"
                >
                  {/* Text Stacked Vertically */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                      {feature.title}
                    </h3>
                    <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
                      {feature.copy}
                    </p>
                  </div>

                  {/* Clean Visual Asset Container */}
                  <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-gray-100/50 bg-gray-50/50">
                    <feature.Icon 
                      size={96} 
                      weight="light" 
                      className="text-[#3A5A40]" 
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}