import { Hero } from "./components/Hero";
import ValueProposition from "./components/ValueProposition";
import HowItWorks from "./components/howItWorks";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

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
