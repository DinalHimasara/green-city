"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  KeyRound,
  MapPin,
  Layers,
  Bell,
  History as HistoryIcon,
  UserCheck,
  Smile,
  Download,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const appScreens = [
  {
    id: "p1",
    title: "Select User Type",
    image: "/P1.jpeg",
  },
  {
    id: "p2",
    title: "Secure Login",
    image: "/P2.jpeg",
  },
  {
    id: "p3",
    title: "User Registration",
    image: "/P3.jpeg",
  },
  {
    id: "p4",
    title: "Waste Category Selection",
    image: "/P4.jpeg",
  },
  {
    id: "p5",
    title: "Waste Category Selection",
    image: "/P5.jpeg",
  },
  {
    id: "p6",
    title: "Collection History",
    image: "/P6.jpeg",
  },
  {
    id: "p7",
    title: "User Profile",
    image: "/P7.jpeg",

  },
];

const featuresList = [
  { icon: <User className="h-5 w-5 text-primary-green" />, text: "Select User Type" },
  { icon: <KeyRound className="h-5 w-5 text-primary-green" />, text: "Secure Login" },
  { icon: <MapPin className="h-5 w-5 text-primary-green" />, text: "User Registration" },
  { icon: <Layers className="h-5 w-5 text-primary-green" />, text: "Driver Registration" },
  { icon: <Bell className="h-5 w-5 text-primary-green" />, text: "Waste Category Selection" },
  { icon: <HistoryIcon className="h-5 w-5 text-primary-green" />, text: "Collection History" },
  { icon: <UserCheck className="h-5 w-5 text-primary-green" />, text: "User Profile" },
  { icon: <MapPin className="h-5 w-5 text-primary-green" />, text: "Navigation Map" },
];

export function MobileApp() {
  const [screenIndex, setScreenIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScreenIndex((prev) => (prev + 1) % appScreens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="mobile-app" className="py-24 bg-[#F2F7F4] relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col items-center justify-center order-2 lg:order-1">
            <div className="relative w-[280px] h-[560px] bg-black rounded-[42px] p-3 shadow-2xl border-[6px] border-zinc-800 select-none">
              <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-white border border-zinc-700/30">
                <img
                  src={appScreens[screenIndex].image}
                  alt={appScreens[screenIndex].title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-28 bg-black/40 rounded-full z-10" />
              </div>

              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-10 h-1 bg-zinc-800 rounded-full" />
              </div>
            </div>

            <div className="flex gap-1.5 mt-6">
              {appScreens.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setScreenIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === screenIndex
                    ? "w-6 bg-primary-green"
                    : "w-2 bg-muted-text/30"
                    }`}
                  aria-label={`Show app screen ${idx + 1}`}
                />
              ))}
            </div>

            <span className="text-[10px] uppercase font-bold text-muted-text mt-2.5">
              Active: {appScreens[screenIndex].title}
            </span>
          </div>

          <div className="flex flex-col gap-6 order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-green dark:text-accent-green">
              Resident Application
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
              Green City <span className="text-gradient-green">Mobile App</span>
            </h2>
            <p className="text-sm text-muted-text leading-relaxed font-medium">
              Manage your household waste collection easily. Mark your bin locations, select the correct garbage category, and get notified in real-time when the driver approaches your block.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {featuresList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-center p-3 rounded-2xl border border-card-border bg-card-bg/20 backdrop-blur-sm"
                >
                  <div className="p-2 bg-primary-green/5 dark:bg-accent-green/10 border border-primary-green/10 rounded-xl">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <a
                href="/GreenCity.apk"
                download="GreenCity.apk"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  className="w-full sm:w-auto text-xs py-3"
                >
                  <Download className="h-4 w-4" />
                  Download App (Android .APK)
                </Button>
              </a>

              <a
                href="/Registration-Guide.pdf"
                download="Registration-Guide.pdf"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-xs py-3"
                >
                  <BookOpen className="h-4 w-4" />
                  View Registration Guide
                </Button>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
