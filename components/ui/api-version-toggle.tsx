'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ApiVersion = 'v1' | 'v3' | 'v4';

export interface ApiVersionToggleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  version: ApiVersion;
  onChange: (version: ApiVersion) => void;
}

// 버전별 표시 라벨 맵
const VERSION_LABELS: Record<ApiVersion, string> = {
  v1: '기본',
  v3: 'v3',
  v4: 'v4',
};

const ApiVersionToggle = React.forwardRef<HTMLDivElement, ApiVersionToggleProps>(
  ({ version, onChange, className, ...props }, ref) => {
    const versions: ApiVersion[] = ['v1', 'v3', 'v4'];

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center bg-slate-100 rounded-lg p-1',
          className
        )}
        {...props}
      >
        {versions.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'flex items-center justify-center p-2 rounded-md text-sm font-medium transition-all duration-200',
              version === v
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
            aria-pressed={version === v}
            aria-label={`${VERSION_LABELS[v]} API 버전`}
          >
            {VERSION_LABELS[v]}
          </button>
        ))}
      </div>
    );
  }
);

ApiVersionToggle.displayName = 'ApiVersionToggle';

export { ApiVersionToggle };
