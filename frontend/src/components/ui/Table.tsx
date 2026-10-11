"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Input } from "./Input";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface TableFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filters?: TableFilter[];
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  renderMobileCard?: (item: T) => React.ReactNode;
  itemsPerPage?: number;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Search records...",
  searchKeys = [],
  filters = [],
  emptyTitle = "No records found",
  emptyDescription = "There are no matching entries in our system.",
  onRowClick,
  renderMobileCard,
  itemsPerPage = 5,
}: TableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    filters.forEach((f) => {
      initial[f.key] = "";
    });
    return initial;
  });

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesFilters = Object.entries(activeFilters).every(([key, val]) => {
        if (!val) return true;
        return String(item[key]).toLowerCase() === val.toLowerCase();
      });

      if (!matchesFilters) return false;

      if (!searchQuery) return true;
      if (searchKeys.length === 0) {
        return Object.values(item).some((v) =>
          String(v).toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return searchKeys.some((k) =>
        String(item[k]).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [data, activeFilters, searchQuery, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      return sortOrder === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {(searchKeys.length > 0 || filters.length > 0) && (
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {searchKeys.length > 0 && (
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text/60" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-[14.5px]"
              />
            </div>
          )}

          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
              {filters.map((filter) => (
                <div key={filter.key} className="relative">
                  <select
                    value={activeFilters[filter.key]}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="px-4 py-2 rounded-full border border-card-border bg-card-bg/40 text-[14.5px] text-foreground backdrop-blur-sm outline-none transition-all duration-300 focus:border-primary-green appearance-none pr-8 cursor-pointer"
                  >
                    <option value="">All {filter.label}</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-text" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="w-full">
        {isLoading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-10 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ) : paginatedData.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionText={searchQuery || Object.values(activeFilters).some(Boolean) ? "Clear Filters" : undefined}
            onAction={() => {
              setSearchQuery("");
              setActiveFilters(
                Object.keys(activeFilters).reduce((acc, curr) => ({ ...acc, [curr]: "" }), {})
              );
            }}
          />
        ) : (
          <>
            <div className="hidden md:block w-full overflow-x-auto rounded-3xl border border-card-border bg-card-bg/20 backdrop-blur-md">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-card-border bg-muted-bg/30 text-muted-text text-[14.5px] font-bold uppercase tracking-wider">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && handleSort(col.key)}
                        className={cn(
                          "px-6 py-4 select-none",
                          col.sortable && "cursor-pointer hover:text-foreground transition-colors"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {col.header}
                          {col.sortable && (
                            sortKey === col.key ? (
                              sortOrder === "asc" ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 text-muted-text/40" />
                            )
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {paginatedData.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        "hover:bg-muted-bg/25 transition-all duration-200",
                        onRowClick && "cursor-pointer"
                      )}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-6 py-4.5 font-medium text-foreground text-[15px]">
                          {col.render ? col.render(item) : item[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col gap-3">
              {paginatedData.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "p-5 rounded-3xl border border-card-border bg-card-bg/40 backdrop-blur-md shadow-sm flex flex-col gap-3.5 active:scale-[0.98] transition-all duration-200",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {renderMobileCard ? (
                    renderMobileCard(item)
                  ) : (
                    columns.map((col) => (
                      <div key={col.key} className="flex justify-between items-center gap-2 border-b border-card-border/40 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-[12px] uppercase font-bold text-muted-text">
                          {col.header}
                        </span>
                        <span className="text-[14px] font-semibold text-foreground">
                          {col.render ? col.render(item) : item[col.key]}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-2 border-t border-card-border/20">
                <span className="text-[14.5px] text-muted-text font-medium">
                  Showing <span className="text-foreground font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="text-foreground font-semibold">
                    {Math.min(currentPage * itemsPerPage, sortedData.length)}
                  </span>{" "}
                  of <span className="text-foreground font-semibold">{sortedData.length}</span> records
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full border border-card-border bg-card-bg/40 text-muted-text hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted-bg/50 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-[14.5px] font-semibold text-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full border border-card-border bg-card-bg/40 text-muted-text hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted-bg/50 transition-all cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
