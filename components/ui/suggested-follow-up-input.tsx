'use client';

import * as React from 'react';
import { SearchComposeInput, SearchComposeInputProps } from '@/components/ui/search-compose-input';
import { cn } from '@/lib/utils';

export interface SuggestedFollowUpInputProps extends Omit<SearchComposeInputProps, 'actions'> {
  // 추가 커스터마이징이 필요한 경우 여기에 props 추가
}

const SuggestedFollowUpInput = React.forwardRef<HTMLTextAreaElement, SuggestedFollowUpInputProps>(
  ({ className, placeholder = 'Ask a follow-up question...', ...props }, ref) => {
    return (
      <SearchComposeInput
        ref={ref}
        className={cn('shadow-sm', className)}
        placeholder={placeholder}
        actions={{ voice: false, fileUpload: false, modelSelect: false }}
        {...props}
      />
    );
  }
);

SuggestedFollowUpInput.displayName = 'SuggestedFollowUpInput';

export { SuggestedFollowUpInput };
