"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Leaf, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const navItems = [
  { id: "home", label: "Home" },
  { id: "problems", label: "Problems" },
  { id: "how-it-works", label: "How It Works" },
  { id: "mobile-app", label: "Mobile App" },
  { id: "getting-started", label: "Get Started" },
  { id: "benefits", label: "Benefits" },
  { id: "contact", label: "Contact" },
];

export function Navbar() {
  const [activeItem, setActiveItem] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveItem(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 px-4 sm:px-6 lg:px-8 py-4 pointer-events-none transition-all duration-300">
      <div
        className={
          "mx-auto max-w-7xl flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500 pointer-events-auto relative " +
          (scrolled || mobileMenuOpen
            ? "glass-navbar scale-[0.98] sm:scale-100"
            : "bg-transparent border-transparent shadow-none")
        }
      >
       <div
  onClick={() => {
    handleScrollTo("home");
    setMobileMenuOpen(false);
  }}
  className="flex items-center gap-3 cursor-pointer group"
>
  <img
    src="/logo_new.png"
    alt="Green City Logo"
    className="h-13 w-13 object-contain group-hover:rotate-12 transition-all duration-300"
  />

  <span className="text-xl font-black tracking-tight text-foreground uppercase leading-none">
    Green <span className="text-primary-green">City</span>
  </span>
</div>

        <nav className="hidden lg:flex items-center gap-1 relative bg-muted-bg/50 border border-card-border/60 rounded-full p-1">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className={
                  "relative px-4.5 py-2 text-xs font-semibold transition-all duration-300 cursor-pointer rounded-full outline-none " +
                  (isActive 
                    ? "text-white font-bold" 
                    : "text-muted-text hover:text-[#1B6B43]")
                }
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-[#1B6B43] hover:bg-[#145736] rounded-full z-0 shadow-[0_8px_24px_rgba(27,107,67,0.28)] transition-all duration-300"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full border border-card-border bg-card-bg/50 text-muted-text hover:text-foreground hover:bg-muted-bg transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-3 p-4 rounded-3xl border border-card-border bg-white/95 backdrop-blur-md shadow-lg flex flex-col gap-1.5 lg:hidden pointer-events-auto"
            >
              {navItems.map((item) => {
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleScrollTo(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={
                      "w-full text-left px-4 py-2.5 text-xs font-bold transition-all duration-200 rounded-full " +
                      (isActive
                        ? "bg-[#1B6B43] text-white"
                        : "text-muted-text hover:text-foreground hover:bg-muted-bg/50")
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
