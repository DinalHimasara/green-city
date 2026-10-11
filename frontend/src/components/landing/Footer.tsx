"use client";

import React from "react";
import Link from "next/link";
import { Leaf, Globe, Mail, Landmark } from "lucide-react";

export function Footer() {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-[#145736] via-[#0F5C3B] to-[#083B29] py-12 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo_new.png" alt="Green City Logo" className="h-10 w-10 object-contain" />
              <span className="text-base font-black tracking-tight text-white uppercase">
                Green <span className="text-[#8BC34A]">City</span>
              </span>
            </div>
            <p className="text-xs text-white/82 leading-relaxed font-semibold">
              Badulla Municipal Council's Smart Waste Management system. Promoting clean streets, reduced greenhouse gases, and modern public logistics.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-white/88">
              <li>
                <button onClick={() => handleScrollTo("home")} className="hover:text-[#8BC34A] transition cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo("about")} className="hover:text-[#8BC34A] transition cursor-pointer">
                  About Green City
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo("how-it-works")} className="hover:text-[#8BC34A] transition cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo("mobile-app")} className="hover:text-[#8BC34A] transition cursor-pointer">
                  Mobile App
                </button>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Community
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-white/88">
              <li>
                <button onClick={() => handleScrollTo("benefits")} className="hover:text-[#8BC34A] transition cursor-pointer">
                  Eco Benefits
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo("faq")} className="hover:text-[#8BC34A] transition cursor-pointer">
                  Citizens FAQ
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo("contact")} className="hover:text-[#8BC34A] transition cursor-pointer">
                  Contact Support
                </button>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#8BC34A] transition">
                  Admin Dashboard Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Official Links
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-white/88">
              <li className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-white" />
                <a
                  href="https://badulla.mc.gov.lk"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#8BC34A] transition"
                >
                  Municipal Portal
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-white" />
                <a
                  href="https://gov.lk"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#8BC34A] transition"
                >
                  Sri Lanka Government
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-white" />
                <a href="mailto:info@badulla.mc.gov.lk" className="hover:text-[#8BC34A] transition">
                  info@badulla.mc.gov.lk
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/12 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-bold text-white/82 uppercase tracking-wider">
            © 2026 Badulla Municipal Council IT Division. All Rights Reserved.
          </span>
          <div className="flex gap-4 text-xs font-semibold text-white/88">
            <a href="#privacy" className="hover:text-[#8BC34A] transition">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-[#8BC34A] transition">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
