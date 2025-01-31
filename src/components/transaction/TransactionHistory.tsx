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
    <Card className="metallic-card p-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-muted-foreground">Transaction History</h2>
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center border-b border-secondary/30 pb-4 hover:bg-secondary/5 transition-colors rounded-lg p-2"
            >
              <div className="space-y-1">
                <p className="font-medium capitalize text-foreground">{tx.type}</p>
                <p className="text-sm text-muted-foreground">
                  {tx.date.toLocaleDateString()}
                </p>
              </div>
              <p className={`font-bold text-lg ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                {tx.type === 'deposit' ? '+' : '-'} KES {tx.amount.toFixed(2)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </Card>
  );
}