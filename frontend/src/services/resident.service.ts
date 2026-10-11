import axios from "axios";
import { ResidentUser } from "@/store/greenCityStore";
import { cachedGet } from "@/lib/apiCache";

const url = "http://localhost:5000/users";


function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

function toResident(u: any): ResidentUser {
  return {
    id: u._id,
    name: u.firstName + " " + u.lastName,
    email: u.email,
    phone: u.phone,
    address: u.address || "",
    ward: u.ward || "-",
    status: u.isBlock ? "Suspended" : "Active",
    createdAt: u.createdAt,
    latitude: u.currentLocation?.latitude ?? 0,
    longitude: u.currentLocation?.longitude ?? 0,
    firebaseUid: u.firebaseUid,
  };
}

export const residentService = {
    getAll: async (): Promise<ResidentUser[]> => {
    const data = await cachedGet(url + "?role=resident");
    return data.filter((u: any) => u.role === "resident").map(toResident);
  },

  getById: async (id: string): Promise<ResidentUser | undefined> => {
    const residents = await residentService.getAll();
    return residents.find((r) => r.id === id);
  },

  create: async (resident: Omit<ResidentUser, "id" | "createdAt">): Promise<void> => {
    const names = resident.name.split(" ");
    await axios.post(
      url,
      {
        nic: "RES-" + Date.now(),
        email: resident.email,
        firstName: names[0],
        lastName: names.slice(1).join(" ") || "-",
        password: "Resident@123",
        phone: resident.phone,
        address: resident.address,
        role: "resident",
        isBlock: resident.status === "Suspended",
        currentLocation: { latitude: resident.latitude, longitude: resident.longitude },
      },
      config()
    );
  },

  update: async (id: string, updates: Partial<ResidentUser>): Promise<void> => {
    const body: any = {};
    if (updates.name) {
      const names = updates.name.split(" ");
      body.firstName = names[0];
      body.lastName = names.slice(1).join(" ") || "-";
    }
    if (updates.email) body.email = updates.email;
    if (updates.phone) body.phone = updates.phone;
    if (updates.address !== undefined) body.address = updates.address;
    if (updates.status) body.isBlock = updates.status === "Suspended";
    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      body.currentLocation = { latitude: updates.latitude, longitude: updates.longitude };
    }
    await axios.put(url + "/" + id, body, config());
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(url + "/" + id, config());
  },
};