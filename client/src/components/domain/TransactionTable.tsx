import type { Transaction } from "../../features/companies/api";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-gray-500">
        No recent transactions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
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
            <tr key={transaction.id} className="border-b last:border-b-0">
              <td className="px-4 py-3">
                {new Date(transaction.transactionDate).toLocaleDateString()}
              </td>

              <td className="px-4 py-3 font-medium">
                {transaction.transactionCode}
              </td>

              <td className="px-4 py-3">
                {Number(transaction.shares).toLocaleString()}
              </td>

              <td className="px-4 py-3">
                {transaction.pricePerShare !== null
                  ? `$${Number(transaction.pricePerShare).toLocaleString()}`
                  : "—"}
              </td>

              <td className="px-4 py-3">
                {transaction.totalValue !== null
                  ? `$${Number(transaction.totalValue).toLocaleString()}`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
