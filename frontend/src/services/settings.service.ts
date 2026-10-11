import axios from "axios";
import { useGreenCityStore, SystemSettings } from "@/store/greenCityStore";
import { useAuthStore } from "@/store/authStore";

const url = "http://localhost:5000";

function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    const res = await axios.get(url + "/setting", config());
    const s = res.data;
    return {
      notificationRadiusMeters: s.notificationRadiusMeters,
      collectionDays: s.collectionDays,
      workingHoursStart: s.workingHoursStart,
      workingHoursEnd: s.workingHoursEnd,
      autoRouteDispatch: s.autoRouteDispatch,
      smsAlerts: s.smsAlerts,
    };
  },

  updateSettings: async (updates: Partial<SystemSettings>): Promise<void> => {
    const body: any = { ...updates };
    if (body.notificationRadiusMeters !== undefined) {
      body.notificationRadiusMeters = Number(body.notificationRadiusMeters);
    }
    await axios.put(url + "/setting", body, config());
    useGreenCityStore.getState().updateSettings(updates);
  },

  getAdmins: async (): Promise<{ id: string; name: string; email: string; role: string; password?: string }[]> => {
    const res = await axios.get(url + "/users", config());
    return res.data
      .filter((u: any) => u.role === "admin")
      .map((u: any) => ({
        id: u._id,
        name: u.firstName + " " + u.lastName,
        email: u.email,
        role: "Administrator",
      }));
  },

  addAdmin: async (admin: { name: string; email: string; role: string; password?: string }): Promise<void> => {
    if (admin.role !== "Administrator") {
      throw new Error("Only Administrator role is supported");
    }
    const names = admin.name.split(" ");
    await axios.post(
      url + "/users",
      {
        nic: "ADM-" + Date.now(),
        email: admin.email,
        firstName: names[0],
        lastName: names.slice(1).join(" ") || "-",
        password: admin.password,
        phone: "0000000000",
        role: "admin",
      },
      config()
    );
  },

  removeAdmin: async (id: string): Promise<void> => {
    await axios.delete(url + "/users/" + id, config());
  },

  updateProfile: async (profile: { name: string; email: string; password?: string; profilePic?: string }): Promise<void> => {
    const stored = JSON.parse(localStorage.getItem("user_profile") || "{}");
    const names = profile.name.split(" ");
    const body: any = {
      firstName: names[0],
      lastName: names.slice(1).join(" ") || "-",
      email: profile.email,
    };
    if (profile.password) body.password = profile.password;
    if (profile.profilePic) body.image = profile.profilePic;

    await axios.put(url + "/users/" + stored.id, body, config());

    const updated = { ...stored, name: profile.name, email: profile.email, profilePic: profile.profilePic };
    localStorage.setItem("user_profile", JSON.stringify(updated));
    useAuthStore.getState().updateProfile(profile);
  },
};