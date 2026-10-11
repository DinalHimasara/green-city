import { useGreenCityStore } from "@/store/greenCityStore";
import { collectionService } from "@/services/collection.service";
import { routeService } from "@/services/route.service";

export interface AnalyticsSummary {
  mostActiveArea: string;
  mostCollectedCategory: string;
  averageResponseTimeHours: number;
  collectionEfficiencyPercent: number;
  wardPerformance: { name: string; requests: number; efficiency: number }[];
  categoryDistribution: { name: string; value: number }[];
  monthlyTrends: { month: string; collected: number; target: number }[];
  weeklyTrends: { day: string; organic: number; recyclable: number }[];
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const analyticsService = {
  getSummary: async (timeframe: "daily" | "weekly" | "monthly" | "yearly" = "monthly"): Promise<AnalyticsSummary> => {
    const store = useGreenCityStore.getState();
    const collections = await collectionService.getDailyCollections();

    const catTotals: Record<string, number> = {};
    collections.forEach((c) => {
      catTotals[c.category] = (catTotals[c.category] || 0) + c.weightKg;
    });
    const categoryDistribution = Object.entries(catTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const mostCollectedCategory = categoryDistribution[0]?.name || "Food Waste";

    const monthlyTotals: Record<number, number> = {};
    collections.forEach((c) => {
      const month = new Date(c.date).getMonth();
      monthlyTotals[month] = (monthlyTotals[month] || 0) + c.weightKg;
    });

    const currentMonth = new Date().getMonth();
    let monthSlice: number[];
    if (timeframe === "daily" || timeframe === "weekly") {
      monthSlice = [currentMonth];
    } else if (timeframe === "yearly") {
      monthSlice = Array.from({ length: 12 }, (_, i) => i);
    } else {
      monthSlice = Array.from({ length: 6 }, (_, i) => (currentMonth - 5 + i + 12) % 12);
    }

    const monthValues = Object.values(monthlyTotals);
    const avgMonthly = monthValues.length > 0
      ? monthValues.reduce((s, v) => s + v, 0) / monthValues.length
      : 500;
    const target = Math.round(avgMonthly * 1.1);

    const monthlyTrends = monthSlice.map((m) => ({
      month: MONTH_LABELS[m],
      collected: Math.round(monthlyTotals[m] || 0),
      target,
    }));

    const factor = timeframe === "daily" ? 0.3 : timeframe === "weekly" ? 0.7 : timeframe === "yearly" ? 12 : 1;

    let routes: any[] = [];
    try {
      routes = await routeService.getAll();
    } catch {}
    const completedCount = routes.filter((r) => r.status === "Completed").length;
    const collectionEfficiencyPercent =
      routes.length > 0 ? Math.round((completedCount / routes.length) * 100) : 0;
      

    const wardCounts: Record<string, number> = {};
    store.bins.forEach((b) => {
      const ward = b.address.includes("Bandarawela") ? "Ward 02" : "Ward 03";
      wardCounts[ward] = (wardCounts[ward] || 0) + 1;
    });
    const sortedWards = Object.entries(wardCounts).sort((a, b) => b[1] - a[1]);
    const mostActiveArea = sortedWards[0]?.[0] || "Ward 03";

    return {
      mostActiveArea,
      mostCollectedCategory,
      averageResponseTimeHours: parseFloat((4.2 * factor).toFixed(1)),
      collectionEfficiencyPercent: Math.min(
        100,
        Math.round(collectionEfficiencyPercent * (factor > 1 ? 0.98 : 1))
      ),
      wardPerformance: [
        { name: "Ward 01", requests: Math.round(24 * factor), efficiency: 89 },
        { name: "Ward 02", requests: Math.round(48 * factor), efficiency: 94 },
        { name: "Ward 03", requests: Math.round(62 * factor), efficiency: 96 },
        { name: "Ward 04", requests: Math.round(18 * factor), efficiency: 85 },
      ],
      categoryDistribution:
        categoryDistribution.length > 0
          ? categoryDistribution
          : [
              { name: "Food Waste", value: 0 },
              { name: "Plastic",    value: 0 },
              { name: "Polythene",  value: 0 },
              { name: "Paper",      value: 0 },
              { name: "Glass",      value: 0 },
            ],
      monthlyTrends:
        monthlyTrends.length > 0
          ? monthlyTrends
          : [{ month: MONTH_LABELS[currentMonth], collected: 0, target }],
      weeklyTrends: [
        { day: "Mon", organic: Math.round(45 * factor), recyclable: Math.round(30 * factor) },
        { day: "Tue", organic: Math.round(55 * factor), recyclable: Math.round(35 * factor) },
        { day: "Wed", organic: Math.round(40 * factor), recyclable: Math.round(28 * factor) },
        { day: "Thu", organic: Math.round(65 * factor), recyclable: Math.round(42 * factor) },
        { day: "Fri", organic: Math.round(50 * factor), recyclable: Math.round(38 * factor) },
        { day: "Sat", organic: Math.round(75 * factor), recyclable: Math.round(45 * factor) },
        { day: "Sun", organic: Math.round(30 * factor), recyclable: Math.round(20 * factor) },
      ],
    };
  },
};
