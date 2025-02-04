import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { BalanceCard } from "./BalanceCard";
import { AmountInput } from "./AmountInput";
import { TransactionActions } from "./TransactionActions";
import { TransactionHistory } from "./TransactionHistory";

declare global {
  interface Window {
    IntaSend: any;
  }
}

export function TransactionContainer() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState("10");
  const { toast } = useToast();

  useEffect(() => {
    // Initialize IntaSend for deposits with test public key
    const intaSend = new window.IntaSend({
      publicAPIKey: "ISPubKey_test_c54e1f70-0859-4c79-b912-de3b3ae02e42",
      live: false, // Set to false for test environment
    });

    intaSend.on("COMPLETE", (results: any) => {
      console.log("Transaction successful", results);
      toast({
        title: "Transaction Successful",
        description: "Your transaction has been processed successfully.",
      });
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
  }, [amount, toast]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <BalanceCard balance={balance} />
        <AmountInput amount={amount} onChange={setAmount} />
      </div>
      <TransactionActions amount={amount} />
      <TransactionHistory transactions={transactions} />
    </div>
  );
}