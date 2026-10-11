"use client";

import React from "react";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { Button } from "./Button";
import { reportService } from "@/services/report.service";

interface ReportExportProps {
  title: string;
  headers: string[];
  rows: string[][];
  filename: string;
}

export function ReportExport({ title, headers, rows, filename }: ReportExportProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => reportService.exportToCSV(headers, rows, filename)}
        className="text-[11px] py-1 h-8 font-bold border-card-border bg-card-bg/10 hover:bg-muted-bg/50 cursor-pointer"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
        Export Excel
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => reportService.exportToPDF(title)}
        className="text-[11px] py-1 h-8 font-bold border-card-border bg-card-bg/10 hover:bg-muted-bg/50 cursor-pointer"
      >
        <FileText className="h-3.5 w-3.5 text-rose-500 mr-1.5" />
        Export PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => reportService.exportToPDF(title)}
        className="text-[11px] py-1 h-8 font-bold border-card-border bg-card-bg/10 hover:bg-muted-bg/50 cursor-pointer"
      >
        <Printer className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
        Print Report
      </Button>
    </div>
  );
}
