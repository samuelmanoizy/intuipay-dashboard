import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BalanceCard } from "./transaction/BalanceCard";
import { AmountInput } from "./transaction/AmountInput";
import { PhoneInput } from "./transaction/PhoneInput";
import { TransactionHistory } from "./transaction/TransactionHistory";
import { ActionButtons } from "./transaction/ActionButtons";

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
  const { toast } = useToast();

  useEffect(() => {
    // Initialize IntaSend for deposits
    const intaSend = new window.IntaSend({
      publicAPIKey: "ISPubKey_live_df8814b3-3787-42eb-8d25-c4a46391a0d4",
      live: true,
    });

    // Handle deposit events
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

    // Handle withdrawal button click
    const withdrawalButton = document.querySelector('.intaSendWithdrawButton');
    if (withdrawalButton) {
      withdrawalButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
          const { data, error } = await supabase.functions.invoke('process-withdrawal', {
            body: { phoneNumber, amount: parseFloat(amount) }
          });

          if (error) throw error;

          console.log("Withdrawal successful", data);
          const transactionAmount = parseFloat(amount);
          setBalance((prev) => prev - transactionAmount);
          setTransactions((prev) => [...prev, { 
            type: "withdrawal", 
            amount: transactionAmount, 
            date: new Date() 
          }]);
          
          toast({
            title: "Withdrawal Successful",
            description: "Your withdrawal has been processed successfully.",
          });
        } catch (error) {
          console.error("Withdrawal failed:", error);
          toast({
            title: "Withdrawal Failed",
            description: "There was an error processing your withdrawal.",
            variant: "destructive",
          });
        }
      });
    }

    return () => {
      const withdrawalButton = document.querySelector('.intaSendWithdrawButton');
      if (withdrawalButton) {
        withdrawalButton.removeEventListener('click', () => {});
      }
    };
  }, [amount, phoneNumber, toast]);

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