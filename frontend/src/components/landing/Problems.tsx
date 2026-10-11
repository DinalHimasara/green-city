"use client";

import React from "react";
import {
  Clock,
  Compass,
  AlertTriangle,
  Flame,
  Route,
  Activity,
  Fuel
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";

const problems = [
  {
    icon: <Route className="h-6 w-6 text-red-500" />,
    title: "Traditional Fixed Routes",
    desc: "Trucks visit every single street on a set timetable, driving through empty zones and wasting municipal assets.",
  },
  {
    icon: <Fuel className="h-6 w-6 text-red-500" />,
    title: "Excessive Fuel Waste",
    desc: "Fixed routes mean trucks idle in congested traffic needlessly, consuming expensive public diesel fuel.",
  },
  {
    icon: <Clock className="h-6 w-6 text-red-500" />,
    title: "Unpredictable Collection",
    desc: "Residents place trash outside for hours, unaware of when trucks will arrive, leading to public clutter.",
  },
  {
    icon: <Flame className="h-6 w-6 text-red-500" />,
    title: "Overflowing Public Bins",
    desc: "Bins remain overflowing for days, creating unpleasant odors and unmanaged toxic heaps.",
  },
  {
    icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
    title: "Stray Animal Interventions",
    desc: "Scattered garbage invites stray dogs and cats, tearing bags and spreading trash across roads.",
  },
  {
    icon: <Activity className="h-6 w-6 text-red-500" />,
    title: "Public Health Risks",
    desc: "Decaying waste and stagnating liquids trigger rodent breeding, exposing communities to disease.",
  },
  
];

export function Problems() {
  return (
    <section id="problems" className="py-24 relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#F2F7F4]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-red-500">
            The Challenges
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Problems with Traditional <span className="text-red-500">Waste Collection</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-text font-medium leading-relaxed mt-2">
            Rigid workflows waste taxpayers' money and pollute our environment. Here are the core issues we are solving:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((prob, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full border border-card-border/80 bg-card-bg/15 hover:border-red-500/10 hover:shadow-red-500/5">
                <CardContent className="pt-6 flex flex-col gap-3">
                  <div className="p-3 bg-red-500/5 dark:bg-red-950/10 border border-red-500/10 rounded-2xl w-fit">
                    {prob.icon}
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">
                    {prob.title}
                  </h3>
                  <p className="text-xs text-muted-text leading-relaxed font-semibold">
                    {prob.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
