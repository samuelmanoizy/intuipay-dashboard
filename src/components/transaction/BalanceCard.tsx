import { Card } from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Current Balance</h2>
      <p className="text-4xl font-bold text-[#2cc1ee]">KES {balance.toFixed(2)}</p>
    </Card>
  );
}