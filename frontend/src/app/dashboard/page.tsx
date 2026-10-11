"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Truck,
  Trash2,
  Users,
  AlertCircle,
  PlusCircle,
  FilePlus,
  Send,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award
} from "lucide-react";
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

import { useGreenCityStore, Driver, ResidentUser, DailyCollection, RouteAssignment, BinLocation } from "@/store/greenCityStore";
import { driverService, DriverLocation } from "@/services/driver.service";
import { residentService } from "@/services/resident.service";
import { collectionService } from "@/services/collection.service";
import { routeService } from "@/services/route.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { requestService, WasteRequest } from "@/services/request.service";

const LiveTrackingMap = dynamic(
  () => import("@/components/dashboard/LiveTrackingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-muted-bg/10 rounded-3xl border border-card-border/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-8 w-8 text-primary-green animate-spin" />
          <span className="text-xs font-bold text-muted-text">Loading Smart Map...</span>
        </div>
      </div>
    ),
  }
);

interface QuickDriverForm {
  email: string;
  password: string;
  name: string;
  nic: string;
  phone: string;
  vehicleNo: string;
  status: "Online" | "Offline";
  currentWard: string;
}

interface QuickWasteForm {
  date: string;
  category: string;
  weightKg: string;
}

interface QuickRouteForm {
  driverId: string;
  date: string;
  category: string;
  estimatedDistanceKm: string;
}

interface QuickNotificationForm {
  recipientType: "All" | "Residents" | "Drivers";
  type: "Broadcast" | "Reminder" | "Emergency";
  title: string;
  message: string;
}

export default function OverviewPage() {
  const router = useRouter();
  const store = useGreenCityStore();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [residents, setResidents] = useState<ResidentUser[]>([]);
  const [dailyCollections, setDailyCollections] = useState<DailyCollection[]>([]);
  const [routes, setRoutes] = useState<RouteAssignment[]>([]);
  const [requests, setRequests] = useState<WasteRequest[]>([]);

    const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);

  const liveDrivers = useMemo<Driver[]>(() => {
    return drivers.map((d) => {
      const loc = driverLocations.find((l) => l.id === d.id);
      return loc
        ? { ...d, latitude: loc.latitude, longitude: loc.longitude, locationUpdatedAt: loc.updatedAt }
        : d;
    });
  }, [drivers, driverLocations]);

  useEffect(() => {
    const refreshLocations = async () => {
      if (document.hidden) return;
      try {
        setDriverLocations(await driverService.getLocations());
      } catch {}
    };

    refreshLocations();
    const timer = setInterval(refreshLocations, 5000);
    return () => clearInterval(timer);
  }, []);

  const loadAll = async () => {
    const results = await Promise.allSettled([
      driverService.getAll(),
      residentService.getAll(),
      collectionService.getDailyCollections(),
      routeService.getAll(),
      requestService.getAll(),
    ]);

    const names = ["drivers", "residents", "daily collections", "routes", "requests"];
    const failed: string[] = [];

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        failed.push(names[i]);
        console.error("Dashboard load failed: " + names[i], r.reason);
      }
    });

    if (results[0].status === "fulfilled") setDrivers(results[0].value);
    if (results[1].status === "fulfilled") setResidents(results[1].value);
    if (results[2].status === "fulfilled") setDailyCollections(results[2].value);
    if (results[3].status === "fulfilled") setRoutes(results[3].value);
    if (results[4].status === "fulfilled") setRequests(results[4].value);

    if (failed.length > 0) {
      toast.error("Failed to load: " + failed.join(", "));
    }
  };
    const mapBins = useMemo<BinLocation[]>(() => {
    const seen: Record<string, number> = {};

    return requests
      .filter((r) => r.status !== "Other" && Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
      .map((r) => {
        const key = r.latitude.toFixed(4) + "," + r.longitude.toFixed(4);
        const index = seen[key] || 0;
        seen[key] = index + 1;

        const angle = index * 2.4;
        const radius = index === 0 ? 0 : 0.0003 * Math.ceil(index / 6);

        return {
          id: r.id,
          reporterName: r.residentName,
          address: r.address,
          latitude: r.latitude + Math.sin(angle) * radius,
          longitude: r.longitude + Math.cos(angle) * radius,
          wasteType: r.wasteType,
          status: r.status as BinLocation["status"],
          createdAt: r.createdAt,
        } as BinLocation;
      });
  }, [requests]);

  useEffect(() => {
    loadAll();
  }, []);

  const [modalType, setModalType] = useState<"driver" | "waste" | "route" | "notification" | null>(null);

  const driverForm = useForm<QuickDriverForm>({ defaultValues: { status: "Online", currentWard: "Badulla Ward 03" } });
  const wasteForm = useForm<QuickWasteForm>({ defaultValues: { date: new Date().toISOString().split('T')[0], category: "Food Waste" } });
  const routeForm = useForm<QuickRouteForm>({ defaultValues: { date: new Date().toISOString().split('T')[0], category: "Food Waste" } });
  const ntfForm = useForm<QuickNotificationForm>({ defaultValues: { recipientType: "All", type: "Broadcast" } });

  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCols = dailyCollections.filter((c) => c.date === todayStr);
    const todayWeight = todayCols.reduce((sum, c) => sum + c.weightKg, 0);

    const pending = requests.filter((r) => r.status === "Pending").length;
    const completed = requests.filter((r) => r.status === "Collected").length;
    const residentCount = residents.length;
    const driverCount = drivers.length;


    return {
      todayWeight: todayWeight.toFixed(1),
      pending,
      completed,
      residentCount,
      driverCount,
    };
  }, [requests, residents, drivers, dailyCollections]);

  const todaysSchedule = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return routes.filter((r) => r.date === todayStr);
  }, [routes]);

  const onAddDriver = async (data: QuickDriverForm) => {
    try {
      await driverService.create({
        email: data.email,
        password: data.password,
        name: data.name,
        nic: data.nic,
        phone: data.phone,
        vehicleNo: data.vehicleNo,
        status: data.status,
        currentWard: data.currentWard,
      });
      toast.success("Driver registered successfully via Quick Action.");
      setModalType(null);
      driverForm.reset();
      loadAll();
    } catch {
      toast.error("Failed to register driver.");
    }
  };

  const onAddWaste = async (data: QuickWasteForm) => {
    const w = parseFloat(data.weightKg);
    if (isNaN(w) || w <= 0) {
      toast.error("Please enter a valid weight quantity.");
      return;
    }
    try {
      const nowStr = new Date().toISOString();
      await collectionService.createDailyCollection({
        date: data.date,
        category: data.category,
        weightKg: w,
        recordedBy: "Council Admin",
        createdAt: nowStr,
        updatedAt: nowStr,
      });
      toast.success("Daily waste record logged successfully.");
      setModalType(null);
      wasteForm.reset();
      loadAll();
    } catch {
      toast.error("Failed to log waste record.");
    }
  };

  const onAssignRoute = async (data: QuickRouteForm) => {
    const dist = parseFloat(data.estimatedDistanceKm);
    try {
      await routeService.create({
        driverId: data.driverId,
        date: data.date,
        category: data.category,
        estimatedDistanceKm: isNaN(dist) ? 12.5 : dist,
        status: "Pending",
      });
      toast.success("New route dispatch assigned successfully.");
      setModalType(null);
      routeForm.reset();
      loadAll();
    } catch {
      toast.error("Failed to assign route.");
    }
  };

  const onSendNotification = (data: QuickNotificationForm) => {
    store.sendNotification({
      recipientType: data.recipientType,
      type: data.type,
      title: data.title,
      message: data.message,
    });
    toast.success("Broadcast notification sent successfully.");
    setModalType(null);
    ntfForm.reset();
  };

  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    return last7Days.map((dateStr) => {
      const dayCols = dailyCollections.filter((c) => c.date === dateStr);
      const totalWeight = dayCols.reduce((sum, c) => sum + c.weightKg, 0);
      const dateObj = new Date(dateStr);
      const name = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      return { name, weight: totalWeight };
    });
  }, [dailyCollections]);

  const categoryDistribution = useMemo(() => {
    const catTotals: Record<string, number> = {};
    dailyCollections.forEach((c) => {
      catTotals[c.category] = (catTotals[c.category] || 0) + c.weightKg;
    });
    const list = Object.entries(catTotals).map(([name, value]) => ({ name, value }));
    if (list.length > 0) {
      return list.sort((a, b) => b.value - a.value);
    }
    return [
      { name: "Food Waste", value: 0 },
      { name: "Plastic", value: 0 },
      { name: "Polythene", value: 0 },
      { name: "Paper", value: 0 },
      { name: "Glass", value: 0 },
    ];
  }, [dailyCollections]);

  const colorsDistribution = ["#0F5C3B", "#3B82F6", "#F59E0B", "#EF4444", "#8BC34A"];

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <div className="w-full">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-[19px] font-black text-foreground uppercase tracking-tight">
              Live Fleet Dispatch Map
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-primary-green uppercase bg-primary-green/5 border border-primary-green/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Live Coordinates Syncing
          </div>
        </div>
        <div className="w-full h-[400px]">
          <LiveTrackingMap bins={mapBins} drivers={liveDrivers} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-5 flex flex-col gap-1 justify-center min-h-[115px]">
            <span className="text-[12px] font-bold text-muted-text uppercase tracking-wider block">Today's Collections</span>
            <span className="text-xl font-black text-foreground mt-1 block">
              {metrics.todayWeight} <span className="text-xs text-muted-text font-semibold">Kg</span>
            </span>
  
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 flex flex-col gap-1 justify-center min-h-[115px]">
            <span className="text-[12px] font-bold text-muted-text uppercase tracking-wider block">Pending Collections</span>
            <span className="text-xl font-black text-foreground mt-1 block">
              {metrics.pending} <span className="text-xs text-muted-text font-semibold">Requests</span>
            </span>
            
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 flex flex-col gap-1 justify-center min-h-[115px]">
            <span className="text-[12px] font-bold text-muted-text uppercase tracking-wider block">Completed Collections</span>
            <span className="text-xl font-black text-foreground mt-1 block">
              {metrics.completed} <span className="text-xs text-muted-text font-semibold">Runs</span>
            </span>
            
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 flex flex-col gap-1 justify-center min-h-[115px]">
            <span className="text-[12px] font-bold text-muted-text uppercase tracking-wider block">Registered Residents</span>
            <span className="text-xl font-black text-foreground mt-1 block">{metrics.residentCount}</span>
            
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 flex flex-col gap-1 justify-center min-h-[115px]">
            <span className="text-[12px] font-bold text-muted-text uppercase tracking-wider block">Registered Drivers</span>
            <span className="text-xl font-black text-foreground mt-1 block">{metrics.driverCount}</span>
            
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <Card className="lg:col-span-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15.5px] font-extrabold uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="h-4.5 w-4.5 text-primary-green" />
              Quick Administrative Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalType("driver")}
              className="h-14 flex flex-col items-center justify-center gap-1 rounded-2xl border-card-border bg-muted-bg hover:bg-muted-bg/50 hover:border-primary-green/30 cursor-pointer"
            >
              <Truck className="h-4.5 w-4.5 text-primary-green" />
              <span className="text-[12px] font-bold">Add Driver</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/drivers")}
              className="h-14 flex flex-col items-center justify-center gap-1 rounded-2xl border-card-border bg-muted-bg hover:bg-muted-bg/50 hover:border-primary-green/30 cursor-pointer"
            >
              <Truck className="h-4.5 w-4.5 text-blue-500" />
              <span className="text-[12px] font-bold">Add Truck</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalType("route")}
              className="h-14 flex flex-col items-center justify-center gap-1 rounded-2xl border-card-border bg-muted-bg hover:bg-muted-bg/50 hover:border-primary-green/30 cursor-pointer"
            >
              <MapPin className="h-4.5 w-4.5 text-amber-500" />
              <span className="text-[12px] font-bold">Assign Route</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalType("waste")}
              className="h-14 flex flex-col items-center justify-center gap-1 rounded-2xl border-card-border bg-muted-bg hover:bg-muted-bg/50 hover:border-primary-green/30 cursor-pointer"
            >
              <FilePlus className="h-4.5 w-4.5 text-purple-500" />
              <span className="text-[12px] font-bold">Add Waste Report</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15.5px] font-extrabold uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-amber-500" />
              Today's Schedule Panel
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[160px] no-scrollbar">
            {todaysSchedule.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="h-7 w-7 text-muted-text/45 mb-1" />
                <p className="text-[12px] text-muted-text font-bold">
                  No active collections dispatched for today yet.
                </p>
              </div>
            ) : (
              todaysSchedule.map((sch) => {
                const driver = drivers.find((d) => d.id === sch.driverId);
                return (
                  <div key={sch.id} className="flex items-center justify-between p-2.5 rounded-xl border border-card-border/80 bg-card-bg/20 text-[12px] font-bold">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary-green/5 border border-primary-green/10 text-primary-green">
                        <Truck className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-foreground">{driver ? driver.name : "Driver ID: " + sch.driverId}</p>
                        <p className="text-[10.5px] text-muted-text font-semibold uppercase">{driver?.vehicleNo} ({sch.category})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-foreground">{sch.estimatedDistanceKm} Km</p>
                        <p className="text-[10.5px] text-muted-text font-semibold uppercase">Est. Dist</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] ${sch.status === "Active" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"
                        }`}>
                        {sch.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <Card className="lg:col-span-7 flex flex-col justify-between">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-[15.5px] font-extrabold uppercase tracking-wider">
              Weekly Collection Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-end">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F5C3B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0F5C3B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="currentColor" className="text-[10.5px] opacity-50 width={35}" />
                  <YAxis stroke="currentColor" className="text-[10.5px] opacity-50" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--card-border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#0F5C3B" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-[15.5px] font-extrabold uppercase tracking-wider">
              Category Shares
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 flex flex-col items-center justify-between flex-1">
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorsDistribution[index % colorsDistribution.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--card-border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3.5 w-full mt-5 text-[12px] font-bold text-foreground">
              {categoryDistribution.map((entry, idx) => {
                const totalWeight = categoryDistribution.reduce((sum, item) => sum + item.value, 0);
                const pct = ((entry.value / totalWeight) * 100).toFixed(0);
                return (
                  <div key={entry.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <span style={{ backgroundColor: colorsDistribution[idx] }} className="w-2.5 h-2.5 rounded-full inline-block" />
                      <span>{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-primary-green/80 bg-primary-green/5 border border-primary-green/10 px-2 py-0.5 rounded-full text-[10.5px]">
                        {pct}%
                      </span>
                      <span className="text-muted-text">{entry.value} Kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>

      <Modal isOpen={modalType === "driver"} onClose={() => setModalType(null)} title="Quick Add Driver Profile" className="max-w-md">
        <form onSubmit={driverForm.handleSubmit(onAddDriver)} className="space-y-4">
          <Input label="Driver Full Name *" placeholder="Jagath Bandara" {...driverForm.register("name", { required: true })} />
          <Input label="NIC Number *" placeholder="920392038V" {...driverForm.register("nic", { required: true })} />
          <Input label="Phone Number *" placeholder="077-111-2222" {...driverForm.register("phone", { required: true })} />
          <Input label="Truck Number (Vehicle No) *" placeholder="BMC-5592" {...driverForm.register("vehicleNo", { required: true })} />
          <Select
            label="Duty Status"
            options={[
              { value: "Online", label: "Online (Active Duty)" },
              { value: "Offline", label: "Offline (Off Duty)" },
            ]}
            {...driverForm.register("status")}
          />
          <Select
            label="Home Ward assignment"
            options={[
              { value: "Badulla Ward 01", label: "Badulla Ward 01" },
              { value: "Badulla Ward 02", label: "Badulla Ward 02" },
              { value: "Badulla Ward 03", label: "Badulla Ward 03" },
              { value: "Badulla Ward 04", label: "Badulla Ward 04" },
            ]}
            {...driverForm.register("currentWard")}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Create Profile</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === "waste"} onClose={() => setModalType(null)} title="Quick Log Daily Collection" className="max-w-md">
        <form onSubmit={wasteForm.handleSubmit(onAddWaste)} className="space-y-4">
          <Input type="date" label="Collection Date *" {...wasteForm.register("date", { required: true })} />
          <Select
            label="Waste Category *"
            options={store.categories.map((c) => ({ value: c.name, label: c.name }))}
            {...wasteForm.register("category")}
          />
          <Input type="number" step="0.1" label="Collected Quantity (Kg) *" placeholder="140.5" {...wasteForm.register("weightKg", { required: true })} />
          <div className="flex justify-end gap-3 pt-3 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Save Record</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === "route"} onClose={() => setModalType(null)} title="Quick Assign Route Log" className="max-w-md">
        <form onSubmit={routeForm.handleSubmit(onAssignRoute)} className="space-y-4">
          <Select
            label="Select Available Driver *"
            options={drivers.filter(d => d.status === "Online").map((d) => ({ value: d.id, label: `${d.name} (${d.vehicleNo})` }))}
            {...routeForm.register("driverId", { required: true })}
          />
          <Input type="date" label="Assignment Date *" {...routeForm.register("date", { required: true })} />
          <Select
            label="Waste Category *"
            options={store.categories.map((c) => ({ value: c.name, label: c.name }))}
            {...routeForm.register("category")}
          />
          <Input type="number" step="0.1" label="Estimated Distance (Km) *" placeholder="15.2" {...routeForm.register("estimatedDistanceKm", { required: true })} />
          <div className="flex justify-end gap-3 pt-3 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Assign Route</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === "notification"} onClose={() => setModalType(null)} title="Quick Send System Notification" className="max-w-md">
        <form onSubmit={ntfForm.handleSubmit(onSendNotification)} className="space-y-4">
          <Select
            label="Recipient Group *"
            options={[
              { value: "All", label: "All Council Users" },
              { value: "Residents", label: "Residents Only" },
              { value: "Drivers", label: "Drivers Only" },
            ]}
            {...ntfForm.register("recipientType")}
          />
          <Select
            label="Notification Urgency *"
            options={[
              { value: "Broadcast", label: "Standard Broadcast" },
              { value: "Reminder", label: "Collection Schedule Reminder" },
              { value: "Emergency", label: "Emergency Alert" },
            ]}
            {...ntfForm.register("type")}
          />
          <Input label="Notification Title *" placeholder="Monsoon weather schedule shift" {...ntfForm.register("title", { required: true })} />
          <div>
            <label className="text-[10px] font-bold text-muted-text uppercase tracking-wider block mb-1">Message Content *</label>
            <textarea
              className="w-full text-xs font-bold text-foreground border border-card-border rounded-2xl p-3 bg-card-bg/25 focus:outline-none focus:border-primary-green"
              rows={3}
              placeholder="Write the full broadcast warning content here..."
              {...ntfForm.register("message", { required: true })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalType(null)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Broadcast Send</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
