import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PhoneInputProps {
  phoneNumber: string;
  onChange: (value: string) => void;
}

export function PhoneInput({ phoneNumber, onChange }: PhoneInputProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Phone Number</h2>
      <div className="flex gap-4 items-center">
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-[200px]"
          placeholder="Enter phone number"
        />
      </div>
    </Card>
  );
}