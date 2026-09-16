import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "../../lib/api-client";

export interface NotificationPreferences {
  emailAlertsEnabled: boolean;
  minScoreThreshold: number;
}

export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        preferences: NotificationPreferences;
      }>("/auth/me/notification-preferences");

      return data.preferences;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      preferences: Partial<NotificationPreferences>,
    ) =>
      apiClient.patch<{
        preferences: NotificationPreferences;
      }>(
        "/auth/me/notification-preferences",
        preferences,
      ),

    onSuccess: (response) => {
      queryClient.setQueryData(
        ["notification-preferences"],
        response.data.preferences,
      );
    },
  });
}