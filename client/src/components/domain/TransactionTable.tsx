import type { Transaction } from "../../features/companies/api";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({
  transactions,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-6 text-center text-sm font-medium text-neutral-500 shadow-[4px_4px_0_#000]">
        No recent transactions found.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto border-2 border-black bg-white shadow-[4px_4px_0_#000] sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-black text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                Date
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                Code
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                Shares
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                Price
              </th>
              <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                Value
              </th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b-2 border-black last:border-b-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3 font-medium">
                  {new Date(
                    transaction.transactionDate,
                  ).toLocaleDateString()}
                </td>

                <td className="px-4 py-3">
                  <span className="border-2 border-black px-2 py-1 text-xs font-black uppercase">
                    {transaction.transactionCode}
                  </span>
                </td>

                <td className="px-4 py-3 font-medium">
                  {Number(
                    transaction.shares,
                  ).toLocaleString()}
                </td>

                <td className="px-4 py-3 font-medium">
                  {transaction.pricePerShare !== null
                    ? `$${Number(
                        transaction.pricePerShare,
                      ).toLocaleString()}`
                    : "—"}
                </td>

                <td className="px-4 py-3 font-bold">
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
            className="border-2 border-black bg-white p-4 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                {new Date(
                  transaction.transactionDate,
                ).toLocaleDateString()}
              </span>

              <span className="border-2 border-black bg-black px-2 py-1 text-xs font-black uppercase text-white">
                {transaction.transactionCode}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[10px] font-black uppercase tracking-wide text-neutral-500">
                  Shares
                </dt>
                <dd className="mt-1 font-bold">
                  {Number(
                    transaction.shares,
                  ).toLocaleString()}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-black uppercase tracking-wide text-neutral-500">
                  Price
                </dt>
                <dd className="mt-1 font-bold">
                  {transaction.pricePerShare !== null
                    ? `$${Number(
                        transaction.pricePerShare,
                      ).toLocaleString()}`
                    : "—"}
                </dd>
              </div>

              <div className="col-span-2 border-t-2 border-black pt-3">
                <dt className="text-[10px] font-black uppercase tracking-wide text-neutral-500">
                  Value
                </dt>
                <dd className="mt-1 text-lg font-black">
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