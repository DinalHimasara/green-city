import axios from "axios";
import { RouteAssignment } from "@/store/greenCityStore";
import { toast } from "sonner";
import { cachedGet } from "@/lib/apiCache";

const url = "http://localhost:5000";

function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

function errorMessage(err: any, fallback: string) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
}

const statusToBackend: any = {
  Pending: "pending",
  Active: "active",
  Completed: "completed",
};

function toDisplayStatus(s: string): "Pending" | "Active" | "Completed" {
  if (s === "active") return "Active";
  if (s === "completed") return "Completed";
  return "Pending";
}

function toRoute(s: any): RouteAssignment {
  return {
    id: s.scheduleNumber,
    driverId: s.driver?._id || s.driver,
    routeName: s.assignRoute,
    date: String(s.collectionDate).slice(0, 10),
    category: s.wasteCategory.replace(/\b\w/g, (c: string) => c.toUpperCase()),
    estimatedDistanceKm: s.distance,
    status: toDisplayStatus(s.dispathStatus),
  };
}

async function findDriverAndVechicle(driverId: string) {
  const [users, vechicles] = await Promise.all([
    cachedGet(url + "/users?role=driver"),
    cachedGet(url + "/vechicle"),
  ]);
  const driver = users.find((u: any) => u._id === driverId);
  const vechicle = vechicles.find(
    (v: any) => String(v.assignedDriver?._id || v.assignedDriver) === driverId
  );
  return { driver, vechicle };
}

export const routeService = {
    getAll: async (): Promise<RouteAssignment[]> => {
    const data = await cachedGet(url + "/schedule");
    return data.map(toRoute);
  },

   create: async (assignment: Omit<RouteAssignment, "id">): Promise<void> => {
    if (!assignment.routeName || !assignment.routeName.trim()) {
      throw new Error("Route name is required.");
    }

    const { driver, vechicle } = await findDriverAndVechicle(assignment.driverId);
    if (!driver) throw new Error("Driver not found.");
    if (!vechicle) throw new Error("This driver has no truck assigned. Assign a truck to the driver first.");

    try {
      const res = await axios.post(
        url + "/schedule",
        {
          driver: driver.email,
          vechicle: vechicle.vechicleNumber,
          collectionDate: assignment.date,
          wasteCategory: assignment.category.toLowerCase(),
          assignRoute: assignment.routeName.trim(),
          distance: assignment.estimatedDistanceKm,
          dispathStatus: statusToBackend[assignment.status],
        },
        config()
      );
      if (res.data.warning) toast.warning(res.data.warning);
    } catch (err) {
      throw new Error(errorMessage(err, "Failed to assign the route."));
    }
  },

    update: async (id: string, updates: Partial<RouteAssignment>): Promise<void> => {
    if (updates.routeName !== undefined && !updates.routeName.trim()) {
      throw new Error("Route name is required.");
    }

    const res = await axios.get(url + "/schedule/" + id, config());
    const s = res.data;
    const driverId = updates.driverId ?? (s.driver?._id || s.driver);
    const { driver, vechicle } = await findDriverAndVechicle(driverId);
    if (!driver) throw new Error("Driver not found.");
    if (!vechicle) throw new Error("This driver has no truck assigned. Assign a truck to the driver first.");

    try {
      const result = await axios.put(
        url + "/schedule/" + id,
        {
          driver: driver.email,
          vechicle: vechicle.vechicleNumber,
          collectionDate: updates.date ?? s.collectionDate,
          wasteCategory: updates.category ? updates.category.toLowerCase() : s.wasteCategory,
          assignRoute: updates.routeName ? updates.routeName.trim() : s.assignRoute,
          distance: updates.estimatedDistanceKm ?? s.distance,
          dispathStatus: updates.status ? statusToBackend[updates.status] : s.dispathStatus,
          note: s.note,
        },
        config()
      );
      if (result.data.warning) toast.warning(result.data.warning);
    } catch (err) {
      throw new Error(errorMessage(err, "Failed to update the route."));
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const res = await axios.delete(url + "/schedule/" + id, config());
      if (res.data.warning) toast.warning(res.data.warning);
    } catch (err) {
      throw new Error(errorMessage(err, "Failed to delete the route."));
    }
  },

  getEstimatedDistance: async (): Promise<number> => {
    const routes = await routeService.getAll();
    const total = routes
      .filter((r) => r.status === "Active")
      .reduce((sum, r) => sum + r.estimatedDistanceKm, 0);
    return parseFloat(total.toFixed(1));
  },
};