import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PhoneInputProps {
  phoneNumber: string;
  onChange: (value: string) => void;
}

export function PhoneInput({ phoneNumber, onChange }: PhoneInputProps) {
  return (
    <Card className="metallic-card p-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-muted-foreground">Phone Number</h2>
        <div className="flex gap-4 items-center">
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onChange(e.target.value)}
            className="max-w-[200px] bg-background/50 border-secondary"
            placeholder="Enter phone number"
          />
        </div>
      </div>
    </Card>
  );
}