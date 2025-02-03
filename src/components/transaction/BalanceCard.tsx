import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
          <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-800 dark:text-blue-300">Current Balance</h2>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            KES {balance.toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
}