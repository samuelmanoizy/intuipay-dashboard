import { Card } from "@/components/ui/card";
import { List, ArrowUpCircle } from "lucide-react";

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
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
          <List className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300">Transaction History</h2>
      </div>
      <div className="space-y-4">
        {transactions.map((tx, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center border-b border-blue-200 dark:border-blue-700/50 pb-4"
          >
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold capitalize text-blue-800 dark:text-blue-300">{tx.type}</p>
                <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
                  {tx.date.toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="font-bold text-blue-700 dark:text-blue-300">
              KES {tx.amount.toFixed(2)}
            </p>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-center text-blue-600/70 dark:text-blue-400/70 py-4">
            No transactions yet
          </p>
        )}
      </div>
    </Card>
  );
}