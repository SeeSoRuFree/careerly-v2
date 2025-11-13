'use client';

import * as React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SearchComposeInput } from '@/components/ui/search-compose-input';
import { cn } from '@/lib/utils';
import { Bot, Loader2, X, FileText, Share2 } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ContextData {
  title: string;
}

export interface AiChatPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  postId?: string;
  qnaId?: string;
  type: 'post' | 'qna';
  onSendMessage?: (message: string) => void;
  onClose?: () => void;
  messages?: Message[];
  loading?: boolean;
  contextData?: ContextData;
  onShareMessage?: (content: string) => void;
}

export const AiChatPanel = React.forwardRef<HTMLDivElement, AiChatPanelProps>(
  (
    {
      postId,
      qnaId,
      type,
      onSendMessage,
      onClose,
      messages = [],
      loading = false,
      contextData,
      onShareMessage,
      className,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState('');
    const [showContext, setShowContext] = React.useState(true);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleSubmit = (value: string) => {
      if (!value.trim() || loading) return;
      onSendMessage?.(value.trim());
      setInputValue('');
    };

    const placeholderText = type === 'post'
      ? '이 게시글에 대해 AI에게 물어보세요...'
      : '이 질문에 대해 AI에게 물어보세요...';

    const suggestedQuestions = type === 'post'
      ? [
          '이 게시글의 핵심 내용을 요약해줘',
          '관련된 다른 주제는?',
          '실무에 어떻게 적용할 수 있을까?',
        ]
      : [
          '이 질문에 대한 추가 조언은?',
          '비슷한 사례가 있을까?',
          '준비 과정에서 주의할 점은?',
        ];

    return (
      <div
        ref={ref}
        className={cn('flex flex-col h-full bg-white', className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-coral-50">
            <span className="text-lg font-bold text-coral-600">C</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">AI 어시스턴트</h3>
            <p className="text-xs text-slate-500">
              {type === 'post' ? '게시글' : '질문'}에 대해 자세히 알아보세요
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="닫기"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <div className="flex items-center justify-center w-full h-full bg-coral-50">
                  <Bot className="h-4 w-4 text-coral-500" />
                </div>
              </Avatar>
              <div className="max-w-[85%] rounded-lg px-4 py-2.5 bg-slate-100 text-slate-900">
                <p className="text-sm leading-relaxed mb-3">
                  안녕하세요! 이 {type === 'post' ? '게시글' : '질문'}에 대해 궁금한 점이 있으신가요?
                </p>
                <div className="flex flex-col gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSubmit(question)}
                      className="px-3 py-2 text-sm text-left text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                      disabled={loading}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 group',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <div className="flex items-center justify-center w-full h-full bg-coral-50">
                    <Bot className="h-4 w-4 text-coral-500" />
                  </div>
                </Avatar>
              )}

              <div className="flex-1 min-w-0 flex items-start gap-2">
                <div
                  className={cn(
                    'flex-1 rounded-lg px-4 py-2.5',
                    message.role === 'user'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-900'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      message.role === 'user' ? 'text-slate-300' : 'text-slate-500'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {message.role === 'assistant' && onShareMessage && (
                  <button
                    onClick={() => onShareMessage(message.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 flex-shrink-0"
                    aria-label="댓글로 공유"
                    title="댓글로 공유"
                  >
                    <Share2 className="h-4 w-4 text-slate-500" />
                  </button>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-slate-200 text-slate-600">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <div className="flex items-center justify-center w-full h-full bg-coral-50">
                  <Bot className="h-4 w-4 text-coral-500" />
                </div>
              </Avatar>
              <div className="max-w-[85%] rounded-lg px-4 py-2.5 bg-slate-100">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                  <span className="text-sm text-slate-500">AI가 생각 중입니다...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Context Card */}
        {contextData && showContext && (
          <div className="px-6 pb-2 flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 bg-coral-50 rounded-full px-3 py-1.5 border border-coral-100">
              <FileText className="h-3.5 w-3.5 text-coral-600 flex-shrink-0" />
              <span className="text-xs text-slate-700">
                {contextData.title.length > 10
                  ? `${contextData.title.slice(0, 10)}...`
                  : contextData.title}
              </span>
              <button
                onClick={() => setShowContext(false)}
                className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-coral-100 transition-colors flex-shrink-0 ml-0.5"
                aria-label="컨텍스트 숨기기"
              >
                <X className="h-3 w-3 text-coral-600" />
              </button>
            </div>
          </div>
        )}

        {/* Input with SearchComposeInput style */}
        <div className="px-4 pb-4 flex-shrink-0">
          <SearchComposeInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            placeholder={placeholderText}
            loading={loading}
            actions={{
              voice: false,
              fileUpload: false,
              modelSelect: false
            }}
          />
        </div>
      </div>
    );
  }
);

AiChatPanel.displayName = 'AiChatPanel';
