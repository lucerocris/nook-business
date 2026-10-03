import Link from "next/link";
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

// Five spreads, not an accordion: each feature gets its text and its drawn
// preview side by side, the preview switching sides down the page, every
// spread ruled off from the next (design.md: editorial spreads, hairlines).
export default function ValueProposition() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-[var(--nk-line)] bg-white py-24 sm:py-32">
      <div className="nk-container">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20">
          <h2 className="nk-h2">Everything people check before they head over.</h2>
          <p className="max-w-[52ch] text-[17px] leading-relaxed text-[var(--nk-body)] lg:pt-3">
            Most people pick a cafe from its listing. The owner portal puts
            the parts they check first in your hands.
          </p>
        </div>

        <ul className="mt-16 sm:mt-20">
          {features.map((feature, index) => (
            <li
              key={feature.title}
              className="grid gap-10 border-t border-[var(--nk-line)] py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-20"
            >
              <div className={index % 2 ? "lg:order-2" : ""}>
                <h3 className="nk-display text-[2rem] leading-[1.1] text-[var(--nk-ink)] sm:text-[2.5rem]">
                  {feature.title}
                </h3>
                <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-[var(--nk-body)]">
                  {feature.pitch}
                </p>
                <ul className="mt-6 max-w-[48ch] border-t border-[var(--nk-line)]">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="border-b border-[var(--nk-line)] py-2.5 text-[14px] text-[var(--nk-ink)]"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
                <Link href="/claim" className="nk-link mt-6 inline-block">
                  Claim my cafe
                </Link>
              </div>
              <div
                aria-hidden="true"
                className={`flex min-h-[280px] items-center justify-center rounded-[2px] bg-[var(--nk-bg-2)] p-6 sm:p-10 ${index % 2 ? "lg:order-1" : ""}`}
              >
                {feature.visual}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
