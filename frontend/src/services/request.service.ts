import axios from "axios";
import { cachedGet } from "@/lib/apiCache";

const url = "http://localhost:5000";

export interface WasteRequest {
  id: string;
  residentUid: string;
  residentName: string;
  address: string;
  latitude: number;
  longitude: number;
  wasteType: string;
  status: "Pending" | "Assigned" | "Collected" | "Other";
  rawStatus: string;
  createdAt: string;
  completedAt: string | null;
}

function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

function toStatus(value: string): WasteRequest["status"] {
  const v = String(value || "").trim().toLowerCase();
  if (v === "pending") return "Pending";
  if (v === "completed") return "Collected";
  if (["assigned", "accepted", "in progress", "in_progress", "collecting", "on the way"].includes(v)) return "Assigned";
  return "Other";
}

export const requestService = {
  getAll: async (): Promise<WasteRequest[]> => {
    const data = await cachedGet(url + "/request");
    return data.map((r: any): WasteRequest => ({
      id: r._id,
      residentUid: r.residentUid,
      residentName: r.residentName,
      address: r.address,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      wasteType: r.wasteType,
      status: toStatus(r.status),
      rawStatus: r.status,
      createdAt: r.createdAt,
      completedAt: r.completedAt,
    }));
  },

  getByResident: async (residentUid: string): Promise<WasteRequest[]> => {
    const all = await requestService.getAll();
    return all.filter((r) => r.residentUid === residentUid);
  },
};