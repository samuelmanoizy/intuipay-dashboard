import { useState } from "react";
import { BalanceCard } from "./transaction/BalanceCard";
import { AmountInput } from "./transaction/AmountInput";
import { PhoneInput } from "./transaction/PhoneInput";
import { TransactionHistory } from "./transaction/TransactionHistory";
import { ActionButtons } from "./transaction/ActionButtons";
import { useIntaSend } from "@/hooks/useIntaSend";

declare global {
  interface Window {
    IntaSend: any;
  }
}

export function TransactionInterface() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState("10");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleTransactionComplete = (type: string, transactionAmount: number) => {
    setBalance((prev) => type === "withdrawal" ? prev - transactionAmount : prev + transactionAmount);
    setTransactions((prev) => [...prev, { 
      type, 
      amount: transactionAmount, 
      date: new Date() 
    }]);
  };

  useIntaSend({
    amount,
    onTransactionComplete: handleTransactionComplete
  });

  return (
    <div className="grid gap-8">
      <BalanceCard balance={balance} />
      
      <div className="grid md:grid-cols-2 gap-8">
        <AmountInput amount={amount} onChange={setAmount} />
        <PhoneInput phoneNumber={phoneNumber} onChange={setPhoneNumber} />
      </div>
      
      <div className="metallic-card p-8">
        <ActionButtons amount={amount} phoneNumber={phoneNumber} />
      </div>

      <TransactionHistory transactions={transactions} />
    </div>
  );
}