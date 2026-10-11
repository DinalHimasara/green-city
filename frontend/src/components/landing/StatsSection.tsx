"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { ChartWrapper } from "@/components/ui/ChartWrapper";
import { Card, CardContent } from "@/components/ui/Card";

const data = [
  { month: "Jan", Organic: 24, Recyclables: 12 },
  { month: "Feb", Organic: 28, Recyclables: 15 },
  { month: "Mar", Organic: 35, Recyclables: 22 },
  { month: "Apr", Organic: 42, Recyclables: 30 },
  { month: "May", Organic: 55, Recyclables: 45 },
  { month: "Jun", Organic: 72, Recyclables: 65 },
];

export function StatsSection() {
  return (
    <section id="statistics" className="py-24 bg-gradient-to-b from-[#F2F7F4] to-[#E8F2EC] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-green dark:text-accent-green">
            Performance Statistics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Recycling & Collection <span className="text-gradient-green">Growth</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-text font-medium leading-relaxed mt-2">
            A visual overview of the monthly tonnage collected and recycled since the launch of the smart collection framework.
          </p>
        </div>

        <Card className="border border-card-border bg-card-bg/30 backdrop-blur-md p-6 sm:p-8">
          <CardContent className="p-0">
            <h3 className="text-base font-extrabold text-foreground mb-6">
              Monthly Waste Collected (Metric Tons)
            </h3>
            
            <ChartWrapper height={320}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F5C3B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0F5C3B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRecyclables" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8BC34A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8BC34A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,92,59,0.06)" />
                  <XAxis
                    dataKey="month"
                    stroke="#8FA69B"
                    fontSize={11}
                    fontWeight="bold"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#8FA69B"
                    fontSize={11}
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--card-border)",
                      borderRadius: "16px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Organic"
                    stroke="#0F5C3B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorOrganic)"
                    name="Organic Waste"
                  />
                  <Area
                    type="monotone"
                    dataKey="Recyclables"
                    stroke="#8BC34A"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRecyclables)"
                    name="Recyclables (Plastic/Glass)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </CardContent>
        </Card>

      </div>
    </section>
  );
}
