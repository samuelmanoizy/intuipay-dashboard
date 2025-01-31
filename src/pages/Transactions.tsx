import { TransactionInterface } from "@/components/TransactionInterface";

export default function Transactions() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        Transactions
      </h1>
      <TransactionInterface />
    </div>
  );
}