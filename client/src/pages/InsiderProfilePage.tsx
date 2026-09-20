import { Link, useParams } from "react-router-dom";
import { useInsiderProfile } from "../features/insiders/api";
import { TransactionTable } from "../components/domain/TransactionTable";

export function InsiderProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error } = useInsiderProfile(id ?? "");

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
    const status = (
      error as { response?: { status?: number } }
    )?.response?.status;

    if (status === 404) {
      return (
        <div className="space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Insider not found
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
          Failed to load insider profile
        </h1>

        <p className="mt-1 text-sm text-red-600">
          Please try again later.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { insider, roles, transactionHistory, stats } = data;

  return (
    <div className="space-y-6">
      <Link
        to="/clusters"
        className="inline-block text-sm font-bold uppercase tracking-wide underline decoration-2 underline-offset-2 transition-transform hover:-translate-x-0.5"
      >
        ← Back to clusters
      </Link>

      {/* Insider Summary */}
      <section className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_#000]">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            {insider.name}
          </h1>

          <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wide text-neutral-500">
            <span>CIK: {insider.cik}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="border-2 border-black bg-neutral-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              Average Purchase Size
            </p>

            <p className="mt-1 text-xl font-black">
              ${stats.avgPurchaseSize.toLocaleString()}
            </p>
          </div>

          <div className="border-2 border-black bg-neutral-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
              Purchase Frequency
            </p>

            <p className="mt-1 text-xl font-black">
              {stats.purchaseFrequency}
            </p>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000]">
        <h2 className="mb-5 text-lg font-black uppercase tracking-tight">
          Roles
        </h2>

        {roles.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No roles found.
          </p>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="border-2 border-black p-4 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-[3px_3px_0_#000]"
              >
                <p className="font-bold">
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

                <p className="mt-1 text-sm font-medium text-neutral-500">
                  Company: {role.company.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Transaction History */}
      <section>
        <h2 className="mb-4 text-lg font-black uppercase tracking-tight">
          Transaction History
        </h2>

        <TransactionTable transactions={transactionHistory} />
      </section>
    </div>
  );
}