
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Building, MapPin } from 'lucide-react';

interface AddressTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const AddressTypeSelector = ({ value, onValueChange }: AddressTypeSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-muted/30 border-border">
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-orange-500" />
          <SelectValue placeholder="Select address type" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Home">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-orange-500" />
            <span>Home</span>
          </div>
        </SelectItem>
        <SelectItem value="Office">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-500" />
            <span>Office</span>
          </div>
        </SelectItem>
        <SelectItem value="Other">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-500" />
            <span>Other</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
