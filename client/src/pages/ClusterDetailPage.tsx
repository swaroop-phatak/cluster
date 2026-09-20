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
        <div className="h-8 w-64 animate-pulse border-2 border-black bg-neutral-100" />
        <div className="h-32 animate-pulse border-2 border-black bg-neutral-100" />
        <div className="h-64 animate-pulse border-2 border-black bg-neutral-100" />
      </div>
    );
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;

    if (status === 404) {
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Cluster not found
          </h1>

          <Link
            to="/clusters"
            className="inline-block text-sm font-bold uppercase tracking-wide underline decoration-2 underline-offset-2"
          >
            ← Back to clusters
          </Link>
        </div>
      );
    }

    return (
      <div className="border-2 border-red-600 bg-white p-6 shadow-[4px_4px_0_#dc2626]">
        <h1 className="font-bold uppercase tracking-wide text-red-700">
          Failed to load cluster details
        </h1>

        <p className="mt-1 text-sm text-red-600">
          Please try again later.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { cluster } = data;

  const uniqueInsiders = Array.from(
    new Map(
      cluster.clusterTransactions.map((item) => {
        const insider = item.transaction.filing.insider;

        const role = insider.roles.find(
          (role) => role.companyId === cluster.company.id,
        );

        return [
          insider.id,
          {
            ...insider,
            title: role?.title ?? null,
          },
        ];
      }),
    ).values(),
  );

  return (
    <div className="space-y-6">
      <Link
        to="/clusters"
        className="inline-block text-sm font-bold uppercase tracking-wide underline decoration-2 underline-offset-2 transition-transform hover:-translate-x-0.5"
      >
        ← Back to clusters
      </Link>

      {/* Cluster Summary */}
      <section className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_#000]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              to={`/companies/${cluster.company.id}`}
              className="block text-2xl font-black uppercase tracking-tight hover:underline"
            >
              {cluster.company.name}
            </Link>

            <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wide text-neutral-500">
              {cluster.company.ticker && (
                <span>{cluster.company.ticker}</span>
              )}

              <span>CIK: {cluster.company.cik}</span>

              {cluster.company.sector && (
                <span>{cluster.company.sector}</span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <WatchlistButton companyId={cluster.company.id} />
            <ScoreBadge score={Number(cluster.score)} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-2 border-black bg-neutral-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              Insiders
            </p>

            <p className="mt-1 text-xl font-black">
              {cluster.insiderCount}
            </p>
          </div>

          <div className="border-2 border-black bg-neutral-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              Transactions
            </p>

            <p className="mt-1 text-xl font-black">
              {cluster.clusterTransactions.length}
            </p>
          </div>

          <div className="border-2 border-black bg-neutral-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              Total Value
            </p>

            <p className="mt-1 text-xl font-black">
              ${Number(cluster.totalValue).toLocaleString()}
            </p>
          </div>

          <div className="border-2 border-black bg-neutral-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              Status
            </p>

            <p className="mt-1 text-xl font-black capitalize">
              {cluster.status}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t-2 border-black pt-4 text-xs font-bold uppercase tracking-wide text-neutral-500">
          Window: {new Date(cluster.windowStart).toLocaleDateString()} –{" "}
          {new Date(cluster.windowEnd).toLocaleDateString()}
        </div>
      </section>

      {/* Score Breakdown */}
      <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000]">
        <h2 className="mb-5 text-lg font-black uppercase tracking-tight">
          Score Breakdown
        </h2>

        {data.scoreBreakdown ? (
          <div className="divide-y-2 divide-black">
            <div className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm font-semibold">
                Insider Count
              </span>

              <span className="font-black">
                {data.scoreBreakdown.insiderCountScore}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm font-semibold">
                Role Diversity
              </span>

              <span className="font-black">
                {data.scoreBreakdown.roleDiversityScore}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm font-semibold">
                Total Value
              </span>

              <span className="font-black">
                {data.scoreBreakdown.totalValueScore}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm font-semibold">
                Window Tightness
              </span>

              <span className="font-black">
                {data.scoreBreakdown.windowTightnessScore}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            Score breakdown is not available for this cluster.
          </p>
        )}
      </section>

      {/* Insiders */}
      <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000]">
        <h2 className="mb-5 text-lg font-black uppercase tracking-tight">
          Insiders Involved
        </h2>

        {uniqueInsiders.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No insiders found for this cluster.
          </p>
        ) : (
          <div className="space-y-3">
            {uniqueInsiders.map((insider) => (
              <Link
                key={insider.id}
                to={`/insiders/${insider.id}`}
                className="block border-2 border-black p-4 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-[3px_3px_0_#000]"
              >
                <p className="font-bold">
                  {insider.name}
                </p>

                <p className="mt-1 text-sm font-medium text-neutral-500">
                  {insider.title ?? "Role unknown"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Transactions */}
      <section>
        <h2 className="mb-4 text-lg font-black uppercase tracking-tight">
          Cluster Transactions
        </h2>

        <TransactionTable
          transactions={cluster.clusterTransactions.map(
            (item) => item.transaction,
          )}
        />
      </section>
    </div>
  );
}