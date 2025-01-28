import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    IntaSend: any;
  }
}

export function TransactionInterface() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState("10");
  const { toast } = useToast();

  useEffect(() => {
    const intaSend = new window.IntaSend({
      publicAPIKey: "ISPubKey_live_df8814b3-3787-42eb-8d25-c4a46391a0d4",
      live: true,
    })
      .on("COMPLETE", (results: any) => {
        console.log("Transaction successful", results);
        toast({
          title: "Transaction Successful",
          description: "Your transaction has been processed successfully.",
        });
        // In a real app, you'd update the balance from your backend
        const transactionAmount = parseFloat(amount);
        setBalance((prev) => prev + transactionAmount);
        setTransactions((prev) => [...prev, { 
          type: results.type || "deposit", 
          amount: transactionAmount, 
          date: new Date() 
        }]);
      })
      .on("FAILED", (results: any) => {
        console.log("Transaction failed", results);
        toast({
          title: "Transaction Failed",
          description: "There was an error processing your transaction.",
          variant: "destructive",
        });
      });

    return () => {
      // Cleanup if needed
    };
  }, [amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value)) && Number(value) >= 0) {
      setAmount(value);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Current Balance</h2>
        <p className="text-4xl font-bold text-[#2cc1ee]">KES {balance.toFixed(2)}</p>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Transaction Amount</h2>
        <div className="flex gap-4 items-center">
          <Input
            type="number"
            min="0"
            value={amount}
            onChange={handleAmountChange}
            className="max-w-[200px]"
            placeholder="Enter amount"
          />
          <span className="text-sm text-gray-500">KES</span>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Actions</h2>
        <div className="flex gap-4">
          <button
            className="intaSendPayButton"
            data-amount={amount}
            data-currency="KES"
            data-email="joe@doe.com"
            data-first_name="JOE"
            data-last_name="DOE"
            data-country="KE"
          >
            DEPOSIT
          </button>
          <button
            className="intaSendPayButton"
            data-amount={amount}
            data-currency="KES"
            data-email="joe@doe.com"
            data-first_name="JOE"
            data-last_name="DOE"
            data-country="KE"
            data-method="withdraw"
          >
            WITHDRAW
          </button>
        </div>
      </Card>

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
    </div>
  );
}