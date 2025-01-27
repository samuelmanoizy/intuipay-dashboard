import { Card } from "@/components/ui/card";

export default function Content() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Content</h1>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Content Management</h2>
        <p className="text-gray-600">Manage your content here. This section will be implemented in future updates.</p>
      </Card>
    </div>
  );
}