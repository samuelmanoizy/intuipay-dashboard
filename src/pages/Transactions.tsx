import { TransactionInterface } from "@/components/TransactionInterface";

export default function Transactions() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>
      <TransactionInterface />
    </div>
  );
}