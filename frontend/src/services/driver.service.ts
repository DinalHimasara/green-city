import axios from "axios";
import { Driver } from "@/store/greenCityStore";
import { cachedGet } from "@/lib/apiCache";

const url = "http://localhost:5000";

function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

function errorMessage(err: any, fallback: string) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
}

export interface DriverLocation {
  id: string;
  name: string;
  vehicleNo: string;
  status: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export const driverService = {
    getAll: async (): Promise<Driver[]> => {
    const [users, vechicles] = await Promise.all([
      cachedGet(url + "/users?role=driver"),
      cachedGet(url + "/vechicle"),
    ]);

    return users
      .filter((u: any) => u.role === "driver")
      .map((u: any): Driver => {
        const v = vechicles.find(
          (x: any) => String(x.assignedDriver?._id || x.assignedDriver) === u._id
        );
        return {
          id: u._id,
          name: u.firstName + " " + u.lastName,
          nic: u.nic,
          phone: u.phone,
          vehicleNo: v ? v.vechicleNumber : "-",
          status: u.status === "active" ? "Online" : "Offline",
          currentWard: "-",
        };
      });
  },

  getLocations: async (): Promise<DriverLocation[]> => {
    const res = await axios.get(url + "/users/driver-locations", config());
    return res.data;
  },

  getById: async (id: string): Promise<Driver | undefined> => {
    const drivers = await driverService.getAll();
    return drivers.find((d) => d.id === id);
  },

    create: async (driver: Omit<Driver, "id"> & { email: string; password: string }): Promise<void> => {
    if (!driver.vehicleNo || driver.vehicleNo === "-") {
      throw new Error("Please select a truck for the driver.");
    }

    const names = driver.name.trim().split(" ");

    try {
      await axios.post(
        url + "/users/driver",
        {
          nic: driver.nic,
          email: driver.email,
          password: driver.password,
          firstName: names[0],
          lastName: names.slice(1).join(" ") || "-",
          phone: driver.phone,
          status: driver.status === "Online" ? "active" : "inactive",
          vechicleNumber: driver.vehicleNo,
        },
        config()
      );
    } catch (err) {
      throw new Error(errorMessage(err, "Failed to create driver."));
    }
  },

    update: async (id: string, updates: Partial<Driver>): Promise<void> => {
    const body: any = {};
    if (updates.name) {
      const names = updates.name.trim().split(" ");
      body.firstName = names[0];
      body.lastName = names.slice(1).join(" ") || "-";
    }
    if (updates.nic) body.nic = updates.nic;
    if (updates.phone) body.phone = updates.phone;

    try {
      await axios.put(url + "/users/" + id, body, config());

      if (updates.vehicleNo && updates.vehicleNo !== "-") {
        const all = await axios.get(url + "/users?role=driver", config());
        const u = all.data.find((x: any) => x._id === id);
        await axios.put(
          url + "/vechicle/" + updates.vehicleNo + "/assign-driver",
          { email: u.email },
          config()
        );
      }
    } catch (err) {
      throw new Error(errorMessage(err, "Failed to update driver."));
    }
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(url + "/users/" + id, config());
  },

  toggleStatus: async (id: string): Promise<void> => {
    const driver = await driverService.getById(id);
    if (!driver) return;
    await axios.put(
      url + "/users/" + id,
      { status: driver.status === "Online" ? "inactive" : "active" },
      config()
    );
  },
};