import { useState } from "react";

interface FilterBarProps {
  minScore: number;
  sector: string;
  dateFrom: string;
  dateTo: string;
  onMinScoreChange: (value: number) => void;
  onSectorChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}

const sectors = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Energy",
  "Consumer",
  "Industrials",
];

export function FilterBar({
  minScore,
  sector,
  dateFrom,
  dateTo,
  onMinScoreChange,
  onSectorChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 rounded-xl border bg-white shadow-sm">
      {/* Mobile filter toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-medium sm:hidden"
        aria-expanded={isOpen}
        aria-controls="cluster-filters"
      >
        <span>Filters</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {/* Filter controls */}
      <div
        id="cluster-filters"
        className={`${
          isOpen ? "block" : "hidden"
        } border-t px-5 py-5 sm:block sm:border-t-0`}
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="min-score"
              className="mb-2 block text-sm font-medium"
            >
              Minimum Score
            </label>

            <div className="flex items-center gap-3">
              <input
                id="min-score"
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) =>
                  onMinScoreChange(Number(e.target.value))
                }
                className="w-full"
              />

              <span className="w-8 text-sm font-semibold">
                {minScore}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="sector"
              className="mb-2 block text-sm font-medium"
            >
              Sector
            </label>

            <select
              id="sector"
              value={sector}
              onChange={(e) => onSectorChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">All sectors</option>

              {sectors.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="date-from"
              className="mb-2 block text-sm font-medium"
            >
              From
            </label>

            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="date-to"
              className="mb-2 block text-sm font-medium"
            >
              To
            </label>

            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}