import { Card } from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card className="metallic-card p-8 transition-all hover:scale-[1.02]">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-muted-foreground">Current Balance</h2>
        <p className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          KES {balance.toFixed(2)}
        </p>
      </div>
    </Card>
  );
}