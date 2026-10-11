"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 cursor-pointer outline-none active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.03]",
          {
            "bg-primary-green text-white hover:bg-primary-green-hover shadow-md hover:shadow-primary-green/20 hover:shadow-lg":
              variant === "primary",
            "bg-secondary-green text-white hover:bg-secondary-green/90 shadow-sm":
              variant === "secondary",
            "bg-accent-green text-[#091811] hover:bg-accent-green-hover shadow-sm":
              variant === "accent",
            "border-2 border-primary-green/20 text-primary-green hover:bg-primary-green/5 dark:border-accent-green/25 dark:text-accent-green dark:hover:bg-accent-green/5":
              variant === "outline",
            "text-muted-text hover:bg-muted-bg hover:text-foreground":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-red-500/20":
              variant === "danger",
          },
          {
            "px-4 py-1.5 text-[14.5px]": size === "sm",
            "px-6 py-2.5 text-[16.5px]": size === "md",
            "px-8 py-3.5 text-[18.5px]": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
