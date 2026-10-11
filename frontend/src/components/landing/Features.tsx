"use client";

import React from "react";
import {
  Map,
  Navigation,
  Sparkles,
  BellRing,
  History,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";

const features = [
  {
    icon: <Map className="h-6 w-6 text-primary-green" />,
    title: "GPS Waste Tagging",
    desc: "Residents drop a geofenced bin tag on their house coordinates. Drivers see exact coordinates instead of searching streets.",
  },
  {
    icon: <Navigation className="h-6 w-6 text-primary-green" />,
    title: "Smart Pathfinding",
    desc: "The system runs routing algorithms daily, creating the fastest path for drivers based only on active requests.",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-primary-green" />,
    title: "Eco Category Guides",
    desc: "Understand what waste fits into Plastic, Paper, Glass, and Organic Food bins with intuitive app illustrations.",
  },
  {
    icon: <BellRing className="h-6 w-6 text-primary-green" />,
    title: "Proximity Reminders",
    desc: "Receive automated alerts when the collection truck is within 500 meters of your tagged home coordinate.",
  },
  {
    icon: <History className="h-6 w-6 text-primary-green" />,
    title: "Collection Records",
    desc: "Keep audit logs of every request, with photographs, stamps, and weight metrics, building municipal trust.",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-primary-green" />,
    title: "Carbon Offset Logging",
    desc: "View dynamic carbon offset stats based on reduced truck route distances, motivating eco-behavior.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-background relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-green dark:text-accent-green">
            System Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Built for Modern <span className="text-gradient-green">Smart Cities</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-text font-medium leading-relaxed mt-2">
            Green City integrates administrative mapping tools with simple citizen-facing actions to deliver a seamless municipal ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full border border-card-border bg-card-bg/20">
                <CardContent className="pt-6 flex flex-col gap-3">
                  <div className="p-3 bg-primary-green/5 dark:bg-accent-green/10 border border-primary-green/10 rounded-2xl w-fit">
                    {feat.icon}
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-muted-text leading-relaxed font-semibold">
                    {feat.desc}
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
