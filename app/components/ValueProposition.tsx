"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  HoursCard,
  InsightsCard,
  MenuCard,
  PhotosCard,
  ReviewsCard,
  TagsCard,
} from "./landing/drawn-ui";

type Feature = {
  title: string;
  pitch: string;
  points: string[];
  visual: React.ReactNode;
};

// Only what the owner portal ships today (app/owner/*). Don't add roadmap
// items from the dashboard's "Coming soon" card.
const features: Feature[] = [
  {
    title: "Hours & details",
    pitch:
      "Wrong hours send people to a locked door. Set your hours day by day, mark the days you're closed, and keep your description and socials current.",
    points: [
      "Opening hours for each day",
      "Closed days",
      "Cafe name and description",
      "Instagram, Facebook, TikTok and website",
      "Address or map pin corrections, sent to our team",
    ],
    visual: <HoursCard className="w-full max-w-sm" />,
  },
  {
    title: "Menu & prices",
    pitch:
      "Prices are one of the first things people check. Add your items under categories with prices and photos, so nobody has to guess.",
    points: [
      "Items with prices",
      "Categories",
      "Item photos",
      "Edit or remove items anytime",
    ],
    visual: <MenuCard className="w-full max-w-sm" />,
  },
  {
    title: "Photos",
    pitch:
      "Your photos, not whatever someone snapped on a busy day. Pick the hero shot that leads your listing and fill the gallery behind it.",
    points: ["A hero photo at the top of your listing", "A photo gallery"],
    visual: <PhotosCard className="w-full max-w-sm" />,
  },
  {
    title: "Tags",
    pitch:
      "People filter by what they need: Wi-Fi, outlets, parking, a quiet table. Choose from the same 28 tags they filter by, so you appear in the searches you should.",
    points: [
      "Amenities like Free WiFi and Power Outlets",
      "Best-for tags like Solo Work / Study",
      "Payment options: cash, card, e-wallet",
    ],
    visual: <TagsCard className="w-full max-w-sm" />,
  },
  {
    title: "Reviews & traffic",
    pitch:
      "See what people say and how they use your listing. Read every review, report the ones that break the rules, and check your 30-day numbers.",
    points: [
      "Every review in one place",
      "Report reviews to our team",
      "Profile views and route requests",
      "Times saved and hours checked",
    ],
    visual: (
      <div className="grid w-full max-w-md gap-3">
        <InsightsCard />
        <ReviewsCard className="hidden sm:block" />
      </div>
    ),
  },
];

export default function ValueProposition() {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <section id="features" className="scroll-mt-20 bg-white py-20 sm:py-28 lg:py-36">
      <div className="nk-container">
        <div className="max-w-3xl sm:mx-auto sm:text-center">
          <p className="nk-eyebrow">What you control</p>
          <h2 className="nk-h2 mt-4">
            Everything people check
            <br className="hidden sm:block" /> before they head over.
          </h2>
          <p className="nk-lead mt-4">
            Most people pick a cafe from its listing. The owner portal puts
            the parts they check first in your hands.
          </p>
        </div>

        <ul className="mt-14 border-b border-[var(--nk-line)] sm:mt-20">
          {features.map((feature, index) => {
            const isOpen = open === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;
            const number = String(index + 1).padStart(2, "0");

            return (
              <li key={feature.title} className="border-t border-[var(--nk-line)]">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : index)}
                    className="group flex w-full items-center gap-4 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--nk-green)] sm:gap-8 sm:py-8"
                  >
                    <span className="w-10 shrink-0 text-[1.5rem] font-semibold leading-none tracking-[-0.02em] text-[var(--nk-sage)] tabular-nums sm:w-20 sm:text-[2.5rem]">
                      {number}
                    </span>
                    <span className="flex-1 text-[1.5rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--nk-ink)] transition-colors group-hover:text-[var(--nk-green)] sm:text-[2.5rem]">
                      {feature.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="nk-plus flex h-10 w-10 shrink-0 items-center justify-center text-[28px] font-light leading-none text-[var(--nk-green)]"
                    >
                      +
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="nk-collapse"
                  data-open={isOpen}
                  inert={!isOpen}
                >
                  <div>
                    <div className="grid gap-8 pb-10 sm:pl-28 lg:grid-cols-2 lg:gap-14 lg:pb-14">
                      <div className="flex min-h-[260px] items-center justify-center rounded-xl bg-[var(--nk-bg-2)] p-6 sm:p-10">
                        {feature.visual}
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[16px] font-semibold leading-relaxed text-[var(--nk-ink)]">
                          {feature.pitch}
                        </p>
                        <ul className="mt-6 space-y-2.5">
                          {feature.points.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-3 text-[14px] text-[var(--nk-body)]"
                            >
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--nk-green)]" />
                              {point}
                            </li>
                          ))}
                        </ul>
                        <Link href="/claim" className="nk-link mt-8 self-start">
                          Claim my cafe →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
