import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
  );
}