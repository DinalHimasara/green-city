"use client";

import { create } from "zustand";

export interface BinLocation {
  id: string;
  reporterName: string;
  address: string;
  latitude: number;
  longitude: number;
  wasteType: string;
  status: "Pending" | "Assigned" | "Collected";
  assignedDriverId?: string;
  weightKg?: number;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  nic: string;
  phone: string;
  vehicleNo: string;
  status: "Online" | "Offline";
  currentWard: string;
  assignedRoute?: string;
  collectionDay?: string;
  latitude?: number;
  longitude?: number;
  locationUpdatedAt?: string;
}

export interface ResidentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  ward: string;
  status: "Active" | "Suspended";
  createdAt: string;
  latitude: number;
  longitude: number;
  firebaseUid?: string;
}

export interface DailyCollection {
  id: string;
  date: string;
  category: string;
  weightKg: number;
  remarks?: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  createdAt: string;
}

export interface RouteAssignment {
  id: string;
  driverId: string;
  routeName?: string;
  date: string;
  category: string;
  estimatedDistanceKm: number;
  status: "Pending" | "Active" | "Completed";
}

export interface NotificationLog {
  id: string;
  recipientType: "All" | "Residents" | "Drivers";
  recipientName?: string;
  type: "Broadcast" | "Reminder" | "Emergency";
  title: string;
  message: string;
  createdAt: string;
  status: "Sent" | "Scheduled";
}

export interface SystemSettings {
  notificationRadiusMeters: number;
  collectionDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  autoRouteDispatch: boolean;
  smsAlerts: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

interface GreenCityState {
  bins: BinLocation[];
  drivers: Driver[];
  residents: ResidentUser[];
  dailyCollections: DailyCollection[];
  categories: WasteCategory[];
  routeAssignments: RouteAssignment[];
  notifications: NotificationLog[];
  settings: SystemSettings;
  activityLogs: ActivityLog[];

  logActivity: (action: string, details: string) => void;

  addBin: (bin: Omit<BinLocation, "id" | "createdAt">) => void;
  updateBin: (id: string, updates: Partial<BinLocation>) => void;
  deleteBin: (id: string) => void;
  assignDriverToBin: (binId: string, driverId: string) => void;
  collectBin: (binId: string, weightKg: number) => void;
  
  addDriver: (driver: Omit<Driver, "id">) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  toggleDriverStatus: (id: string) => void;
  
  addResident: (resident: Omit<ResidentUser, "id" | "createdAt">) => void;
  updateResident: (id: string, updates: Partial<ResidentUser>) => void;
  deleteResident: (id: string) => void;

  addDailyCollection: (collection: Omit<DailyCollection, "id">) => void;
  updateDailyCollection: (id: string, updates: Partial<DailyCollection>) => void;
  deleteDailyCollection: (id: string) => void;

  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;

  addRouteAssignment: (assignment: Omit<RouteAssignment, "id">) => void;
  updateRouteAssignment: (id: string, updates: Partial<RouteAssignment>) => void;
  deleteRouteAssignment: (id: string) => void;

  sendNotification: (notification: Omit<NotificationLog, "id" | "createdAt" | "status">) => void;

  updateSettings: (updates: Partial<SystemSettings>) => void;

  admins: { id: string; name: string; email: string; role: string; password?: string }[];
  addAdmin: (admin: { name: string; email: string; role: string; password?: string }) => void;
  removeAdmin: (id: string) => void;
}

const initialBins: BinLocation[] = [
  {
    id: "bin_1",
    reporterName: "Amara Perera",
    address: "12 Library Road, Badulla",
    latitude: 6.9934,
    longitude: 81.0550,
    wasteType: "Food Waste",
    status: "Pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "bin_2",
    reporterName: "Chaminda Alwis",
    address: "45 Bandarawela Road, Badulla",
    latitude: 6.9890,
    longitude: 81.0520,
    wasteType: "Plastic",
    status: "Assigned",
    assignedDriverId: "drv_1",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "bin_3",
    reporterName: "Ruwan Jayewardene",
    address: "88 Keppetipola Road, Badulla",
    latitude: 6.9965,
    longitude: 81.0585,
    wasteType: "Food Waste",
    status: "Collected",
    assignedDriverId: "drv_1",
    weightKg: 14.5,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "bin_4",
    reporterName: "Nimal Fernando",
    address: "23 King Street, Badulla",
    latitude: 6.9905,
    longitude: 81.0601,
    wasteType: "Polythene",
    status: "Pending",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "bin_5",
    reporterName: "Fathima Riza",
    address: "107 Pine Hill Road, Badulla",
    latitude: 6.9845,
    longitude: 81.0495,
    wasteType: "Glass",
    status: "Pending",
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
];

const initialDrivers: Driver[] = [
  {
    id: "drv_1",
    name: "Nishantha Silva",
    nic: "850239482V",
    phone: "077-987-6543",
    vehicleNo: "BMC-1209",
    status: "Online",
    currentWard: "Badulla Ward 03",
    assignedRoute: "Route 03-A",
    collectionDay: "Monday",
  },
  {
    id: "drv_2",
    name: "Kasun Perera",
    nic: "912384920V",
    phone: "071-456-7890",
    vehicleNo: "BMC-4530",
    status: "Online",
    currentWard: "Badulla Ward 02",
    assignedRoute: "Route 02-B",
    collectionDay: "Wednesday",
  },
  {
    id: "drv_3",
    name: "Samantha Bandara",
    nic: "882940294V",
    phone: "076-222-1111",
    vehicleNo: "BMC-8891",
    status: "Offline",
    currentWard: "Badulla Ward 04",
    assignedRoute: "Route 04-A",
    collectionDay: "Friday",
  },
];

const initialResidents: ResidentUser[] = [
  {
    id: "res_1",
    name: "Amara Perera",
    email: "amara@example.com",
    phone: "077-123-4567",
    address: "12 Library Road, Badulla",
    ward: "Badulla Ward 03",
    status: "Active",
    createdAt: "2026-06-10T12:00:00Z",
    latitude: 6.9934,
    longitude: 81.0550,
  },
  {
    id: "res_2",
    name: "Chaminda Alwis",
    email: "chaminda@example.com",
    phone: "071-333-4444",
    address: "45 Bandarawela Road, Badulla",
    ward: "Badulla Ward 03",
    status: "Active",
    createdAt: "2026-06-15T14:30:00Z",
    latitude: 6.9890,
    longitude: 81.0520,
  },
  {
    id: "res_3",
    name: "Ruwan Jayewardene",
    email: "ruwan@example.com",
    phone: "076-555-6666",
    address: "88 Keppetipola Road, Badulla",
    ward: "Badulla Ward 02",
    status: "Active",
    createdAt: "2026-06-18T10:15:00Z",
    latitude: 6.9965,
    longitude: 81.0585,
  },
  {
    id: "res_4",
    name: "Nimal Fernando",
    email: "nimal@example.com",
    phone: "077-888-9999",
    address: "23 King Street, Badulla",
    ward: "Badulla Ward 04",
    status: "Active",
    createdAt: "2026-06-20T09:00:00Z",
    latitude: 6.9905,
    longitude: 81.0601,
  },
  {
    id: "res_5",
    name: "Fathima Riza",
    email: "fathima@example.com",
    phone: "070-111-2222",
    address: "107 Pine Hill Road, Badulla",
    ward: "Badulla Ward 03",
    status: "Suspended",
    createdAt: "2026-06-25T11:45:00Z",
    latitude: 6.9845,
    longitude: 81.0495,
  },
];

const initialCategories: WasteCategory[] = [
  { id: "cat_1", name: "Food Waste", createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat_2", name: "Plastic", createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat_3", name: "Polythene", createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat_4", name: "Paper", createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat_5", name: "Glass", createdAt: "2026-01-01T00:00:00Z" },
];

const mkCol = (id: string, daysAgo: number, category: string, weightKg: number, remarks?: string): DailyCollection => {
  const ts = new Date(Date.now() - daysAgo * 86400000);
  const isoDate = ts.toISOString().split('T')[0];
  const isoTs = ts.toISOString();
  return { id, date: isoDate, category, weightKg, remarks, recordedBy: "Council Admin", createdAt: isoTs, updatedAt: isoTs };
};

const initialCollections: DailyCollection[] = [
  mkCol("col_1",  4, "Food Waste",  420),
  mkCol("col_2",  4, "Plastic",     185),
  mkCol("col_3",  4, "Polythene",   110),
  mkCol("col_4",  3, "Food Waste",  390, "Includes hotel district waste"),
  mkCol("col_5",  3, "Paper",       140),
  mkCol("col_6",  3, "Glass",       95),
  mkCol("col_7",  2, "Food Waste",  455),
  mkCol("col_8",  2, "Plastic",     220),
  mkCol("col_9",  2, "Polythene",   130),
  mkCol("col_10", 1, "Food Waste",  480, "Monday peak collection"),
  mkCol("col_11", 1, "Paper",       165),
  mkCol("col_12", 0, "Food Waste",  310),
  mkCol("col_13", 0, "Plastic",     175),
];

const initialRoutes: RouteAssignment[] = [
  {
    id: "rte_1",
    driverId: "drv_1",
    date: new Date().toISOString().split('T')[0],
    category: "Food Waste",
    estimatedDistanceKm: 14.2,
    status: "Active",
  },
  {
    id: "rte_2",
    driverId: "drv_2",
    date: new Date().toISOString().split('T')[0],
    category: "Plastic",
    estimatedDistanceKm: 18.5,
    status: "Pending",
  },
  {
    id: "rte_3",
    driverId: "drv_1",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    category: "Food Waste",
    estimatedDistanceKm: 12.8,
    status: "Completed",
  },
  {
    id: "rte_4",
    driverId: "drv_2",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    category: "Food Waste",
    estimatedDistanceKm: 15.0,
    status: "Pending",
  },
];

const initialNotifications: NotificationLog[] = [
  {
    id: "ntf_1",
    recipientType: "All",
    type: "Broadcast",
    title: "Scheduled Maintenance Notification",
    message: "Waste collection schedule might be slightly delayed this Thursday due to truck service updates.",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    status: "Sent",
  },
  {
    id: "ntf_2",
    recipientType: "Drivers",
    type: "Reminder",
    title: "Monsoon Safety Guidelines",
    message: "Please slow down in steep routes near pine hill road. Keep hazards turned on.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: "Sent",
  },
];

const initialSettings: SystemSettings = {
  notificationRadiusMeters: 500,
  collectionDays: ["Monday", "Wednesday", "Friday"],
  workingHoursStart: "08:00",
  workingHoursEnd: "17:00",
  autoRouteDispatch: true,
  smsAlerts: false,
};

const initialLogs: ActivityLog[] = [
  { id: "act_1", action: "System Started", details: "Badulla Smart Municipal Instance Initialized.", timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "act_2", action: "Driver Duty Status", details: "Driver Nishantha Silva marked Online.", timestamp: new Date(Date.now() - 43200000).toISOString() },
  { id: "act_3", action: "Route Assignment", details: "Route 03-A assigned to Nishantha Silva.", timestamp: new Date(Date.now() - 36000000).toISOString() },
];

const initialAdmins = [
  { id: "adm_1", name: "Council Administrator", email: "admin@greencity.lk", role: "Super Admin" },
  { id: "adm_2", name: "Municipal Health Officer", email: "officer@greencity.lk", role: "Inspector" },
];

const getStoredData = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
};

const saveStoredData = <T,>(key: string, data: T) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const useGreenCityStore = create<GreenCityState>((set) => ({
  bins: (() => {
    const data = getStoredData("green_city_bins", initialBins);
    const migrated = data.map((b) => {
      if (b.wasteType === "Plastic / Polythene / Paper / Glass") {
        return { ...b, wasteType: "Plastic" };
      }
      return b;
    });
    saveStoredData("green_city_bins", migrated);
    return migrated;
  })(),
  drivers: getStoredData("green_city_drivers", initialDrivers),
  residents: getStoredData("green_city_residents", initialResidents),
  dailyCollections: (() => {
    const data = getStoredData("green_city_daily_collections", initialCollections);
    const migrated = data.map((c) => {
      let category = c.category;
      if (category === "Plastic / Polythene / Paper / Glass" || category === "Plastic / Paper / Glass") {
        category = "Plastic";
      }
      const fallbackTs = c.createdAt || new Date().toISOString();
      return {
        ...c,
        category,
        recordedBy: c.recordedBy || "Council Admin",
        createdAt:  c.createdAt  || fallbackTs,
        updatedAt:  c.updatedAt  || fallbackTs,
      } as DailyCollection;
    });
    saveStoredData("green_city_daily_collections", migrated);
    return migrated;
  })(),
  categories: (() => {
    let cats = getStoredData("green_city_categories", initialCategories);
    cats = cats.filter((c) => c.name !== "Plastic / Polythene / Paper / Glass" && c.name !== "Plastic / Paper / Glass");
    const defaultNames = ["Food Waste", "Plastic", "Polythene", "Paper", "Glass"];
    defaultNames.forEach((name, index) => {
      if (!cats.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        cats.push({
          id: `cat_default_${index + 1}`,
          name,
          createdAt: "2026-01-01T00:00:00Z"
        });
      }
    });
    saveStoredData("green_city_categories", cats);
    return cats;
  })(),
  routeAssignments: (() => {
    const data = getStoredData("green_city_route_assignments", initialRoutes);
    const migrated = data.map((r) => {
      if (r.category === "Plastic / Polythene / Paper / Glass" || r.category === "Plastic / Paper / Glass") {
        return { ...r, category: "Plastic" };
      }
      return r;
    });
    saveStoredData("green_city_route_assignments", migrated);
    return migrated;
  })(),
  notifications: getStoredData("green_city_notifications", initialNotifications),
  settings: getStoredData("green_city_settings", initialSettings),
  activityLogs: getStoredData("green_city_activity_logs", initialLogs),
  admins: getStoredData("green_city_admins", initialAdmins),

  logActivity: (action, details) =>
    set((state) => {
      const updated = [
        {
          id: `act_${Date.now()}`,
          action,
          details,
          timestamp: new Date().toISOString(),
        },
        ...state.activityLogs,
      ].slice(0, 50);
      saveStoredData("green_city_activity_logs", updated);
      return { activityLogs: updated };
    }),

  addBin: (newBin) =>
    set((state) => {
      const updated = [
        ...state.bins,
        {
          ...newBin,
          id: `bin_${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ];
      saveStoredData("green_city_bins", updated);
      setTimeout(() => state.logActivity("Waste Request Created", `Address: ${newBin.address}`), 50);
      return { bins: updated };
    }),

  updateBin: (id, updates) =>
    set((state) => {
      const updated = state.bins.map((b) => (b.id === id ? { ...b, ...updates } : b));
      saveStoredData("green_city_bins", updated);
      return { bins: updated };
    }),

  deleteBin: (id) =>
    set((state) => {
      const bin = state.bins.find((b) => b.id === id);
      const updated = state.bins.filter((b) => b.id !== id);
      saveStoredData("green_city_bins", updated);
      if (bin) {
        setTimeout(() => state.logActivity("Waste Request Deleted", `Address: ${bin.address}`), 50);
      }
      return { bins: updated };
    }),

  assignDriverToBin: (binId, driverId) =>
    set((state) => {
      const driver = state.drivers.find((d) => d.id === driverId);
      const updated = state.bins.map((b) =>
        b.id === binId
          ? { ...b, status: "Assigned" as const, assignedDriverId: driverId }
          : b
      );
      saveStoredData("green_city_bins", updated);
      if (driver) {
        setTimeout(() => state.logActivity("Driver Dispatched", `Assigned ${driver.name} to Bin request.`), 50);
      }
      return { bins: updated };
    }),

  collectBin: (binId, weightKg) =>
    set((state) => {
      const bin = state.bins.find((b) => b.id === binId);
      const updated = state.bins.map((b) =>
        b.id === binId
          ? { ...b, status: "Collected" as const, weightKg }
          : b
      );
      saveStoredData("green_city_bins", updated);
      
      if (bin) {
        const todayStr = new Date().toISOString().split('T')[0];
        const nowStr = new Date().toISOString();
        const newDaily: DailyCollection[] = [
          ...state.dailyCollections,
          {
            id: `col_${Date.now()}`,
            date: todayStr,
            category: bin.wasteType,
            weightKg,
            recordedBy: "Council Admin",
            createdAt: nowStr,
            updatedAt: nowStr,
          }
        ];
        saveStoredData("green_city_daily_collections", newDaily);
        setTimeout(() => {
          state.logActivity("Waste Collected", `Recorded ${weightKg} Kg of ${bin.wasteType} at ${bin.address}.`);
        }, 50);
        return { bins: updated, dailyCollections: newDaily };
      }
      return { bins: updated };
    }),

  addDriver: (newDriver) =>
    set((state) => {
      const updated = [
        ...state.drivers,
        {
          ...newDriver,
          id: `drv_${Date.now()}`,
        },
      ];
      saveStoredData("green_city_drivers", updated);
      setTimeout(() => state.logActivity("Driver Added", `Registered driver: ${newDriver.name}`), 50);
      return { drivers: updated };
    }),

  updateDriver: (id, updates) =>
    set((state) => {
      const updated = state.drivers.map((d) => (d.id === id ? { ...d, ...updates } : d));
      saveStoredData("green_city_drivers", updated);
      setTimeout(() => state.logActivity("Driver Updated", `Updated profiles details for driver id: ${id}`), 50);
      return { drivers: updated };
    }),

  deleteDriver: (id) =>
    set((state) => {
      const driver = state.drivers.find((d) => d.id === id);
      const updated = state.drivers.filter((d) => d.id !== id);
      saveStoredData("green_city_drivers", updated);
      if (driver) {
        setTimeout(() => state.logActivity("Driver Deleted", `Removed driver profile: ${driver.name}`), 50);
      }
      return { drivers: updated };
    }),

  toggleDriverStatus: (id) =>
    set((state) => {
      const updated = state.drivers.map((d) =>
        d.id === id ? { ...d, status: d.status === "Online" ? "Offline" as const : "Online" as const } : d
      );
      saveStoredData("green_city_drivers", updated);
      const toggled = updated.find((d) => d.id === id);
      if (toggled) {
        setTimeout(() => state.logActivity("Driver Status Toggle", `${toggled.name} is now ${toggled.status}`), 50);
      }
      return { drivers: updated };
    }),

  addResident: (newResident) =>
    set((state) => {
      const updated = [
        ...state.residents,
        {
          ...newResident,
          id: `res_${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ];
      saveStoredData("green_city_residents", updated);
      setTimeout(() => state.logActivity("Resident Added", `Created account for: ${newResident.name}`), 50);
      return { residents: updated };
    }),

  updateResident: (id, updates) =>
    set((state) => {
      const updated = state.residents.map((r) => (r.id === id ? { ...r, ...updates } : r));
      saveStoredData("green_city_residents", updated);
      const res = updated.find((r) => r.id === id);
      if (res && updates.status) {
        setTimeout(() => state.logActivity(updates.status === "Active" ? "Resident Activated" : "Resident Suspended/Blocked", `${res.name} access updated.`), 50);
      }
      return { residents: updated };
    }),

  deleteResident: (id) =>
    set((state) => {
      const res = state.residents.find((r) => r.id === id);
      const updated = state.residents.filter((r) => r.id !== id);
      saveStoredData("green_city_residents", updated);
      if (res) {
        setTimeout(() => state.logActivity("Resident Deleted", `Removed profile: ${res.name}`), 50);
      }
      return { residents: updated };
    }),

  addDailyCollection: (newCol) =>
    set((state) => {
      const now = new Date().toISOString();
      const updated = [
        ...state.dailyCollections,
        {
          ...newCol,
          id: `col_${Date.now()}`,
          createdAt: newCol.createdAt || now,
          updatedAt: newCol.updatedAt || now,
          recordedBy: newCol.recordedBy || "Council Admin",
        },
      ];
      saveStoredData("green_city_daily_collections", updated);
      setTimeout(() => state.logActivity("Daily Collection Logged", `Category: ${newCol.category}, ${newCol.weightKg} Kg on ${newCol.date}.`), 50);
      return { dailyCollections: updated };
    }),

  updateDailyCollection: (id, updates) =>
    set((state) => {
      const updated = state.dailyCollections.map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      );
      saveStoredData("green_city_daily_collections", updated);
      const rec = updated.find((c) => c.id === id);
      if (rec) {
        setTimeout(() => state.logActivity("Collection Record Updated", `Edited ${rec.category} record for ${rec.date}.`), 50);
      }
      return { dailyCollections: updated };
    }),

  deleteDailyCollection: (id) =>
    set((state) => {
      const rec = state.dailyCollections.find((c) => c.id === id);
      const updated = state.dailyCollections.filter((c) => c.id !== id);
      saveStoredData("green_city_daily_collections", updated);
      if (rec) {
        setTimeout(() => state.logActivity("Collection Record Deleted", `Removed ${rec.category} record for ${rec.date}.`), 50);
      }
      return { dailyCollections: updated };
    }),

  addCategory: (name) =>
    set((state) => {
      if (state.categories.find((c) => c.name.toLowerCase() === name.toLowerCase())) {
        return {};
      }
      const updated = [
        ...state.categories,
        {
          id: `cat_${Date.now()}`,
          name,
          createdAt: new Date().toISOString(),
        },
      ];
      saveStoredData("green_city_categories", updated);
      setTimeout(() => state.logActivity("Category Added", `Custom Category Created: ${name}`), 50);
      return { categories: updated };
    }),

  deleteCategory: (id) =>
    set((state) => {
      const cat = state.categories.find((c) => c.id === id);
      if (cat && ["Food Waste", "Plastic", "Polythene", "Paper", "Glass"].includes(cat.name)) {
        return {};
      }
      const updated = state.categories.filter((c) => c.id !== id);
      saveStoredData("green_city_categories", updated);
      if (cat) {
        setTimeout(() => state.logActivity("Category Deleted", `Removed Custom Category: ${cat.name}`), 50);
      }
      return { categories: updated };
    }),

  addRouteAssignment: (assignment) =>
    set((state) => {
      const driver = state.drivers.find((d) => d.id === assignment.driverId);
      const updated = [
        ...state.routeAssignments,
        {
          ...assignment,
          id: `rte_${Date.now()}`,
        },
      ];
      saveStoredData("green_city_route_assignments", updated);
      if (driver) {
        setTimeout(() => state.logActivity("Route Assigned", `Assigned ${driver.name} to collect ${assignment.category}`), 50);
      }
      return { routeAssignments: updated };
    }),

  updateRouteAssignment: (id, updates) =>
    set((state) => {
      const updated = state.routeAssignments.map((a) => (a.id === id ? { ...a, ...updates } : a));
      saveStoredData("green_city_route_assignments", updated);
      return { routeAssignments: updated };
    }),

  deleteRouteAssignment: (id) =>
    set((state) => {
      const updated = state.routeAssignments.filter((a) => a.id !== id);
      saveStoredData("green_city_route_assignments", updated);
      setTimeout(() => state.logActivity("Route Removed", `Cleared Route Assignment id: ${id}`), 50);
      return { routeAssignments: updated };
    }),

  sendNotification: (newNtf) =>
    set((state) => {
      const updated = [
        {
          ...newNtf,
          id: `ntf_${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: "Sent" as const,
        },
        ...state.notifications,
      ];
      saveStoredData("green_city_notifications", updated);
      setTimeout(() => state.logActivity("Notification Dispatched", `Sent alert: "${newNtf.title}" to ${newNtf.recipientType}.`), 50);
      return { notifications: updated };
    }),

  updateSettings: (updates) =>
    set((state) => {
      const updated = { ...state.settings, ...updates };
      saveStoredData("green_city_settings", updated);
      setTimeout(() => state.logActivity("System Settings Changed", "Global operational boundaries updated."), 50);
      return { settings: updated };
    }),

  addAdmin: (admin) =>
    set((state) => {
      const updated = [
        ...state.admins,
        {
          ...admin,
          id: `adm_${Date.now()}`,
        },
      ];
      saveStoredData("green_city_admins", updated);
      setTimeout(() => state.logActivity("Admin Added", `New dashboard access granted to ${admin.name}`), 50);
      return { admins: updated };
    }),

  removeAdmin: (id) =>
    set((state) => {
      const admin = state.admins.find((a) => a.id === id);
      const updated = state.admins.filter((a) => a.id !== id);
      saveStoredData("green_city_admins", updated);
      if (admin) {
        setTimeout(() => state.logActivity("Admin Removed", `Revoked dashboard access for ${admin.name}`), 50);
      }
      return { admins: updated };
    }),
}));
