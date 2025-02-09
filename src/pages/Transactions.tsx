
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    IntaSend: any;
  }
}

export default function Transactions() {
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState<{ type: string; amount: string; date: string }[]>([]);

  const handleDeposit = () => {
    new window.IntaSend({
      publicAPIKey: "ISPubKey_live_df8814b3-3787-42eb-8d25-c4a46391a0d4",
      live: true,
    })
      .on("COMPLETE", (results: any) => {
        console.log("Do something on success", results);
        setTransactions(prev => [...prev, { type: 'deposit', amount, date: new Date().toLocaleString() }]);
      })
      .on("FAILED", (results: any) => {
        console.log("Do something on failure", results);
      })
      .on("IN-PROGRESS", (results: any) => {
        console.log("Payment in progress status", results);
      });
  };

  const handleWithdraw = () => {
    // Handle withdrawal logic here
    setTransactions(prev => [...prev, { type: 'withdraw', amount, date: new Date().toLocaleString() }]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <Button onClick={handleDeposit} className="bg-green-600 hover:bg-green-700">
            Deposit
          </Button>
          <Button onClick={handleWithdraw} variant="destructive">
            Withdraw
          </Button>
        </div>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-gray-500">No transactions yet</p>
            ) : (
              transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 border-b last:border-0"
                >
                  <div>
                    <span className={`font-medium ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'} ${transaction.amount}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">{transaction.date}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
