"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon = <Inbox className="h-10 w-10 text-muted-text/50" />,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-card-border bg-card-bg/30 backdrop-blur-md min-h-[250px]">
      <div className="p-4 bg-muted-bg dark:bg-[#0c1410] border border-card-border rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-[17.5px] font-extrabold mb-1">{title}</h3>
      <p className="text-[13.5px] text-muted-text max-w-xs mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}
