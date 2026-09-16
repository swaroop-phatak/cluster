import { Link, useParams } from "react-router-dom";
import { useClusterDetail } from "../features/clusters/api";
import { ScoreBadge } from "../features/clusters/components/ScoreBadge";
import { WatchlistButton } from "../features/companies/components/WatchlistButton";
import { TransactionTable } from "../components/domain/TransactionTable";

export function ClusterDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useClusterDetail(id ?? "");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;

    if (status === 404) {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Cluster not found</h1>

          <Link to="/clusters" className="text-sm font-medium underline">
            ← Back to clusters
          </Link>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load cluster details.
      </div>
    );
  }

  if (!data) return null;

  const { cluster } = data;

  const uniqueInsiders = Array.from(
    new Map(
      cluster.clusterTransactions.map((item) => [
        item.transaction.filing.insider.id,
        item.transaction.filing.insider,
      ]),
    ).values(),
  );

  return (
    <div className="space-y-6">
      <Link
        to="/clusters"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Back to clusters
      </Link>

      {/* Cluster Summary */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              to={`/companies/${cluster.company.id}`}
              className="block text-2xl font-bold hover:underline"
            >
              {cluster.company.name}
            </Link>

            <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
              {cluster.company.ticker && <span>{cluster.company.ticker}</span>}

              <span>CIK: {cluster.company.cik}</span>

              {cluster.company.sector && <span>{cluster.company.sector}</span>}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <WatchlistButton companyId={cluster.company.id} />
            <ScoreBadge score={Number(cluster.score)} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Insiders</p>
            <p className="mt-1 text-xl font-semibold">{cluster.insiderCount}</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="mt-1 text-xl font-semibold">
              {cluster.clusterTransactions.length}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Total Value</p>
            <p className="mt-1 text-xl font-semibold">
              ${Number(cluster.totalValue).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="mt-1 text-xl font-semibold capitalize">
              {cluster.status}
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Window: {new Date(cluster.windowStart).toLocaleDateString()} –{" "}
          {new Date(cluster.windowEnd).toLocaleDateString()}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Score Breakdown</h2>

        {data.scoreBreakdown ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Insider Count</span>
              <span className="font-semibold">
                {data.scoreBreakdown.insiderCountScore}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Role Diversity</span>
              <span className="font-semibold">
                {data.scoreBreakdown.roleDiversityScore}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Total Value</span>
              <span className="font-semibold">
                {data.scoreBreakdown.totalValueScore}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Window Tightness</span>
              <span className="font-semibold">
                {data.scoreBreakdown.windowTightnessScore}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Score breakdown is not available for this cluster.
          </p>
        )}
      </section>

      {/* Insiders */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Insiders Involved</h2>

        {uniqueInsiders.length === 0 ? (
          <p className="text-sm text-gray-500">
            No insiders found for this cluster.
          </p>
        ) : (
          <div className="space-y-3">
            {uniqueInsiders.map((insider) => (
              <Link
                key={insider.id}
                to={`/insiders/${insider.id}`}
                className="block rounded-lg border p-4 hover:bg-gray-50"
              >
                <p className="font-medium">{insider.name}</p>

                <p className="mt-1 text-sm text-gray-500">CIK: {insider.cik}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Transactions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Cluster Transactions</h2>

        <TransactionTable
          transactions={cluster.clusterTransactions.map(
            (item) => item.transaction,
          )}
        />
      </section>
    </div>
  );
}
