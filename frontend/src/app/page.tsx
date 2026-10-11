import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problems } from "@/components/landing/Problems";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MobileApp } from "@/components/landing/MobileApp";
import { GettingStarted } from "@/components/landing/GettingStarted";
import { Benefits } from "@/components/landing/Benefits";
import { StatsSection } from "@/components/landing/StatsSection";
import { FAQ } from "@/components/landing/FAQ";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col w-full">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        <Hero />
        <Problems />
        <HowItWorks />
        <MobileApp />
        <GettingStarted />
        <Benefits />
        <StatsSection />
        <FAQ />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
