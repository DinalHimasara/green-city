import { useGreenCityStore, NotificationLog } from "@/store/greenCityStore";

export const notificationService = {
  getAll: async (): Promise<NotificationLog[]> => {
    return useGreenCityStore.getState().notifications;
  },

  send: async (notification: Omit<NotificationLog, "id" | "createdAt" | "status">): Promise<void> => {
    useGreenCityStore.getState().sendNotification(notification);
  }
};
