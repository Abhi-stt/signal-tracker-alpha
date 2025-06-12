
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StateSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'California',
  'Florida',
  'New York',
  'Texas',
  'Washington',
  'Oregon',
  'Nevada'
];

export const StateSelector = ({ value, onValueChange }: StateSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-muted/30 border-border">
        <SelectValue placeholder="Select state" />
      </SelectTrigger>
      <SelectContent>
        {states.map((state) => (
          <SelectItem key={state} value={state}>
            {state}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
