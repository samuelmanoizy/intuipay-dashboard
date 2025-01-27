import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Overview</h2>
        <p className="text-gray-600">Welcome to your personalized dashboard. Navigate using the sidebar to access different sections.</p>
      </Card>
    </div>
  );
}