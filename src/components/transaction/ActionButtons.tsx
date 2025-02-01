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
        <Button
          className="intaSendPayButton"
          data-amount={amount}
          data-currency="KES"
          data-email="joe@doe.com"
          data-first_name="JOE"
          data-last_name="DOE"
          data-country="KE"
        >
          DEPOSIT
        </Button>
        <Button
          className="intaSendWithdrawButton"
          data-phone_number={phoneNumber}
          data-amount={amount}
          data-currency="KES"
          data-email="joe@doe.com"
          data-first_name="JOE"
          data-last_name="DOE"
        >
          WITHDRAW
        </Button>
      </div>
    </div>
  );
}