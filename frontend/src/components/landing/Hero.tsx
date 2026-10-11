"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Download, Leaf, ShieldCheck, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

function CountUp({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export function Hero() {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-background to-background"
    >
<div className="hidden lg:block absolute inset-0 -z-10 pointer-events-none">
  <div className="mx-auto max-w-7xl h-full w-full relative">
    <div
      className="absolute -right-30 top-1/2 -translate-y-1/2 w-[65%] h-[85%] bg-no-repeat bg-contain"
      style={{
        backgroundImage: "url('/hero-bg-illustration.png?v=1')",
        backgroundPosition: "right center",
        maskImage:
          "radial-gradient(circle at 65% 50%, black 40%, transparent 90%)",
        WebkitMaskImage:
          "radial-gradient(circle at 65% 50%, black 40%, transparent 90%)",
      }}
    />
  </div>
</div>

      <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-primary-green/5 dark:bg-primary-green/10 rounded-full blur-3xl animate-pulse-soft -z-10" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-accent-green/5 dark:bg-accent-green/10 rounded-full blur-3xl animate-pulse-soft -z-10" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{
            y: ["0px", "400px"],
            x: ["0px", "50px"],
            rotate: [0, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/10 left-1/4 text-primary-green/20"
        >
          <Leaf className="h-6 w-6" />
        </motion.div>
        <motion.div
          animate={{
            y: ["0px", "500px"],
            x: ["0px", "-60px"],
            rotate: [0, -360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/5 right-1/4 text-accent-green/20"
        >
          <Leaf className="h-8 w-8" />
        </motion.div>
      </div>

      <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-6 text-center lg:text-left"
        >
          <div className="mx-auto lg:mx-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-green/10 bg-primary-green/5 text-primary-green dark:text-accent-green text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            Badulla Smart Municipal Initiative
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground tracking-tight">
            Transforming Waste Collection Into A{" "}
            <span className="text-gradient-green">Smarter Future</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-text max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Empowering citizens and drivers with automated route scheduling, live GPS waste bins tagging, and real-time municipal notifications for the Badulla Municipal Council.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-2">
            <Button
              onClick={() => handleScrollTo("getting-started")}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleScrollTo("mobile-app")}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Download Mobile App
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-card-border/80 pt-8 mt-4 max-w-md mx-auto lg:mx-0">
            <div className="flex flex-col gap-1 items-center lg:items-start">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary-green dark:text-accent-green">
                <CountUp end={12500} suffix="+" />
              </span>
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">
                Residents Registered
              </span>
            </div>
            <div className="flex flex-col gap-1 items-center lg:items-start">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary-green dark:text-accent-green">
                <CountUp end={48} suffix="%" />
              </span>
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">
                CO₂ Emissions Reduced
              </span>
            </div>
            <div className="flex flex-col gap-1 items-center lg:items-start">
              <span className="text-2xl sm:text-3xl font-extrabold text-primary-green dark:text-accent-green">
                <CountUp end={96} suffix="%" />
              </span>
              <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">
                Collection Efficiency
              </span>
            </div>
          </div>
        </motion.div>

        <div className="hidden lg:block w-full h-full pointer-events-none" />
      </div>

      <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 cursor-pointer" onClick={() => handleScrollTo("problems")}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
          Scroll Down
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-5 h-8 rounded-full border-2 border-muted-text/30 flex justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-primary-green" />
        </motion.div>
      </div>
    </section>
  );
}
