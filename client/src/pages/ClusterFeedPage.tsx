import { useEffect, useState } from "react";
import { useClusterFeed } from "../features/clusters/api";
import { ClusterCard } from "../features/clusters/components/ClusterCard";
import { FilterBar } from "../features/clusters/components/FilterBar";
import { Pagination } from "../features/clusters/components/Pagination";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const PAGE_SIZE = 20;

export function ClusterFeedPage() {
  const [minScoreInput, setMinScoreInput] = useState(0);
  const debouncedMinScore = useDebouncedValue(minScoreInput, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedMinScore]);

  const [sector, setSector] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const queryPage = minScoreInput !== debouncedMinScore ? 1 : page;

  const { data, isLoading, isError } = useClusterFeed({
    minScore: debouncedMinScore,
    ...(sector && { sector }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    page: queryPage,
    pageSize: PAGE_SIZE,
    sortBy: "score",
  });

  function resetFilters() {
  setMinScoreInput(0);
  setSector("");
  setDateFrom("");
  setDateTo("");
  setPage(1);
}

  function handleFilterChange(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

        <div className="h-32 animate-pulse rounded-xl bg-gray-200" />

        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="font-semibold text-red-700">Failed to load clusters</h1>

        <p className="mt-1 text-sm text-red-600">Please try again later.</p>
      </div>
    );
  }

  const clusters = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cluster Feed</h1>

        <p className="mt-1 text-sm text-gray-500">
          Recent insider trading clusters detected by the system.
        </p>
      </div>

      <FilterBar
        minScore={minScoreInput}
        sector={sector}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onMinScoreChange={(value) => {
          setMinScoreInput(value);
        }}
        onSectorChange={(value) => handleFilterChange(setSector, value)}
        onDateFromChange={(value) => handleFilterChange(setDateFrom, value)}
        onDateToChange={(value) => handleFilterChange(setDateTo, value)}
        onReset={resetFilters}
      />

      {clusters.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <h2 className="text-lg font-semibold">No clusters found</h2>

          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {clusters.map((cluster) => (
              <ClusterCard key={cluster.id} cluster={cluster} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
