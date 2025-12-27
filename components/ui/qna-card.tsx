'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import Linkify from 'linkify-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useReportContent, useBlockUser, useCurrentUser, CONTENT_TYPE } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import { MessageCircle, Eye, Clock, ChevronDown, MoreVertical, Flag, Ban, Pencil, Trash2 } from 'lucide-react';

const linkifyOptions = {
  className: 'text-coral-500 hover:text-coral-600 underline break-all',
  target: '_blank',
  rel: 'noopener noreferrer',
};

export interface QnaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  qnaId: number;
  title: string;
  description: string;
  author?: {
    id: number;
    profile_id?: number;
    name: string;
    email: string;
    image_url: string | null;
    headline: string | null;
  } | null;
  createdAt: string;
  updatedAt?: string;
  hashTagNames?: string;
  answerCount: number;
  commentCount?: number;
  viewCount: number;
  status?: number;
  isPublic?: number;
  href?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const QnaCard = React.forwardRef<HTMLDivElement, QnaCardProps>(
  (
    {
      qnaId,
      title,
      description,
      author,
      createdAt,
      updatedAt,
      hashTagNames,
      answerCount,
      commentCount = 0,
      viewCount,
      status = 0,
      isPublic = 1,
      href,
      onClick,
      onEdit,
      onDelete,
      className,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const contentRef = useRef<HTMLParagraphElement>(null);
    const MAX_HEIGHT = 96; // 약 4줄 높이 (line-height: 1.625 * font-size: 14px * 4줄)

    // Auth & Report/Block hooks
    const { data: currentUser } = useCurrentUser();
    const reportMutation = useReportContent();
    const blockMutation = useBlockUser();

    const isOwnQuestion = author && currentUser?.id === author.id;

    const handleReport = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!currentUser) {
        useStore.getState().openLoginModal();
        return;
      }
      setReportDialogOpen(true);
    };

    const handleReportConfirm = () => {
      reportMutation.mutate(
        { contentType: CONTENT_TYPE.QUESTION, contentId: qnaId },
        {
          onSettled: () => setReportDialogOpen(false),
        }
      );
    };

    const handleBlock = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!currentUser || !author) {
        useStore.getState().openLoginModal();
        return;
      }
      setBlockDialogOpen(true);
    };

    const handleBlockConfirm = () => {
      if (!author) return;
      blockMutation.mutate(author.id, {
        onSettled: () => setBlockDialogOpen(false),
      });
    };

    // 높이 기반 truncate 체크
    useEffect(() => {
      const el = contentRef.current;
      if (el) {
        setIsTruncated(el.scrollHeight > MAX_HEIGHT);
      }
    }, [description]);

    const tags = hashTagNames ? hashTagNames.split(' ').filter(Boolean) : [];
    const hasAnswer = answerCount > 0;

    return (
      <Card
        ref={ref}
        onClick={onClick}
        className={cn(
          'p-6 transition-all duration-200',
          onClick && 'cursor-pointer hover:shadow-md hover:border-coral-200',
          className
        )}
        {...props}
      >
        {/* Author Profile with Status Badges */}
        <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="flex items-center justify-between">
            {author ? (
              <Link
                href={`/profile/${author.profile_id || author.id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity no-underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={author.image_url || ''} alt={author.name} />
                  <AvatarFallback>{author.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{author.name}</span>
                  {author.headline && (
                    <span className="text-xs text-slate-500">{author.headline}</span>
                  )}
                </div>
              </Link>
            ) : (
              <div />
            )}

            {/* More Menu - Mobile: next to profile */}
            <div className="sm:hidden">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="더보기"
                >
                  <MoreVertical className="h-4 w-4 text-slate-600" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {isOwnQuestion ? (
                    <>
                      {onEdit && (
                        <DropdownMenuItem
                          onSelect={(e) => { e.preventDefault(); onEdit(); }}
                          className="text-slate-700"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          수정하기
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={(e) => { e.preventDefault(); setDeleteDialogOpen(true); }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제하기
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onSelect={(e) => { e.preventDefault(); handleReport(e as unknown as React.MouseEvent); }}
                        className="text-slate-700"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        신고하기
                      </DropdownMenuItem>
                      {author && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={(e) => { e.preventDefault(); handleBlock(e as unknown as React.MouseEvent); }}
                            className="text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            이 사용자 차단하기
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* More Menu - Desktop only */}
          <div className="flex items-center justify-end gap-2">
            {/* More Menu - Desktop only */}
            <div className="hidden sm:block">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="더보기"
                >
                  <MoreVertical className="h-4 w-4 text-slate-600" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {isOwnQuestion ? (
                    <>
                      {onEdit && (
                        <DropdownMenuItem
                          onSelect={(e) => { e.preventDefault(); onEdit(); }}
                          className="text-slate-700"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          수정하기
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={(e) => { e.preventDefault(); setDeleteDialogOpen(true); }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제하기
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onSelect={(e) => { e.preventDefault(); handleReport(e as unknown as React.MouseEvent); }}
                        className="text-slate-700"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        신고하기
                      </DropdownMenuItem>
                      {author && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={(e) => { e.preventDefault(); handleBlock(e as unknown as React.MouseEvent); }}
                            className="text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            이 사용자 차단하기
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Hashtags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} tone="slate" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">
          {title}
        </h3>

        {/* Description */}
        <div className="mb-2">
          <p
            ref={contentRef}
            className={cn(
              'text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-all overflow-hidden'
            )}
            style={!isExpanded ? { maxHeight: MAX_HEIGHT } : undefined}
          >
            <Linkify options={linkifyOptions}>
              {description}
            </Linkify>
          </p>

          {/* More/Less Button */}
          {isTruncated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="inline-flex items-center gap-1 text-coral-500 hover:text-coral-600 transition-colors text-sm font-medium mt-2 group"
              aria-label={isExpanded ? '접기' : '더보기'}
            >
              {isExpanded ? (
                <>
                  <span>접기</span>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform rotate-180" />
                </>
              ) : (
                <>
                  <span>더보기</span>
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-[2px] transition-transform" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{viewCount.toLocaleString()} 조회</span>
            </div>
            {commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{commentCount} 댓글</span>
              </div>
            )}
          </div>

          {/* Answer Status Text */}
          <span className={cn(
            'text-xs font-medium',
            hasAnswer ? 'text-green-600' : 'text-coral-500'
          )}>
            {hasAnswer ? `답변 ${answerCount}` : '미답변'}
          </span>
        </div>

        {/* Confirm Dialogs */}
        <ConfirmDialog
          isOpen={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          onConfirm={handleReportConfirm}
          title="질문 신고"
          description="이 질문을 신고하시겠습니까? 신고된 질문은 검토 후 조치됩니다."
          confirmText="신고하기"
          isLoading={reportMutation.isPending}
        />
        <ConfirmDialog
          isOpen={blockDialogOpen}
          onClose={() => setBlockDialogOpen(false)}
          onConfirm={handleBlockConfirm}
          title="사용자 차단"
          description="이 사용자를 차단하시겠습니까? 차단하면 해당 사용자의 질문이 피드에 표시되지 않습니다."
          confirmText="차단하기"
          variant="danger"
          isLoading={blockMutation.isPending}
        />
        {onDelete && (
          <ConfirmDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={() => {
              onDelete();
              setDeleteDialogOpen(false);
            }}
            title="질문 삭제"
            description="이 질문을 삭제하시겠습니까? 삭제된 질문은 복구할 수 없습니다."
            confirmText="삭제하기"
            variant="danger"
          />
        )}
      </Card>
    );
  }
);

QnaCard.displayName = 'QnaCard';
