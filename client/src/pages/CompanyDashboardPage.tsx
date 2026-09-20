import { Link, useParams } from "react-router-dom";
import { useCompanyDashboard } from "../features/companies/api";
import { TransactionTable } from "../components/domain/TransactionTable";
import { WatchlistButton } from "../features/companies/components/WatchlistButton";
import { ScoreBadge } from "../features/clusters/components/ScoreBadge";

export function CompanyDashboardPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useCompanyDashboard(id ?? "");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse border-2 border-black bg-neutral-100" />
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
        <div className="border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_#000]">
          <h1 className="text-xl font-black uppercase tracking-tight">
            Company not found
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            The company you're looking for doesn't exist.
          </p>

          <Link
            to="/clusters"
            className="mt-4 inline-block text-sm font-bold uppercase tracking-wide underline decoration-2 underline-offset-2"
          >
            Back to clusters
          </Link>
        </div>
      );
    }

    return (
      <div className="border-2 border-red-600 bg-white p-6 shadow-[4px_4px_0_#dc2626]">
        <h1 className="font-bold uppercase tracking-wide text-red-700">
          Failed to load company
        </h1>

        <p className="mt-1 text-sm text-red-600">
          Please try again later.
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { company, currentInsiders, recentTransactions, clusterHistory } =
    data;

  return (
    <div>
      {/* Company Header */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to="/clusters"
            className="inline-block text-sm font-bold uppercase tracking-wide underline decoration-2 underline-offset-2 transition-transform hover:-translate-x-0.5"
          >
            ← Back to clusters
          </Link>

          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight">
            {company.name}
          </h1>

          <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wide text-neutral-500">
            <span>{company.ticker}</span>
            <span>CIK: {company.cik}</span>

            {company.sector && <span>{company.sector}</span>}
          </div>
        </div>

        <WatchlistButton companyId={company.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Current Insiders */}
          <section className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
            <h2 className="text-lg font-black uppercase tracking-tight">
              Current Insiders
            </h2>

            <div className="mt-4 space-y-3">
              {currentInsiders.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No current insiders found.
                </p>
              ) : (
                currentInsiders.map((insider) => (
                  <Link
                    key={insider.id}
                    to={`/insiders/${insider.id}`}
                    className="block border-2 border-black p-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-[3px_3px_0_#000]"
                  >
                    <p className="font-bold">
                      {insider.name}
                    </p>

                    <p className="mt-1 text-sm font-medium text-neutral-500">
                      {insider.roles[0]?.title ?? "Role unknown"}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Cluster History */}
          <section>
            <h2 className="mb-4 text-lg font-black uppercase tracking-tight">
              Cluster History
            </h2>

            <div className="space-y-3">
              {clusterHistory.length === 0 ? (
                <div className="border-2 border-black bg-white p-6 text-sm text-neutral-500 shadow-[4px_4px_0_#000]">
                  No cluster history found.
                </div>
              ) : (
                clusterHistory.map((cluster) => (
                  <Link
                    key={cluster.id}
                    to={`/clusters/${cluster.id}`}
                    className="block border-2 border-black bg-white p-4 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold">
                          {new Date(
                            cluster.windowStart,
                          ).toLocaleDateString()}{" "}
                          –{" "}
                          {new Date(
                            cluster.windowEnd,
                          ).toLocaleDateString()}
                        </p>

                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-neutral-500">
                          {cluster.insiderCount}{" "}
                          {cluster.insiderCount === 1
                            ? "insider"
                            : "insiders"}
                        </p>
                      </div>

                      <ScoreBadge score={Number(cluster.score)} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Recent Transactions */}
        <section>
          <h2 className="mb-4 text-lg font-black uppercase tracking-tight">
            Recent Transactions
          </h2>

          <TransactionTable transactions={recentTransactions} />
        </section>
      </div>
    </div>
  );
}