'use client';

import * as React from 'react';
import { Mic, Paperclip, ChevronDown, Loader2, Search, Sparkles, Lightbulb, Globe, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/icon-button';

export interface SearchComposeInputActions {
  voice?: boolean;
  fileUpload?: boolean;
  modelSelect?: boolean;
}

export interface SearchComposeInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onSubmit'> {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  loading?: boolean;
  actions?: SearchComposeInputActions;
  onVoiceClick?: () => void;
  onFileUploadClick?: () => void;
  onModelSelectClick?: () => void;
}

const SearchComposeInput = React.forwardRef<HTMLTextAreaElement, SearchComposeInputProps>(
  (
    {
      className,
      value,
      onChange,
      onSubmit,
      placeholder = '궁금한 커리어 정보를 검색해보세요...',
      autoFocus = false,
      loading = false,
      actions = { voice: true, fileUpload: true, modelSelect: true },
      onVoiceClick,
      onFileUploadClick,
      onModelSelectClick,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value || '');
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // Auto-resize textarea
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    }, [internalValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const handleSubmit = () => {
      if (!internalValue.trim() || loading) return;
      onSubmit?.(internalValue.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <div className="relative w-full">
        <div
          className={cn(
            'relative flex flex-col rounded-xl border-2 border-slate-200 bg-white shadow-md transition-all duration-200',
            'hover:shadow-lg hover:border-slate-300',
            'focus-within:border-slate-400 focus-within:shadow-lg',
            loading && 'opacity-60 pointer-events-none',
            className
          )}
        >
          {/* Textarea */}
          <textarea
            ref={(node) => {
              textareaRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            value={internalValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={loading}
            rows={1}
            className={cn(
              'w-full resize-none px-6 py-4 text-base bg-transparent outline-none',
              'placeholder:text-slate-400',
              'disabled:cursor-not-allowed',
              'min-h-[80px] max-h-[200px]'
            )}
            {...props}
          />

          {/* Action Bar */}
          <div className="flex items-center justify-end px-4 pb-3 gap-2">
            {/* Left Actions - 미구현 기능 주석처리 */}
            {/* <div className="flex items-center gap-1">
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => console.log('Search')}
                disabled={loading}
                aria-label="검색"
                className="text-slate-400 hover:text-slate-600"
              >
                <Search className="h-5 w-5" />
              </IconButton>
              <IconButton
                variant="ghost"
                size="sm"
                onClick={onFileUploadClick}
                disabled={loading}
                aria-label="파일 업로드"
                className="text-slate-400 hover:text-slate-600"
              >
                <Paperclip className="h-5 w-5" />
              </IconButton>
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => console.log('Sparkles')}
                disabled={loading}
                aria-label="AI 추천"
                className="text-slate-400 hover:text-slate-600"
              >
                <Sparkles className="h-5 w-5" />
              </IconButton>
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => console.log('Lightbulb')}
                disabled={loading}
                aria-label="아이디어"
                className="text-slate-400 hover:text-slate-600"
              >
                <Lightbulb className="h-5 w-5" />
              </IconButton>
            </div> */}

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <>
                  {/* 미구현 기능 주석처리 */}
                  {/* <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log('Globe')}
                    disabled={loading}
                    aria-label="언어"
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Globe className="h-5 w-5" />
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={onModelSelectClick}
                    disabled={loading}
                    aria-label="모델 선택"
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={onFileUploadClick}
                    disabled={loading}
                    aria-label="첨부"
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Paperclip className="h-5 w-5" />
                  </IconButton> */}
                  <IconButton
                    variant="solid"
                    size="md"
                    onClick={handleSubmit}
                    disabled={!internalValue.trim()}
                    aria-label="검색 실행"
                    className="bg-slate-700 hover:bg-slate-800 text-white"
                  >
                    <Send className="h-5 w-5" />
                  </IconButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SearchComposeInput.displayName = 'SearchComposeInput';

export { SearchComposeInput };
