import { Link, useParams } from "react-router-dom";
import { useInsiderProfile } from "../features/insiders/api";
import { TransactionTable } from "../components/domain/TransactionTable";

export function InsiderProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useInsiderProfile(id ?? "");

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
    const status = (
      error as { response?: { status?: number } }
    )?.response?.status;

    if (status === 404) {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Insider not found</h1>
          <Link
            to="/clusters"
            className="text-sm font-medium underline"
          >
            Back to clusters
          </Link>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load insider profile.
      </div>
    );
  }

  if (!data) return null;

  const { insider, roles, transactionHistory, stats } = data;

  return (
    <div className="space-y-6">
      <Link
        to="/clusters"
        className="text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        ← Back to clusters
      </Link>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">{insider.name}</h1>

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
            <span>CIK: {insider.cik}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Average Purchase Size
            </p>
            <p className="mt-1 text-xl font-semibold">
              ${stats.avgPurchaseSize.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Purchase Frequency
            </p>
            <p className="mt-1 text-xl font-semibold">
              {stats.purchaseFrequency}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Roles</h2>

        {roles.length === 0 ? (
          <p className="text-sm text-gray-500">
            No roles found.
          </p>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-lg border p-4"
              >
                <p className="font-medium">
                  {role.title ||
                    [
                      role.isDirector && "Director",
                      role.isOfficer && "Officer",
                      role.isTenPercentOwner && "10% Owner",
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                    "Role not specified"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Company ID: {role.companyId}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Transaction History
        </h2>

        <TransactionTable transactions={transactionHistory} />
      </section>
    </div>
  );
}