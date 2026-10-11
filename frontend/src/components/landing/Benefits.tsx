"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Sparkles,
  TrendingDown,
  Gauge,
  Clock,
  Navigation,
  Heart
} from "lucide-react";
import { motion, useInView, animate } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";

const benefits = [
  {
    icon: <Sparkles className="h-5 w-5 text-primary-green" />,
    title: "Cleaner Municipal City",
    metric: "98%",
    sub: "Cleanliness Index",
    desc: "Bins are emptied before they spill over, ensuring pristine roads, gutters, and walking areas.",
    progress: 98,
  },
  {
    icon: <TrendingDown className="h-5 w-5 text-primary-green" />,
    title: "Reduced Diesel Consumption",
    metric: "-35%",
    sub: "Fuel Saved Weekly",
    desc: "Optimized route dispatch prevents trucks from idling and visiting neighborhoods without active bins.",
    progress: 35,
  },
  {
    icon: <Gauge className="h-5 w-5 text-primary-green" />,
    title: "Lower Carbon Emissions",
    metric: "12.4t",
    sub: "Tons CO₂ Offset Monthly",
    desc: "Shorter routes and idle control directly decrease greenhouse gas emissions in municipal zones.",
    progress: 68,
  },
  {
    icon: <Clock className="h-5 w-5 text-primary-green" />,
    title: "Faster Collection Speed",
    metric: "2.4h",
    sub: "Saved Per Driver Shift",
    desc: "Immediate GPS targeting allows driver crews to complete their ward collection hours ahead of schedule.",
    progress: 80,
  },
  {
    icon: <Navigation className="h-5 w-5 text-primary-green" />,
    title: "Better Route Logistics",
    metric: "+45%",
    sub: "Logistics Optimization",
    desc: "Municipal coordinators dynamically adjust collection zones based on demand rather than static lists.",
    progress: 45,
  },
  {
    icon: <Heart className="h-5 w-5 text-primary-green" />,
    title: "Improved Public Health",
    metric: "94%",
    sub: "Citizen Satisfaction Rate",
    desc: "Lower organic accumulation prevents pests and harmful rodent activity near housing complexes.",
    progress: 94,
  },
];

function AnimatedMetric({ value, inView }: { value: string; inView: boolean }) {
  const [displayVal, setDisplayVal] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      hasAnimated.current = true;
      const match = value.match(/^([+-]?)([\d.]+)(.*)$/);
      if (match) {
        const prefix = match[1];
        const targetNum = parseFloat(match[2]);
        const suffix = match[3];

        const controls = animate(0, targetNum, {
          duration: 1.8,
          ease: "easeOut",
          onUpdate(val) {
            const isDecimal = targetNum % 1 !== 0;
            const formatted = isDecimal ? val.toFixed(1) : Math.round(val).toString();
            setDisplayVal(`${prefix}${formatted}${suffix}`);
          }
        });
        return () => controls.stop();
      } else {
        setDisplayVal(value);
      }
    }
  }, [inView, value]);

  return <span>{displayVal}</span>;
}

export function Benefits() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });

  return (
    <section ref={sectionRef} id="benefits" className="py-24 bg-[#FFFFFF] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-green dark:text-accent-green">
            Environmental Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            The Benefits of <span className="text-gradient-green">Smart Waste Logistics</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-text font-medium leading-relaxed mt-2">
            By shifting from static routes to dynamic scheduling, the Badulla Municipal Council achieves high-impact sustainability milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((ben, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
            >
              <Card className="group h-full border border-card-border bg-card-bg/25 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary-green/5 hover:border-primary-green/20 transition-all duration-300">
                <CardContent className="pt-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-primary-green/5 dark:bg-accent-green/10 border border-primary-green/10 rounded-2xl w-fit group-hover:rotate-6 group-hover:scale-105 transition-all duration-300">
                      {ben.icon}
                    </div>
                    <span className="text-2xl font-black text-primary-green dark:text-accent-green">
                      <AnimatedMetric value={ben.metric} inView={inView} />
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-extrabold text-foreground">{ben.title}</h3>
                    <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider">{ben.sub}</p>
                    <p className="text-[11px] text-muted-text leading-relaxed font-semibold mt-2">{ben.desc}</p>
                  </div>
                </CardContent>

                <div className="px-6 pb-6 mt-auto">
                  <div className="h-1.5 w-full bg-muted-bg dark:bg-[#13221a] rounded-full overflow-hidden border border-card-border/30">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={inView ? { width: `${ben.progress}%` } : { width: "0%" }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                      className="h-full bg-primary-green dark:bg-accent-green rounded-full group-hover:shadow-[0_0_8px_rgba(15,92,59,0.5)] group-hover:bg-[#2E8B57] transition-all duration-300"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
