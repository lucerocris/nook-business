import type { Metadata } from "next"
import { Hero } from "./components/Hero";
import ValueProposition from "./components/ValueProposition";
import HowItWorks from "./components/howItWorks";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

export const metadata: Metadata = { title: "Home" }

export default function Home() {
  return (
    <>
      <Hero />
      <ValueProposition />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </>
  );
}
