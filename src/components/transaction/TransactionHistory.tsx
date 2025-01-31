import { Card } from "@/components/ui/card";

interface Transaction {
  type: string;
  amount: number;
  date: Date;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
      <div className="space-y-4">
        {transactions.map((tx, index) => (
          <div key={index} className="flex justify-between items-center border-b pb-2">
            <div>
              <p className="font-semibold capitalize">{tx.type}</p>
              <p className="text-sm text-gray-500">
                {tx.date.toLocaleDateString()}
              </p>
            </div>
            <p className="font-bold">KES {tx.amount.toFixed(2)}</p>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-gray-500">No transactions yet</p>
        )}
      </div>
    </Card>
  );
}