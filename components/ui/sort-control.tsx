'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Clock, Trophy } from 'lucide-react';

export type SortValue = 'trending' | 'latest' | 'top';

export interface SortControlProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
  variant?: 'radio' | 'dropdown';
  className?: string;
}

const sortOptions: Array<{ value: SortValue; label: string; icon: React.ReactNode }> = [
  { value: 'trending', label: '트렌딩', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'latest', label: '최신순', icon: <Clock className="h-4 w-4" /> },
  { value: 'top', label: '인기순', icon: <Trophy className="h-4 w-4" /> },
];

const SortControl = React.forwardRef<HTMLDivElement, SortControlProps>(
  ({ value, onChange, variant = 'dropdown', className }, ref) => {
    if (variant === 'radio') {
      return (
        <div ref={ref} className={cn('space-y-2', className)}>
          <RadioGroup value={value} onValueChange={(v) => onChange(v as SortValue)}>
            {sortOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
                <Label
                  htmlFor={`sort-${option.value}`}
                  className="flex items-center gap-2 cursor-pointer font-normal"
                >
                  {option.icon}
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('w-full sm:max-w-[200px]', className)}>
        <Select value={value} onValueChange={(v) => onChange(v as SortValue)}>
          <SelectTrigger>
            <SelectValue placeholder="정렬 선택" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);

SortControl.displayName = 'SortControl';

export { SortControl };
