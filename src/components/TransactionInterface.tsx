import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'approved' | 'failed';
  created_at: string;
}

export function TransactionInterface() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
      return;
    }

    setTransactions(data || []);
    
    // Calculate balance from approved transactions
    const approvedTransactions = data?.filter(tx => tx.status === 'approved') || [];
    const calculatedBalance = approvedTransactions.reduce((acc, tx) => {
      return acc + (tx.type === 'deposit' ? tx.amount : -tx.amount);
    }, 0);
    
    setBalance(calculatedBalance);
  };

  const handleTransaction = async (type: 'deposit' | 'withdrawal') => {
    if (!phone || !name) {
      toast({
        title: "Error",
        description: "Please enter phone number and name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/functions/v1/handle-transaction', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          phone,
          name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Transaction failed');
      }

      toast({
        title: "Transaction Initiated",
        description: "Please check your phone for M-Pesa prompt",
      });

      // Refresh transactions list
      await fetchTransactions();

    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "There was an error processing your transaction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold mb-4">Transaction Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (KES)</label>
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={handleAmountChange}
              className="max-w-[200px]"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="max-w-[200px]"
              placeholder="e.g., 254712345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-[200px]"
              placeholder="Enter recipient name"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Actions</h2>
        <div className="flex gap-4">
          <Button
            onClick={() => handleTransaction('deposit')}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </Button>
          <Button
            onClick={() => handleTransaction('withdrawal')}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-semibold capitalize">{tx.type}</p>
                <p className="text-sm text-gray-500">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  Status: {tx.status}
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