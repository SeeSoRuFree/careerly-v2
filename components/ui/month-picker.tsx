'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

export interface MonthPickerProps {
  value?: string; // "YYYY-MM" format
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minYear?: number;
  maxYear?: number;
  id?: string;
}

export function MonthPicker({
  value,
  onChange,
  placeholder = '날짜 선택',
  disabled = false,
  className,
  minYear = 1950,
  maxYear = new Date().getFullYear() + 10,
  id,
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse current value or use current date as default view
  const parseValue = React.useCallback(() => {
    if (value) {
      const [year, month] = value.split('-').map(Number);
      return { year, month };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }, [value]);

  const [viewYear, setViewYear] = React.useState(() => parseValue().year);

  // Sync viewYear when value changes
  React.useEffect(() => {
    if (value) {
      const [year] = value.split('-').map(Number);
      setViewYear(year);
    }
  }, [value]);

  const handleMonthSelect = (month: number) => {
    const formattedMonth = month.toString().padStart(2, '0');
    onChange?.(`${viewYear}-${formattedMonth}`);
    setIsOpen(false);
  };

  const handlePrevYear = () => {
    if (viewYear > minYear) {
      setViewYear(viewYear - 1);
    }
  };

  const handleNextYear = () => {
    if (viewYear < maxYear) {
      setViewYear(viewYear + 1);
    }
  };

  const formatDisplayValue = () => {
    if (!value) return null;
    const [year, month] = value.split('-').map(Number);
    return `${year}년 ${month}월`;
  };

  const displayValue = formatDisplayValue();
  const currentParsed = parseValue();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !displayValue && 'text-slate-400',
            displayValue && 'text-slate-900',
            className
          )}
        >
          <span>{displayValue || placeholder}</span>
          <Calendar className="h-4 w-4 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        {/* Year navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevYear}
            disabled={viewYear <= minYear}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-slate-900">{viewYear}년</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextYear}
            disabled={viewYear >= maxYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((monthName, index) => {
            const month = index + 1;
            const isSelected = value && viewYear === currentParsed.year && month === currentParsed.month;
            const isCurrentMonth =
              viewYear === new Date().getFullYear() &&
              month === new Date().getMonth() + 1;

            return (
              <button
                key={month}
                type="button"
                onClick={() => handleMonthSelect(month)}
                className={cn(
                  'h-9 rounded-md text-sm font-medium transition-colors',
                  'hover:bg-slate-100',
                  isSelected && 'bg-slate-900 text-white hover:bg-slate-800',
                  !isSelected && isCurrentMonth && 'border border-slate-300',
                  !isSelected && !isCurrentMonth && 'text-slate-700'
                )}
              >
                {monthName}
              </button>
            );
          })}
        </div>

        {/* Clear button */}
        {value && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-slate-500 hover:text-slate-700"
              onClick={() => {
                onChange?.('');
                setIsOpen(false);
              }}
            >
              날짜 지우기
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
