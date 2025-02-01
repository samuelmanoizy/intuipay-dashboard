import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  amount: string;
  phoneNumber: string;
}

export function ActionButtons({ amount, phoneNumber }: ActionButtonsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-muted-foreground">Actions</h2>
      <div className="flex flex-wrap gap-4">
        <button
          className="intasend-pay-button px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
          data-amount={amount}
          data-currency="KES"
          data-email="mwadimemanoizy@gmail.com"
          data-first_name="MWADIME"
          data-last_name="MANOIZY"
          data-country="KE"
        >
          DEPOSIT
        </button>
        <button
          className="intasend-withdraw-button px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium transition-colors"
          data-phone_number={phoneNumber}
          data-amount={amount}
          data-currency="KES"
          data-email="mwadimemanoizy@gmail.com"
          data-first_name="MWADIME"
          data-last_name="MANOIZY"
        >
          WITHDRAW
        </button>
      </div>
    </div>
  );
}