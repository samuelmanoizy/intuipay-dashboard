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
    <Card className="metallic-card p-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-muted-foreground">Transaction Amount</h2>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-[200px]">
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={handleAmountChange}
              className="pr-16 bg-background/50 border-secondary"
              placeholder="Enter amount"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              KES
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}