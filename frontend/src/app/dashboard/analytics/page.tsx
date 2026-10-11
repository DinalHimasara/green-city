"use client";
import React, { useState, useEffect, useMemo } from "react";
import { BarChart3, TrendingUp, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { analyticsService, AnalyticsSummary } from "@/services/analytics.service";
import { ReportExport } from "@/components/ui/ReportExport";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(true);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getSummary(timeframe);
      setSummary(data);
    } catch {
      toast.error("Failed to load analytics aggregates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [timeframe]);

  const COLORS = ["#0F5C3B", "#3B82F6", "#F59E0B", "#EF4444", "#8BC34A"];

  const reportHeaders = ["Analytics Item", "Metric Value"];
  const reportRows = useMemo(() => {
    if (!summary) return [];
    return [
      ["Most Active Area", summary.mostActiveArea],
      ["Most Collected Waste Class", summary.mostCollectedCategory],
      ["Avg Response Time (Hours)", `${summary.averageResponseTimeHours} Hrs`],
      ["Collection Efficiency", `${summary.collectionEfficiencyPercent}%`],
    ];
  }, [summary]);

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Analytics Engine</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {summary && (
            <ReportExport
              title="Municipal Waste Analytics Report"
              headers={reportHeaders}
              rows={reportRows}
              filename={`GreenCity_Analytics_${timeframe}`}
            />
          )}
        </div>
      </div>

      <div className="flex gap-2 p-1 border border-card-border rounded-2xl bg-card-bg/10 max-w-sm">
        {(["daily", "weekly", "monthly", "yearly"] as const).map((t) => (
          <Button
            key={t}
            variant={timeframe === t ? "primary" : "ghost"}
            size="sm"
            onClick={() => setTimeframe(t)}
            className="flex-1 text-[11px] font-bold py-1 h-8 rounded-xl uppercase tracking-wider cursor-pointer"
          >
            {t}
          </Button>
        ))}
      </div>

      {isLoading || !summary ? (
        <div className="py-40 flex flex-col justify-center items-center gap-3 text-xs font-bold text-muted-text">
          <Loader2 className="h-7 w-7 animate-spin text-primary-green" />
          <span>Generating Analytics Models...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Most Active Route</span>
                <span className="text-lg font-black text-foreground mt-1 block">{summary.mostActiveArea}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Top Category</span>
                <span className="text-lg font-black text-foreground mt-1 block">{summary.mostCollectedCategory}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Avg Response Time</span>
                <span className="text-lg font-black text-foreground mt-1 block">{summary.averageResponseTimeHours} Hours</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Efficiency Score</span>
                <span className="text-lg font-black text-primary-green dark:text-accent-green mt-1 block">{summary.collectionEfficiencyPercent}%</span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

            <Card className="lg:col-span-8">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider">Weight Trends</CardTitle>

              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.monthlyTrends}>
                      <defs>
                        <linearGradient id="colCollected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0F5C3B" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0F5C3B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="currentColor" className="text-[9px] opacity-60" />
                      <YAxis stroke="currentColor" className="text-[9px] opacity-60" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card-bg)",
                          borderColor: "var(--card-border)",
                          borderRadius: "12px",
                          fontSize: "10px",
                          fontWeight: "bold",
                        }}
                      />
                      <Area type="monotone" dataKey="collected" name="Collected Weight (Tons)" stroke="#0F5C3B" strokeWidth={2} fillOpacity={1} fill="url(#colCollected)" />
                      <Area type="monotone" dataKey="target" name="Target Objective (Tons)" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                      <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider">Category Share</CardTitle>

              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.categoryDistribution}
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {summary.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card-bg)",
                          borderColor: "var(--card-border)",
                          borderRadius: "12px",
                          fontSize: "10px",
                          fontWeight: "bold",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 w-full mt-2 text-[12px] font-bold text-foreground">
                  {summary.categoryDistribution.map((entry, idx) => (
                    <div key={entry.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span style={{ backgroundColor: COLORS[idx] }} className="w-3.5 h-3.5 rounded-full inline-block" />
                        <span>{entry.name}</span>
                      </div>
                      <span className="text-muted-text">{entry.value} Kg</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>




          </div>
        </>
      )}
    </div>
  );
}
