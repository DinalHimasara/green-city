import React from "react";
import { cn } from "@/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "error" | "info" | "default";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[14px] font-semibold tracking-wide border",
        {
          "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400":
            variant === "success",
          "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400":
            variant === "warning",
          "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400":
            variant === "error",
          "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400":
            variant === "info",
          "bg-muted-bg text-muted-text border-card-border":
            variant === "default",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
