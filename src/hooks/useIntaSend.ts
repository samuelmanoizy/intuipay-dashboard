import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseIntaSendProps {
  amount: string;
  onTransactionComplete: (type: string, amount: number) => void;
}

export function useIntaSend({ amount, onTransactionComplete }: UseIntaSendProps) {
  const { toast } = useToast();

  useEffect(() => {
    // Initialize IntaSend for deposits
    if (typeof window !== 'undefined' && window.IntaSend) {
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
        onTransactionComplete("deposit", parseFloat(amount));
      })
      .on("FAILED", (results: any) => {
        console.log("Transaction failed", results);
        toast({
          title: "Transaction Failed",
          description: "There was an error processing your transaction.",
          variant: "destructive",
        });
      });
    }

    // Handle withdrawal button click
    const withdrawalButton = document.querySelector('.intasend-withdraw-button');
    if (withdrawalButton) {
      withdrawalButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
          const { data, error } = await supabase.functions.invoke('process-withdrawal', {
            body: { 
              phoneNumber: withdrawalButton.getAttribute('data-phone_number'),
              amount: parseFloat(amount) 
            }
          });

          if (error) throw error;

          console.log("Withdrawal successful", data);
          onTransactionComplete("withdrawal", parseFloat(amount));
          
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
      const withdrawalButton = document.querySelector('.intasend-withdraw-button');
      if (withdrawalButton) {
        withdrawalButton.removeEventListener('click', () => {});
      }
    };
  }, [amount, toast, onTransactionComplete]);
}