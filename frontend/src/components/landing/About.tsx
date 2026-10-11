"use client";

import React from "react";
import { Target, Compass, Eye, ShieldCheck, Route, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";

export function About() {
  const cards = [
    {
      icon: <Target className="h-6 w-6 text-primary-green" />,
      title: "Our Mission",
      desc: "To digitize and optimize municipal waste collection, minimizing carbon footprint and promoting environmental sustainability across Badulla city.",
    },
    {
      icon: <Eye className="h-6 w-6 text-secondary-green" />,
      title: "Our Vision",
      desc: "A carbon-neutral, zero-garbage municipal model using AI-driven routes optimization and citizen-first interactive waste disposal alerts.",
    },
    {
      icon: <Compass className="h-6 w-6 text-accent-green" />,
      title: "Core Objectives",
      desc: "Reduce diesel fuel waste by 35%, eliminate overflowing public garbage bins, and establish full transparency between citizens and garbage truck drivers.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-muted-bg/30 dark:bg-[#080d0a]/30 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-green dark:text-accent-green">
            About the Initiative
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            A Greener Path for <span className="text-gradient-green">Badulla City</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-text font-medium leading-relaxed mt-2">
            The Green City project is a smart municipal waste initiative launched to modernize traditional, fixed-route waste logistics, turning them into responsive digital networks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <h3 className="text-2xl font-extrabold text-foreground">
              Why Traditional Collection Fails
            </h3>
            <p className="text-sm text-muted-text leading-relaxed font-medium">
              Municipal waste logistics currently operate on rigid, static schedules. Trucks follow predetermined routes daily, irrespective of whether garbage bins are empty or overflowing. 
            </p>
            <div className="space-y-4 mt-2">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl">
                  <Route className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Rigid Route Schedules</h4>
                  <p className="text-xs text-muted-text mt-0.5 leading-relaxed">
                    Trucks drive thousands of kilometers through empty streets, leading to excessive carbon emissions and massive fuel expenditures.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Overflowing Public Waste Bins</h4>
                  <p className="text-xs text-muted-text mt-0.5 leading-relaxed">
                    Infrequent pickups result in garbage pile-ups, inviting stray animals, emitting toxic odors, and threatening public hygiene.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-6 p-8 rounded-3xl border border-card-border bg-card-bg/40 backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary-green" />
              BMC Smart Pilot Project
            </h3>
            <p className="text-xs sm:text-sm text-muted-text leading-relaxed font-medium">
              We are introducing an interactive citizen tracking panel and intelligent scheduling middleware in Badulla. 
              Residents can report trash accumulations, which are plotted on active driver coordinates. The backend system maps optimized collections based on actual demand.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-2xl bg-muted-bg/50 dark:bg-[#0c1410] border border-card-border/60">
                <span className="text-2xl font-black text-primary-green dark:text-accent-green">Phase 1</span>
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider mt-1">Ward 03 Pilot Area</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted-bg/50 dark:bg-[#0c1410] border border-card-border/60">
                <span className="text-2xl font-black text-primary-green dark:text-accent-green">14 Days</span>
                <p className="text-[10px] font-bold text-muted-text uppercase tracking-wider mt-1">Setup Turnaround</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full border border-card-border bg-card-bg/25">
                <CardContent className="pt-6 flex flex-col gap-3">
                  <div className="p-3 bg-muted-bg dark:bg-[#0F1A14] border border-card-border rounded-2xl w-fit">
                    {c.icon}
                  </div>
                  <h4 className="text-base font-extrabold text-foreground">{c.title}</h4>
                  <p className="text-xs text-muted-text leading-relaxed font-semibold">{c.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
