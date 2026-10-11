"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Is the Green City mobile app free to use?",
    answer: "Yes, the app is completely free of charge. The development, server maintenance, and driver integration are fully funded by the Badulla Municipal Council IT and Environment Division.",
  },
  {
    question: "How do I know when the garbage truck will arrive?",
    answer: "The mobile app uses GPS geofencing. When the collection truck enters your ward boundaries and gets within 500 meters of your pinned address, your phone will push an audio alert and notification.",
  },
  {
    question: "Can I report garbage pile-ups in public spaces?",
    answer: "Absolutely. In the app, select the 'Public Accumulation' category, snap a quick photo, and tag the coordinates. The ward supervisor will route a collection crew to clear the pile.",
  },
  {
    question: "What items should go into the Recyclable container?",
    answer: "Sorted items like clean plastic bottles, cardboard packaging, newspaper sheets, metal tins, and empty glass jars. Food scraps, wet papers, and garden waste must go into the Organic bin.",
  },
  {
    question: "Who is eligible to register for this platform?",
    answer: "Currently, any resident or business owner operating within the official administrative boundaries of the Badulla Municipal Council can register and use the service.",
  },
  {
    question: "What happens if the driver misses my scheduled pickup?",
    answer: "If your waste is not picked up, open your Request History, tap the specific request, and select 'Report Missed Collection'. This immediately notifies the ward admin to dispatch a follow-up truck.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-[#FFFFFF] relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-green dark:text-accent-green">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Frequently Asked <span className="text-gradient-green">Questions</span>
          </h2>
          <p className="text-sm text-muted-text font-medium leading-relaxed mt-2">
            Find answers to common citizen inquiries about mobile registration, collection timing, and sorting guidelines.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-card-border bg-card-bg/20 backdrop-blur-sm overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-sm sm:text-base text-foreground cursor-pointer outline-none hover:bg-muted-bg/10"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-text transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary-green" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-muted-text leading-relaxed font-semibold border-t border-card-border/30">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
