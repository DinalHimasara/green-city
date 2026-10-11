import axios from "axios";
import { cachedGet } from "@/lib/apiCache";

const base = "http://localhost:5000";
const url = base + "/vechicle";

export interface Truck {
  id: string;
  vechicleNumber: string;
  vechicleType: "Truck" | "Mini Truck";
  capacity: number;
  status: "Available" | "Collecting" | "Maintenance";
  driverId: string | null;
  driverName: string | null;
}

function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

function errorMessage(err: any, fallback: string) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
}

export const vehicleService = {
    getAll: async (): Promise<Truck[]> => {
    const [vechicles, users] = await Promise.all([
      cachedGet(url),
      cachedGet(base + "/users?role=driver"),
    ]);
    const drivers = users.filter((u: any) => u.role === "driver");

    return vechicles.map((v: any): Truck => {
      const assignedId = v.assignedDriver ? String(v.assignedDriver._id || v.assignedDriver) : null;
      const driver = assignedId ? drivers.find((u: any) => u._id === assignedId) : null;
      return {
        id: v.vechicleNumber,
        vechicleNumber: v.vechicleNumber,
        vechicleType: v.vechicleType,
        capacity: v.capacity,
        status: v.status,
        driverId: driver ? driver._id : null,
        driverName: driver ? driver.firstName + " " + driver.lastName : null,
      };
    });
  },

  getAvailable: async (includeNumber?: string): Promise<Truck[]> => {
    const trucks = await vehicleService.getAll();
    return trucks.filter(
      (t) =>
        (t.driverId === null && t.status !== "Maintenance") ||
        t.vechicleNumber === includeNumber
    );
  },

  create: async (truck: { vechicleNumber: string; vechicleType: string; capacity: number; status: string }): Promise<void> => {
    try {
      await axios.post(url, truck, config());
    } catch (err) {
      throw new Error(errorMessage(err, "Failed to add truck."));
    }
  },

  update: async (number: string, truck: { vechicleNumber: string; vechicleType: string; capacity: number; status: string }): Promise<void> => {
    try {
      await axios.put(url + "/" + number, truck, config());
    } catch (err) {
      throw new Error(errorMessage(err, "Failed to update truck."));
    }
  },

  delete: async (number: string): Promise<void> => {
    try {
      await axios.delete(url + "/" + number, config());
    } catch (err) {
      throw new Error(errorMessage(err, "Failed to delete truck."));
    }
  },
};