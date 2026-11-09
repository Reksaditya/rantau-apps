"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionGridProps {
  items: FaqItem[];
}

export function FaqAccordionGrid({ items }: FaqAccordionGridProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.question}
            className={`rounded-xl border transition-colors bg-[#FFFFFF] ${
              isOpen ? "border-[#1B8366]" : "border-[#E1E8E4]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 p-5 text-left cursor-pointer"
            >
              <span className="font-heading text-sm sm:text-base font-bold text-[#172B25]">
                {item.question}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isOpen
                    ? "bg-[#1B8366] text-[#FFFFFF]"
                    : "bg-[#E8F4F0] text-[#1B8366]"
                }`}
              >
                {isOpen ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-[#E1E8E4] px-5 pb-5 pt-3 text-sm leading-[1.6] text-[#52645D]">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

