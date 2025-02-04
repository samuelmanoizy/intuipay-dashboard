import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface AmountInputProps {
  amount: string;
  onChange: (value: string) => void;
}

export function AmountInput({ amount, onChange }: AmountInputProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value)) && Number(value) >= 0) {
      onChange(value);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
          <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">Transaction Amount</h2>
          <div className="flex gap-4 items-center">
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={handleAmountChange}
              className="max-w-[200px] border-blue-200 dark:border-blue-700"
              placeholder="Enter amount"
            />
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">KES</span>
          </div>
        </div>
      </div>
    </Card>
  );
}