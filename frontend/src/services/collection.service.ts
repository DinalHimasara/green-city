import axios from "axios";
import { useGreenCityStore, BinLocation, WasteCategory, DailyCollection } from "@/store/greenCityStore";
import { cachedGet } from "@/lib/apiCache";

const url = "http://localhost:5000/dailyWasteCollection";

function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

const categoryMap: any = {
  "food waste": "food Waste",
  "plastic": "Plastic",
  "polythene": "Polythene",
  "paper": "paper",
  "glass": "glass",
};

function toBackendCategory(name: string) {
  return categoryMap[name.toLowerCase()] || name;
}

function toDisplayCategory(name: string) {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

function toDailyCollection(c: any): DailyCollection {
  return {
    id: c.collectionNumber,
    date: String(c.collectionDate).slice(0, 10),
    category: toDisplayCategory(c.category),
    weightKg: c.totalWeight,
    remarks: c.note,
    recordedBy: c.recordedBy ? c.recordedBy.firstName + " " + c.recordedBy.lastName : "Council Admin",
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export const collectionService = {
  getAllBins: async (): Promise<BinLocation[]> => {
    return useGreenCityStore.getState().bins;
  },

  createBin: async (bin: Omit<BinLocation, "id" | "createdAt">): Promise<void> => {
    useGreenCityStore.getState().addBin(bin);
  },

  updateBin: async (id: string, updates: Partial<BinLocation>): Promise<void> => {
    useGreenCityStore.getState().updateBin(id, updates);
  },

  deleteBin: async (id: string): Promise<void> => {
    useGreenCityStore.getState().deleteBin(id);
  },

  assignDriver: async (binId: string, driverId: string): Promise<void> => {
    useGreenCityStore.getState().assignDriverToBin(binId, driverId);
  },

  collectBin: async (binId: string, weightKg: number): Promise<void> => {
    useGreenCityStore.getState().collectBin(binId, weightKg);
  },

  getCategories: async (): Promise<WasteCategory[]> => {
    return useGreenCityStore.getState().categories;
  },

  createCategory: async (name: string): Promise<void> => {
    useGreenCityStore.getState().addCategory(name);
  },

  renameCategory: async (id: string, newName: string): Promise<void> => {
    const store = useGreenCityStore.getState();
    const updated = store.categories.map((c) =>
      c.id === id ? { ...c, name: newName } : c
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("green_city_categories", JSON.stringify(updated));
    }
    useGreenCityStore.setState({ categories: updated });
  },

  deleteCategory: async (id: string): Promise<void> => {
    useGreenCityStore.getState().deleteCategory(id);
  },

  getDailyCollections: async (): Promise<DailyCollection[]> => {
    const data = await cachedGet(url);
    return data.map(toDailyCollection);
  },

  createDailyCollection: async (collection: Omit<DailyCollection, "id">): Promise<void> => {
    await axios.post(
      url,
      {
        collectionDate: collection.date,
        category: toBackendCategory(collection.category),
        totalWeight: collection.weightKg,
        note: collection.remarks || "",
      },
      config()
    );
  },

  updateDailyCollection: async (id: string, updates: Partial<DailyCollection>): Promise<void> => {
    const res = await axios.get(url + "/" + id, config());
    const c = res.data;
    await axios.put(
      url + "/" + id,
      {
        collectionDate: updates.date ?? c.collectionDate,
        category: updates.category ? toBackendCategory(updates.category) : c.category,
        totalWeight: updates.weightKg ?? c.totalWeight,
        note: updates.remarks ?? c.note,
      },
      config()
    );
  },

  deleteDailyCollection: async (id: string): Promise<void> => {
    await axios.delete(url + "/" + id, config());
  },
};