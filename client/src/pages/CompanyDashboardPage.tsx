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
        <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
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
        <div className="rounded-xl border p-8 text-center">
          <h1 className="text-xl font-semibold">Company not found</h1>

          <p className="mt-2 text-sm text-gray-500">
            The company you're looking for doesn't exist.
          </p>

          <Link
            to="/clusters"
            className="mt-4 inline-block text-sm font-medium underline"
          >
            Back to clusters
          </Link>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="font-semibold text-red-700">Failed to load company</h1>

        <p className="mt-1 text-sm text-red-600">Please try again later.</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { company, currentInsiders, recentTransactions, clusterHistory } = data;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to="/clusters"
            className="text-sm text-gray-500 hover:underline"
          >
            ← Back to clusters
          </Link>

          <h1 className="mt-2 text-3xl font-bold">{company.name}</h1>

          <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
            <span>{company.ticker}</span>
            <span>CIK: {company.cik}</span>

            {company.sector && <span>{company.sector}</span>}
          </div>
        </div>

        <WatchlistButton companyId={company.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Current Insiders</h2>

            <div className="mt-4 space-y-3">
              {currentInsiders.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No current insiders found.
                </p>
              ) : (
                currentInsiders.map((insider) => (
                  <Link
                    key={insider.id}
                    to={`/insiders/${insider.id}`}
                    className="block rounded-lg border p-3 hover:bg-gray-50"
                  >
                    <p className="font-medium">{insider.name}</p>

                    {insider.cik && (
                      <p className="text-sm text-gray-500">
                        CIK: {insider.cik}
                      </p>
                    )}
                  </Link>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Cluster History</h2>

            <div className="space-y-3">
              {clusterHistory.length === 0 ? (
                <div className="rounded-xl border p-6 text-sm text-gray-500">
                  No cluster history found.
                </div>
              ) : (
                clusterHistory.map((cluster) => (
                  <Link
                    key={cluster.id}
                    to={`/clusters/${cluster.id}`}
                    className="block rounded-xl border bg-white p-4 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {new Date(cluster.windowStart).toLocaleDateString()} –{" "}
                          {new Date(cluster.windowEnd).toLocaleDateString()}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {cluster.insiderCount}{" "}
                          {cluster.insiderCount === 1 ? "insider" : "insiders"}
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

        <section>
          <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>

          <TransactionTable transactions={recentTransactions} />
        </section>
      </div>
    </div>
  );
}
