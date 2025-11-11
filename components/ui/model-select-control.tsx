'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Model {
  id: string;
  name: string;
  description?: string;
}

export interface ModelSelectControlProps {
  model: string;
  models: Model[];
  onSelectModel: (modelId: string) => void;
  label?: string;
  className?: string;
}

const ModelSelectControl = React.forwardRef<HTMLDivElement, ModelSelectControlProps>(
  ({ model, models, onSelectModel, label = 'Model', className }, ref) => {
    const selectedModel = models.find((m) => m.id === model);

    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)}>
        <span className="text-sm text-slate-600 font-medium">{label}:</span>
        <Select value={model} onValueChange={onSelectModel}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue>
              {selectedModel?.name || 'Select model'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Available Models</SelectLabel>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{m.name}</span>
                    {m.description && (
                      <span className="text-xs text-slate-500">{m.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }
);

ModelSelectControl.displayName = 'ModelSelectControl';

export { ModelSelectControl };
