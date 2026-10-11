"use client";

import React from "react";
import { MapPin, Calendar, Bell, Truck, BadgeCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";

const steps = [
  {
    num: "01",
    icon: <MapPin className="h-6 w-6 text-primary-green" />,
    title: "Mark Your Location",
    desc: "Open the mobile app at home, select your waste type, and tap the map to save your exact pickup location.",
  },
  {
    num: "02",
    icon: <Calendar className="h-6 w-6 text-primary-green" />,
    title: "Request Scheduled",
    desc: "Your collection request is placed on the dashboard for your neighborhood's designated pickup day.",
  },
  {
    num: "03",
    icon: <Bell className="h-6 w-6 text-primary-green" />,
    title: "Get Notified",
    desc: "Receive a notification on your smartphone when the collection truck enters your neighborhood.",
  },
  {
    num: "04",
    icon: <Truck className="h-6 w-6 text-primary-green" />,
    title: "Waste Collection",
    desc: "Place your sorted bins outside. The collection team visits your coordinates and empties your bins.",
  },
  {
    num: "05",
    icon: <BadgeCheck className="h-6 w-6 text-primary-green" />,
    title: "Request Completed",
    desc: "The request is marked as done, and you can view your personal collection logs inside the app anytime.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#FFFFFF] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-green dark:text-accent-green">
            Citizen Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            How Green City <span className="text-gradient-green">Works</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-text font-medium leading-relaxed mt-2">
            Disposing of household waste sustainably has never been simpler. Follow these five basic steps:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch relative">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            return (
              <div key={idx} className="flex flex-col lg:flex-row items-center gap-4 relative h-full">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="w-full h-full"
                >
                  <Card className="h-full border border-card-border bg-card-bg/25 flex flex-col relative overflow-hidden">
                    <div className="absolute top-2 right-4 text-3xl font-black text-primary-green/5 dark:text-accent-green/5 select-none">
                      {step.num}
                    </div>

                    <CardContent className="pt-6 flex flex-col gap-3.5 h-full">
                      <div className="p-3 bg-primary-green/5 dark:bg-accent-green/10 border border-primary-green/10 rounded-2xl w-fit">
                        {step.icon}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-sm font-extrabold text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-[11px] text-muted-text leading-relaxed font-semibold">
                          {step.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {!isLast && (
                  <div className="hidden lg:flex items-center justify-center text-primary-green/20 dark:text-accent-green/20 animate-pulse-soft">
                    <ArrowRight className="h-5 w-5 stroke-[3px]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
