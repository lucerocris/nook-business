import type { Metadata } from "next"
import { Hero } from "./components/Hero";
import ValueProposition from "./components/ValueProposition";
import HowItWorks from "./components/howItWorks";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

// No title override: the template would render this as "Home - Nook" in search
// results. Falling through to the layout default gives "Nook for Business".
export const metadata: Metadata = {
  description:
    "Claim your cafe on Nook and manage your listing — photos, menu, hours, and reviews.",
}

export default function Home() {
  return (
    <>
      {/* The root layout no longer wraps children in <main>, so the landing
          page supplies its own. Footer stays outside it — it's a separate
          contentinfo landmark, not page content. */}
      <main>
        <Hero />
        <ValueProposition />
        <HowItWorks />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
