import { useEffect, useState } from "react";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../features/notifications/api";

export function NotificationSettingsPage() {
  const { data, isLoading, isError } =
    useNotificationPreferences();

  const updateMutation =
    useUpdateNotificationPreferences();

  const [emailAlertsEnabled, setEmailAlertsEnabled] =
    useState(true);

  const [minScoreThreshold, setMinScoreThreshold] =
    useState(50);

  useEffect(() => {
    if (!data) return;

    setEmailAlertsEnabled(data.emailAlertsEnabled);
    setMinScoreThreshold(data.minScoreThreshold);
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load notification settings.
      </div>
    );
  }

  function updateEmailAlerts(enabled: boolean) {
    setEmailAlertsEnabled(enabled);

    updateMutation.mutate({
      emailAlertsEnabled: enabled,
    });
  }

  function updateScoreThreshold(threshold: number) {
    setMinScoreThreshold(threshold);

    updateMutation.mutate({
      minScoreThreshold: threshold,
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Notification Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Control when Cluster sends you email alerts.
        </p>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="font-semibold">Email Alerts</h2>

            <p className="mt-1 text-sm text-gray-500">
              Receive email notifications for qualifying
              insider trading clusters.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={emailAlertsEnabled}
            onClick={() =>
              updateEmailAlerts(!emailAlertsEnabled)
            }
            disabled={updateMutation.isPending}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {emailAlertsEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="mt-8">
          <label
            htmlFor="score-threshold"
            className="block text-sm font-medium"
          >
            Minimum Cluster Score
          </label>

          <p className="mt-1 text-sm text-gray-500">
            Only receive alerts for clusters at or above
            this score.
          </p>

          <div className="mt-4 flex items-center gap-4">
            <input
              id="score-threshold"
              type="range"
              min="0"
              max="100"
              value={minScoreThreshold}
              onChange={(event) =>
                updateScoreThreshold(
                  Number(event.target.value),
                )
              }
              className="w-full"
            />

            <span className="w-10 text-right font-semibold">
              {minScoreThreshold}
            </span>
          </div>
        </div>

        {updateMutation.isSuccess && (
          <p className="mt-4 text-sm text-gray-500">
            Settings saved.
          </p>
        )}

        {updateMutation.isError && (
          <p className="mt-4 text-sm text-red-600">
            Failed to save settings. Please try again.
          </p>
        )}
      </section>
    </div>
  );
}