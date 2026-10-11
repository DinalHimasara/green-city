"use client";

import React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[14.5px] font-bold uppercase tracking-wider text-muted-text px-1">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 rounded-full border border-card-border bg-card-bg/40 text-foreground text-[15px] md:text-[16.5px] backdrop-blur-sm outline-none transition-all duration-300 placeholder:text-muted-text/40 focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 dark:focus:border-accent-green dark:focus:ring-accent-green/10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[14.5px] font-medium text-red-500 mt-0.5 px-2">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
