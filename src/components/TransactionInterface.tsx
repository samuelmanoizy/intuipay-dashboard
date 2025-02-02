import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BalanceCard } from "./transaction/BalanceCard";
import { AmountInput } from "./transaction/AmountInput";
import { PhoneInput } from "./transaction/PhoneInput";
import { TransactionHistory } from "./transaction/TransactionHistory";

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

    // Handle withdrawal button click
    const withdrawalButton = document.querySelector('.intaSendWithdrawButton');
    if (withdrawalButton) {
      withdrawalButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Validate phone number and amount before proceeding
        if (!phoneNumber || phoneNumber.trim() === '') {
          toast({
            title: "Validation Error",
            description: "Please enter a valid phone number.",
            variant: "destructive",
          });
          return;
        }

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          toast({
            title: "Validation Error",
            description: "Please enter a valid amount greater than 0.",
            variant: "destructive",
          });
          return;
        }

        try {
          console.log('Initiating withdrawal:', { phoneNumber, amount: numericAmount });
          
          // Call the Supabase Edge Function with proper configuration
          const { data, error } = await supabase.functions.invoke('process-withdrawal', {
            body: { phoneNumber, amount: numericAmount },
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (error) {
            console.error("Withdrawal error:", error);
            throw new Error(error.message || "Failed to process withdrawal");
          }

          console.log("Withdrawal successful", data);
          setBalance((prev) => prev - numericAmount);
          setTransactions((prev) => [...prev, { 
            type: "withdrawal", 
            amount: numericAmount, 
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
            description: error.message || "There was an error processing your withdrawal.",
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
    <div className="space-y-6">
      <BalanceCard balance={balance} />
      <AmountInput amount={amount} onChange={setAmount} />
      <PhoneInput phoneNumber={phoneNumber} onChange={setPhoneNumber} />
      
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
            className="intaSendWithdrawButton"
            data-phone_number={phoneNumber}
            data-amount={amount}
            data-currency="KES"
            data-email="joe@doe.com"
            data-first_name="JOE"
            data-last_name="DOE"
          >
            WITHDRAW
          </button>
        </div>
      </Card>

      <TransactionHistory transactions={transactions} />
    </div>
  );
}