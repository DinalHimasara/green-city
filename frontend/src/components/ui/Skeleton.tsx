import React from "react";
import { cn } from "@/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-full bg-muted-bg dark:bg-[#0c1410] border border-card-border/50",
        className
      )}
      {...props}
    />
  );
}
