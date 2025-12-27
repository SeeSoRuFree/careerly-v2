'use client';

import * as React from 'react';
import Linkify from 'linkify-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import {
  Eye,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  X,
  Share2,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const linkifyOptions = {
  className: 'text-coral-500 hover:text-coral-600 underline break-all',
  target: '_blank',
  rel: 'noopener noreferrer',
};

export interface Answer {
  id: number;
  userId: number;
  userProfileId?: number;
  userName?: string;
  userImage?: string;
  userHeadline?: string;
  content: string;
  createdAt: string;
  isAccepted?: boolean;
}

export interface QnaDetailProps extends React.HTMLAttributes<HTMLDivElement> {
  qnaId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  hashTagNames?: string;
  viewCount: number;
  status?: number;
  isPublic?: number;
  answers?: Answer[];
  onAnswerSubmit?: (content: string) => void;
  onAcceptAnswer?: (answerId: number) => void;
  onAnswerEdit?: (answerId: number, content: string) => void;
  onAnswerDelete?: (answerId: number) => void;
  sharedAiContent?: string;
  onClearSharedContent?: () => void;
  currentUser?: {
    id?: number;
    name: string;
    image_url?: string;
  };
}

export const QnaDetail = React.forwardRef<HTMLDivElement, QnaDetailProps>(
  (
    {
      qnaId,
      title,
      description,
      createdAt,
      updatedAt,
      hashTagNames,
      viewCount,
      status = 0,
      isPublic = 1,
      answers = [],
      onAnswerSubmit,
      onAcceptAnswer,
      onAnswerEdit,
      onAnswerDelete,
      sharedAiContent,
      onClearSharedContent,
      currentUser,
      className,
      ...props
    },
    ref
  ) => {
    const [answerInput, setAnswerInput] = React.useState('');
    const [editingAnswerId, setEditingAnswerId] = React.useState<number | null>(null);
    const [editingAnswerContent, setEditingAnswerContent] = React.useState('');
    const [deleteAnswerDialogOpen, setDeleteAnswerDialogOpen] = React.useState(false);
    const [answerToDelete, setAnswerToDelete] = React.useState<number | null>(null);

    const handleAnswerEditStart = (answer: Answer) => {
      setEditingAnswerId(answer.id);
      setEditingAnswerContent(answer.content);
    };

    const handleAnswerEditSave = () => {
      if (editingAnswerId && editingAnswerContent.trim()) {
        onAnswerEdit?.(editingAnswerId, editingAnswerContent.trim());
        setEditingAnswerId(null);
        setEditingAnswerContent('');
      }
    };

    const handleAnswerEditCancel = () => {
      setEditingAnswerId(null);
      setEditingAnswerContent('');
    };

    const handleAnswerDeleteClick = (answerId: number) => {
      setAnswerToDelete(answerId);
      setDeleteAnswerDialogOpen(true);
    };

    const handleAnswerDeleteConfirm = () => {
      if (answerToDelete) {
        onAnswerDelete?.(answerToDelete);
        setAnswerToDelete(null);
        setDeleteAnswerDialogOpen(false);
      }
    };

    React.useEffect(() => {
      if (sharedAiContent) {
        setAnswerInput(`> AI 답변:\n> ${sharedAiContent.replace(/\n/g, '\n> ')}\n\n`);
      }
    }, [sharedAiContent]);
    const tags = hashTagNames ? hashTagNames.split(' ').filter(Boolean) : [];
    const hasAnswer = answers.length > 0;
    const acceptedAnswer = answers.find((a) => a.isAccepted);

    const handleAnswerSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!answerInput.trim()) return;
      onAnswerSubmit?.(answerInput.trim());
      setAnswerInput('');
    };

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {/* Question */}
        <Card className="border-0 bg-transparent shadow-none p-2">
          {/* Header - Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {tags.map((tag, idx) => (
                <Badge key={idx} tone="slate" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
            {title}
          </h1>

          {/* Description */}
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap break-all overflow-hidden mb-4">
            <Linkify options={linkifyOptions}>
              {description}
            </Linkify>
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatRelativeTime(createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{viewCount.toLocaleString()} 조회</span>
              </div>
            </div>

            {/* Answer Status Text */}
            <span className={cn(
              'text-sm font-medium',
              hasAnswer ? 'text-green-600' : 'text-coral-500'
            )}>
              {hasAnswer ? `답변 ${answers.length}` : '미답변'}
            </span>
          </div>
        </Card>

        {/* Separator between question and answers */}
        <div className="border-t border-slate-200 -mx-2" />

        {/* Answer Input */}
        {onAnswerSubmit && (
          <Card className="border-0 bg-transparent shadow-none p-2 mb-6">
            <h3 className="text-base font-semibold text-slate-900 mb-2">답변 작성</h3>
            <form onSubmit={handleAnswerSubmit} className="space-y-2">
              {sharedAiContent && (
                <div className="bg-coral-50 border border-coral-100 rounded-lg p-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-coral-600" />
                      <span className="text-xs font-medium text-coral-800">
                        AI 답변 공유
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAnswerInput('');
                        onClearSharedContent?.();
                      }}
                      className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-coral-100 transition-colors"
                      aria-label="공유 취소"
                    >
                      <X className="h-3.5 w-3.5 text-coral-600" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {sharedAiContent}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  {currentUser?.image_url ? (
                    <AvatarImage src={currentUser.image_url} alt={currentUser.name} />
                  ) : null}
                  <AvatarFallback className="bg-slate-200 text-slate-600">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        if (answerInput.trim()) {
                          onAnswerSubmit?.(answerInput.trim());
                          setAnswerInput('');
                        }
                      }
                    }}
                    placeholder="답변을 입력하세요... (Cmd/Ctrl+Enter로 전송)"
                    className="flex-1 min-h-[80px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="solid"
                      size="md"
                      disabled={!answerInput.trim()}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      답변 작성
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* Accepted Answer */}
        {acceptedAnswer && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 pb-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-slate-900">채택된 답변</h3>
            </div>
            <div className="p-2 pb-3 pt-3 border-b border-slate-200">
              <div className="flex items-start gap-2">
                <a
                  href={`/profile/${acceptedAnswer.userProfileId || acceptedAnswer.userId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={acceptedAnswer.userImage}
                      alt={acceptedAnswer.userName}
                    />
                    <AvatarFallback>{acceptedAnswer.userName?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                </a>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <a
                        href={`/profile/${acceptedAnswer.userProfileId || acceptedAnswer.userId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <span className="font-semibold text-slate-900 text-sm">
                          {acceptedAnswer.userName || '알 수 없음'}
                        </span>
                        {acceptedAnswer.userHeadline && (
                          <p className="text-xs text-slate-600">
                            {acceptedAnswer.userHeadline}
                          </p>
                        )}
                      </a>
                    </div>
                    <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                      {formatRelativeTime(acceptedAnswer.createdAt)}
                    </span>
                  </div>

                  {/* AI 공유 내용 렌더링 */}
                  {acceptedAnswer.content?.includes('> AI 답변:') ? (
                    <div className="space-y-2 mb-2">
                      {/* AI 대화 박스 */}
                      <div className="bg-white rounded-xl p-3 border border-slate-200">
                        <div className="space-y-2">
                          {/* 사용자 질문 (있는 경우) */}
                          {acceptedAnswer.content?.includes('> 사용자 질문:') && (
                            <div className="flex items-start gap-2 justify-end">
                              <div className="bg-slate-700 rounded-lg p-2 max-w-[85%]">
                                <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                                  {acceptedAnswer.content.split('\n\n')[0].replace('> 사용자 질문:\n> ', '').replace(/\n> /g, '\n')}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* AI 답변 */}
                          <div className="flex items-start gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-coral-50 flex-shrink-0 mt-0.5">
                              <span className="text-sm font-bold text-coral-600">C</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-coral-800 mb-1">AI 어시스턴트</p>
                              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                  {(() => {
                                    const parts = acceptedAnswer.content.split('\n\n');
                                    const hasQuestion = acceptedAnswer.content?.includes('> 사용자 질문:');
                                    const answerPart = hasQuestion ? parts[1] : parts[0];
                                    return answerPart?.replace('> AI 답변:\n> ', '').replace(/\n> /g, '\n') || '';
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 사용자 코멘트 */}
                      {(() => {
                        const parts = acceptedAnswer.content.split('\n\n');
                        const hasQuestion = acceptedAnswer.content?.includes('> 사용자 질문:');
                        const userComment = hasQuestion ? parts.slice(2).join('\n\n') : parts.slice(1).join('\n\n');
                        return userComment ? (
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            <Linkify options={linkifyOptions}>
                              {userComment}
                            </Linkify>
                          </p>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-all overflow-hidden">
                      <Linkify options={linkifyOptions}>
                        {acceptedAnswer.content}
                      </Linkify>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Answers */}
        {answers.filter((a) => !a.isAccepted).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 px-2 pb-3">
              답변 {answers.filter((a) => !a.isAccepted).length}
            </h3>
            <div className="divide-y divide-slate-200">
              {answers
                .filter((a) => !a.isAccepted)
                .map((answer) => {
                  const isOwnAnswer = currentUser?.id === answer.userId;
                  const isEditing = editingAnswerId === answer.id;

                  return (
                    <div key={answer.id} className="p-2 pb-3 pt-3">
                      <div className="flex items-start gap-2">
                        <a
                          href={`/profile/${answer.userProfileId || answer.userId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:opacity-80 transition-opacity flex-shrink-0"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={answer.userImage} alt={answer.userName} />
                            <AvatarFallback>{answer.userName?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                        </a>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1">
                              <a
                                href={`/profile/${answer.userProfileId || answer.userId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:opacity-80 transition-opacity"
                              >
                                <span className="font-semibold text-slate-900 text-sm">
                                  {answer.userName || '알 수 없음'}
                                </span>
                                {answer.userHeadline && (
                                  <p className="text-xs text-slate-600">
                                    {answer.userHeadline}
                                  </p>
                                )}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              {onAcceptAnswer && (
                                <button
                                  onClick={() => onAcceptAnswer(answer.id)}
                                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-500 transition-colors"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <span className="text-xs text-slate-500">
                                {formatRelativeTime(answer.createdAt)}
                              </span>
                              {/* 본인 답변인 경우 수정/삭제 메뉴 */}
                              {isOwnAnswer && (onAnswerEdit || onAnswerDelete) && !isEditing && (
                                <DropdownMenu modal={false}>
                                  <DropdownMenuTrigger
                                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                                    aria-label="더보기"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="z-[9999]">
                                    {onAnswerEdit && (
                                      <DropdownMenuItem
                                        onClick={() => handleAnswerEditStart(answer)}
                                        className="text-slate-700"
                                      >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        수정하기
                                      </DropdownMenuItem>
                                    )}
                                    {onAnswerEdit && onAnswerDelete && <DropdownMenuSeparator />}
                                    {onAnswerDelete && (
                                      <DropdownMenuItem
                                        onClick={() => handleAnswerDeleteClick(answer.id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        삭제하기
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>

                          {/* 수정 모드 */}
                          {isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingAnswerContent}
                                onChange={(e) => setEditingAnswerContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault();
                                    handleAnswerEditSave();
                                  }
                                }}
                                className="text-sm min-h-[80px] resize-none"
                                autoFocus
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="solid"
                                  onClick={handleAnswerEditSave}
                                  disabled={!editingAnswerContent.trim()}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  저장
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleAnswerEditCancel}
                                >
                                  취소
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* AI 공유 내용 렌더링 */}
                              {answer.content?.includes('> AI 답변:') ? (
                                <div className="space-y-2 mb-2">
                                  {/* AI 대화 박스 */}
                                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                                    <div className="space-y-2">
                                      {/* 사용자 질문 (있는 경우) */}
                                      {answer.content?.includes('> 사용자 질문:') && (
                                        <div className="flex items-start gap-2 justify-end">
                                          <div className="bg-slate-700 rounded-lg p-2 max-w-[85%]">
                                            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                                              {answer.content.split('\n\n')[0].replace('> 사용자 질문:\n> ', '').replace(/\n> /g, '\n')}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {/* AI 답변 */}
                                      <div className="flex items-start gap-2">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-coral-50 flex-shrink-0 mt-0.5">
                                          <span className="text-sm font-bold text-coral-600">C</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-coral-800 mb-1">AI 어시스턴트</p>
                                          <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                              {(() => {
                                                const parts = answer.content.split('\n\n');
                                                const hasQuestion = answer.content?.includes('> 사용자 질문:');
                                                const answerPart = hasQuestion ? parts[1] : parts[0];
                                                return answerPart?.replace('> AI 답변:\n> ', '').replace(/\n> /g, '\n') || '';
                                              })()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 사용자 코멘트 */}
                                  {(() => {
                                    const parts = answer.content.split('\n\n');
                                    const hasQuestion = answer.content?.includes('> 사용자 질문:');
                                    const userComment = hasQuestion ? parts.slice(2).join('\n\n') : parts.slice(1).join('\n\n');
                                    return userComment ? (
                                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        <Linkify options={linkifyOptions}>
                                          {userComment}
                                        </Linkify>
                                      </p>
                                    ) : null;
                                  })()}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-all overflow-hidden">
                                  <Linkify options={linkifyOptions}>
                                    {answer.content}
                                  </Linkify>
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Answer Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteAnswerDialogOpen}
          onClose={() => {
            setDeleteAnswerDialogOpen(false);
            setAnswerToDelete(null);
          }}
          onConfirm={handleAnswerDeleteConfirm}
          title="답변 삭제"
          description="이 답변을 삭제하시겠습니까? 삭제된 답변은 복구할 수 없습니다."
          confirmText="삭제하기"
          variant="danger"
        />
      </div>
    );
  }
);

QnaDetail.displayName = 'QnaDetail';
