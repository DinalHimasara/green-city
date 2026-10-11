"use client";

import React from "react";
import { cn } from "@/utils/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[14.5px] font-bold uppercase tracking-wider text-muted-text px-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full px-4 py-2.5 rounded-full border border-card-border bg-card-bg/40 text-foreground text-[15px] md:text-[16.5px] backdrop-blur-sm outline-none transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 dark:focus:border-accent-green dark:focus:ring-accent-green/10 appearance-none cursor-pointer pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-background text-foreground"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-text">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-[14.5px] font-medium text-red-500 mt-0.5 px-2">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
