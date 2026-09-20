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
      <div className="max-w-2xl space-y-4">
        <div className="h-8 w-64 animate-pulse border-2 border-black bg-neutral-100" />
        <div className="h-56 animate-pulse border-2 border-black bg-neutral-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl border-2 border-red-600 bg-white p-6 shadow-[4px_4px_0_#dc2626]">
        <p className="font-bold uppercase tracking-wide text-red-700">
          Failed to load notification settings.
        </p>
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
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Notification Settings
        </h1>

        <p className="mt-2 text-sm font-medium text-neutral-500">
          Control when Cluster sends you email alerts.
        </p>
      </div>

      <section className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_#000]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black uppercase tracking-tight">
              Email Alerts
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500">
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
            className={`shrink-0 border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
              emailAlertsEnabled
                ? "bg-black text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[3px_3px_0_#000]"
                : "bg-white text-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {emailAlertsEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="mt-8 border-t-2 border-black pt-6">
          <label
            htmlFor="score-threshold"
            className="block text-sm font-black uppercase tracking-wide"
          >
            Minimum Cluster Score
          </label>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Only receive alerts for clusters at or above
            this score.
          </p>

          <div className="mt-5 flex items-center gap-4">
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
              className="h-2 w-full cursor-pointer accent-black"
            />

            <span className="flex h-10 w-12 shrink-0 items-center justify-center border-2 border-black bg-black text-sm font-black text-white">
              {minScoreThreshold}
            </span>
          </div>

          <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wide text-neutral-400">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        {updateMutation.isSuccess && (
          <div className="mt-6 border-2 border-black bg-neutral-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide">
              ✓ Settings saved.
            </p>
          </div>
        )}

        {updateMutation.isError && (
          <div className="mt-6 border-2 border-red-600 bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700">
              Failed to save settings. Please try again.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}