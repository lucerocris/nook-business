import type { Metadata } from "next"
import { Hero } from "./components/Hero";
import ProofStrip from "./components/ProofStrip";
import ValueProposition from "./components/ValueProposition";
import HowItWorks from "./components/howItWorks";
import Faq from "./components/Faq";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

// No title override: the template would render this as "Home - Nook" in search
// results. Falling through to the layout default gives "Nook for Business".
export const metadata: Metadata = {
  description:
    "Claim your cafe on Nook for free. Keep your hours, menu, photos and tags accurate, read your reviews, and see how often people find you.",
}

export default function Home() {
  return (
    <>
      {/* The root layout doesn't wrap children in <main>, so the landing
          page supplies its own. Footer stays outside it — it's a separate
          contentinfo landmark, not page content. */}
      {/* Plain paper: the site's dot grid stays on the other pages for now,
          until they move onto design.md one by one. */}
      <main className="bg-white">
        <Hero />
        <ProofStrip />
        <ValueProposition />
        <HowItWorks />
        <Faq />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
