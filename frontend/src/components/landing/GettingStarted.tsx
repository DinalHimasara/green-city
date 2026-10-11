"use client";

import React from "react";
import {
  Download,
  UserPlus,
  KeyRound,
  MapPin,
  Trash2,
  Sparkles,
  History,
  Leaf
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";

const steps = [
  {
    icon: <Download className="h-5 w-5 text-white" />,
    title: "Download App",
    desc: "Download the official Green City citizen APK from the Badulla Municipal Council portal.",
  },
  {
    icon: <UserPlus className="h-5 w-5 text-white" />,
    title: "Create Account",
    desc: "Sign up with your full name, mobile number, ward selection, and address coordinates.",
  },
  {
    icon: <KeyRound className="h-5 w-5 text-white" />,
    title: "Verify & Login",
    desc: "Input your temporary registration credentials to verify your profile security.",
  },
  {
    icon: <MapPin className="h-5 w-5 text-white" />,
    title: "Pin Home Location",
    desc: "Set your permanent location pin on the interactive Map to show the truck your driveway.",
  },
  {
    icon: <Trash2 className="h-5 w-5 text-white" />,
    title: "Select Waste Category",
    desc: "Create a request, choosing the specific sorted waste category (Plastic, Organic, Glass, etc.).",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-white" />,
    title: "Place Bins Outside",
    desc: "Put out your sorted bins once you receive the notification that the driver is nearby.",
  },
  {
    icon: <History className="h-5 w-5 text-white" />,
    title: "Audit Collection History",
    desc: "Verify the driver's signature in your history and view your total weight logs.",
  },
];

export function GettingStarted() {
  return (
    <section id="getting-started" className="py-24 bg-gradient-to-b from-[#FFFFFF] to-[#E8F2EC] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-green">
            Onboarding Timeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Getting Started with <span className="text-gradient-green">Green City</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-text font-medium leading-relaxed mt-2">
            Set up your citizen account and start submitting your waste schedules in under five minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="relative pl-8 md:pl-10 space-y-8">
            <div className="absolute left-4 md:left-4 top-2 bottom-2 w-0.5 bg-primary-green/10" />

            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="relative"
              >
                <div className="absolute -left-8 md:-left-10 top-1.5 -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-primary-green border-4 border-background flex items-center justify-center shadow-sm animate-pulse-soft">
                    {step.icon}
                  </div>
                </div>

                <Card className="border border-card-border bg-card-bg/25">
                  <CardContent className="pt-5 pb-5">
                    <h3 className="text-sm font-extrabold text-foreground">{step.title}</h3>
                    <p className="text-[11px] text-muted-text mt-1 leading-relaxed font-semibold">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="lg:sticky lg:top-32 flex justify-center items-center h-full min-h-[450px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-xl aspect-square flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-green/8 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
              
              <div className="absolute top-12 left-8 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-primary-green/10 shadow-md animate-float z-10">
                <Leaf className="h-5 w-5 text-primary-green" />
              </div>
              <div className="absolute bottom-20 right-8 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-primary-green/10 shadow-md animate-float-delayed z-10">
                <Sparkles className="h-5 w-5 text-accent-green" />
              </div>
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 p-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-primary-green/10 shadow-md animate-float z-10 hidden sm:block">
                <MapPin className="h-4.5 w-4.5 text-[#2E8B57]" />
              </div>

              <img
                src="/getting-started-illustration-new.png?v=1"
                alt="Illustrated Resident using Green City"
                className="w-[90%] sm:w-full h-auto object-contain drop-shadow-xl animate-float relative z-0"
              />
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}
