import { Card } from "@/components/ui/card";

interface TransactionActionsProps {
  amount: string;
}

export function TransactionActions({ amount }: TransactionActionsProps) {
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
      <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">Actions</h2>
      <div className="flex gap-4">
        <button
          className="intaSendPayButton bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          data-amount={amount}
          data-currency="KES"
          data-email="joe@doe.com"
          data-first_name="JOE"
          data-last_name="DOE"
          data-country="KE"
        >
          DEPOSIT
        </button>
      </div>
    </Card>
  );
}