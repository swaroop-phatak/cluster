import type { Transaction } from "../../features/companies/api";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({
  transactions,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-gray-500">
        No recent transactions found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Shares</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Value</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b last:border-b-0"
              >
                <td className="px-4 py-3">
                  {new Date(
                    transaction.transactionDate,
                  ).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 font-medium">
                  {transaction.transactionCode}
                </td>

                <td className="px-4 py-3">
                  {Number(
                    transaction.shares,
                  ).toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  {transaction.pricePerShare !== null
                    ? `$${Number(
                        transaction.pricePerShare,
                      ).toLocaleString()}`
                    : "—"}
                </td>

                <td className="px-4 py-3">
                  {transaction.totalValue !== null
                    ? `$${Number(
                        transaction.totalValue,
                      ).toLocaleString()}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {transactions.map((transaction) => (
          <article
            key={transaction.id}
            className="rounded-xl border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {new Date(
                  transaction.transactionDate,
                ).toLocaleDateString()}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
                {transaction.transactionCode}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500">
                  Shares
                </dt>
                <dd className="mt-1 font-medium">
                  {Number(
                    transaction.shares,
                  ).toLocaleString()}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500">
                  Price
                </dt>
                <dd className="mt-1 font-medium">
                  {transaction.pricePerShare !== null
                    ? `$${Number(
                        transaction.pricePerShare,
                      ).toLocaleString()}`
                    : "—"}
                </dd>
              </div>

              <div className="col-span-2">
                <dt className="text-xs text-gray-500">
                  Value
                </dt>
                <dd className="mt-1 font-medium">
                  {transaction.totalValue !== null
                    ? `$${Number(
                        transaction.totalValue,
                      ).toLocaleString()}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}