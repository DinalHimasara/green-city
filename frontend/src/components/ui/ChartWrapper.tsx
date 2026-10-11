"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "./Skeleton";

interface ChartWrapperProps {
  children: React.ReactNode;
  height?: number | string;
}

export function ChartWrapper({ children, height = 300 }: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center p-6 bg-muted-bg/5 rounded-3xl border border-card-border/20"
      >
        <div className="w-full h-full flex flex-col gap-3 justify-end items-stretch">
          <div className="flex gap-2 items-end justify-between h-[80%] px-4">
            <Skeleton className="w-[10%] h-[30%] rounded-t-lg rounded-b-none" />
            <Skeleton className="w-[10%] h-[60%] rounded-t-lg rounded-b-none" />
            <Skeleton className="w-[10%] h-[45%] rounded-t-lg rounded-b-none" />
            <Skeleton className="w-[10%] h-[75%] rounded-t-lg rounded-b-none" />
            <Skeleton className="w-[10%] h-[90%] rounded-t-lg rounded-b-none" />
            <Skeleton className="w-[10%] h-[40%] rounded-t-lg rounded-b-none" />
            <Skeleton className="w-[10%] h-[55%] rounded-t-lg rounded-b-none" />
          </div>
          <div className="flex justify-between items-center px-4">
            <Skeleton className="w-12 h-3" />
            <Skeleton className="w-12 h-3" />
            <Skeleton className="w-12 h-3" />
            <Skeleton className="w-12 h-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full relative">
      {children}
    </div>
  );
}
