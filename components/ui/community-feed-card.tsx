'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import Linkify from 'linkify-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ActionBar } from '@/components/ui/action-bar';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
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
import { Heart, MessageCircle, Share2, Bookmark, Eye, Clock, ChevronDown, MoreVertical, Flag, Ban, Pencil, Trash2 } from 'lucide-react';

const linkifyOptions = {
  className: 'text-coral-500 hover:text-coral-600 underline',
  target: '_blank',
  rel: 'noopener noreferrer',
};

export interface UserProfile {
  id: number;
  name: string;
  image_url?: string;
  headline?: string;
  title?: string;
}

export interface PostStats {
  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
  shareCount?: number;
  viewCount?: number;
}

export interface CommunityFeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  postId: number;
  authorId: number;
  userProfile: UserProfile;
  title?: string;
  content: string;
  contentHtml?: string;
  createdAt: string;
  stats?: PostStats;
  imageUrls?: string[];
  href?: string;
  onClick?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  liked?: boolean;
  bookmarked?: boolean;
  feedType?: string;
  selectedReason?: string;
}

export const CommunityFeedCard = React.forwardRef<HTMLDivElement, CommunityFeedCardProps>(
  (
    {
      postId,
      authorId,
      userProfile,
      title,
      content,
      contentHtml,
      createdAt,
      stats,
      imageUrls = [],
      href,
      onClick,
      onLike,
      onShare,
      onBookmark,
      onEdit,
      onDelete,
      liked = false,
      bookmarked = false,
      feedType,
      selectedReason,
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
    const contentRef = useRef<HTMLDivElement>(null);
    const MAX_HEIGHT = 96; // 약 4줄 높이 (line-height: 1.625 * font-size: 14px * 4줄)

    // Auth & Report/Block hooks
    const { data: currentUser } = useCurrentUser();
    const reportMutation = useReportContent();
    const blockMutation = useBlockUser();

    const isOwnPost = currentUser?.id === authorId;

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
        { contentType: CONTENT_TYPE.POST, contentId: postId },
        {
          onSettled: () => setReportDialogOpen(false),
        }
      );
    };

    const handleBlock = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!currentUser) {
        useStore.getState().openLoginModal();
        return;
      }
      setBlockDialogOpen(true);
    };

    const handleBlockConfirm = () => {
      blockMutation.mutate(authorId, {
        onSettled: () => setBlockDialogOpen(false),
      });
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.();
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
      onDelete?.();
      setDeleteDialogOpen(false);
    };

    // title이 있으면 content에서 title 부분 제거
    const displayContent = React.useMemo(() => {
      if (!title || !content) return content;
      // content가 title로 시작하면 제거
      if (content.startsWith(title)) {
        return content.slice(title.length).replace(/^[\n\s]+/, ''); // 앞쪽 줄바꿈/공백 제거
      }
      return content;
    }, [title, content]);

    // contentHtml에 포함된 이미지 URL 추출
    const htmlImageUrls = React.useMemo(() => {
      if (!contentHtml) return [];
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      const urls: string[] = [];
      let match;
      while ((match = imgRegex.exec(contentHtml)) !== null) {
        urls.push(match[1]);
      }
      return urls;
    }, [contentHtml]);

    // 높이 기반 truncate 체크
    useEffect(() => {
      const el = contentRef.current;
      if (!el) return;

      const checkTruncation = () => {
        setIsTruncated(el.scrollHeight > MAX_HEIGHT);
      };

      // 초기 체크
      checkTruncation();

      // contentHtml에 이미지가 있으면 이미지 로드 후 다시 체크
      if (htmlImageUrls.length > 0) {
        const images = el.querySelectorAll('img');
        let loadedCount = 0;
        const totalImages = images.length;

        if (totalImages > 0) {
          images.forEach((img) => {
            if (img.complete) {
              loadedCount++;
            } else {
              img.addEventListener('load', () => {
                loadedCount++;
                if (loadedCount >= totalImages) {
                  checkTruncation();
                }
              }, { once: true });
              img.addEventListener('error', () => {
                loadedCount++;
                if (loadedCount >= totalImages) {
                  checkTruncation();
                }
              }, { once: true });
            }
          });
          // 모든 이미지가 이미 로드된 경우
          if (loadedCount >= totalImages) {
            checkTruncation();
          }
        }
      }
    }, [displayContent, contentHtml, htmlImageUrls.length]);

    // contentHtml에 없는 이미지만 별도 그리드에 표시
    const standaloneImageUrls = React.useMemo(() => {
      if (htmlImageUrls.length === 0) return imageUrls;
      // URL 비교 시 쿼리스트링 제거하고 path만 비교
      const getPath = (url: string) => {
        try {
          const u = new URL(url);
          return u.pathname;
        } catch {
          return url;
        }
      };
      const htmlPaths = new Set(htmlImageUrls.map(getPath));
      return imageUrls.filter(url => !htmlPaths.has(getPath(url)));
    }, [imageUrls, htmlImageUrls]);

    const actions = [];

    if (onLike) {
      actions.push({
        id: 'like',
        icon: <Heart className={cn('h-5 w-5', liked && 'fill-current text-coral-500')} />,
        label: stats?.likeCount ? `${stats.likeCount}` : '0',
        pressed: liked,
      });
    }

    if (onShare) {
      actions.push({
        id: 'share',
        icon: <Share2 className="h-5 w-5" />,
        label: '공유',
      });
    }

    const handleAction = (actionId: string) => {
      switch (actionId) {
        case 'like':
          onLike?.();
          break;
        case 'share':
          onShare?.();
          break;
      }
    };

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
        {/* Feed Type Badge */}
        {feedType && (
          <div className="mb-3">
            <Badge tone="slate" className="text-xs">
              {feedType}
            </Badge>
          </div>
        )}

        {/* Header - User Profile */}
        <div className="flex items-start justify-between mb-2">
          <Link
            href={`/profile/${userProfile.id}`}
            variant="nav"
            className="flex items-start gap-3 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile.image_url} alt={userProfile.name || '사용자'} />
              <AvatarFallback>{userProfile.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">
                {userProfile.name || '알 수 없는 사용자'}
              </span>
              {userProfile.headline && (
                <p className="text-sm text-slate-600">{userProfile.headline}</p>
              )}
            </div>
          </Link>

          {/* More Menu - Edit/Delete for own posts, Report/Block for others */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              aria-label="더보기"
            >
              <MoreVertical className="h-4 w-4 text-slate-600" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {isOwnPost ? (
                <>
                  <DropdownMenuItem
                    onSelect={(e) => { e.preventDefault(); handleEdit(e as unknown as React.MouseEvent); }}
                    className="text-slate-700"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    수정하기
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => { e.preventDefault(); handleDelete(e as unknown as React.MouseEvent); }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제하기
                  </DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        {title && (
          <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">
            {title}
          </h3>
        )}

        {/* Content */}
        <div className="mb-2">
          <div className="relative">
            <div
              ref={contentRef}
              className={cn(
                'text-slate-900 text-sm leading-relaxed break-words whitespace-pre-wrap',
                contentHtml && 'prose prose-sm max-w-none',
                !isExpanded && 'overflow-hidden'
              )}
              style={!isExpanded ? { maxHeight: MAX_HEIGHT } : undefined}
            >
              {contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              ) : (
                <Linkify options={linkifyOptions}>
                  {displayContent}
                </Linkify>
              )}
            </div>
            {/* Fade effect when truncated */}
            {isTruncated && !isExpanded && (
              <div
                className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"
                aria-hidden="true"
              />
            )}
          </div>

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

        {/* Images - contentHtml에 포함되지 않은 이미지만 별도 표시 */}
        {standaloneImageUrls.length > 0 && (
          <div className={cn(
            'mb-2 rounded-lg overflow-hidden',
            standaloneImageUrls.length === 1 && 'grid grid-cols-1',
            standaloneImageUrls.length === 2 && 'grid grid-cols-2 gap-2',
            standaloneImageUrls.length >= 3 && 'grid grid-cols-2 gap-2'
          )}>
            {standaloneImageUrls.slice(0, 4).map((url, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative aspect-video bg-slate-100',
                  standaloneImageUrls.length === 1 && 'aspect-[16/10]',
                  standaloneImageUrls.length === 3 && idx === 0 && 'col-span-2'
                )}
              >
                <img
                  src={url}
                  alt={`이미지 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 3 && standaloneImageUrls.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{standaloneImageUrls.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Row */}
        {stats && (stats.viewCount !== undefined || stats.likeCount || stats.replyCount) && (
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2 pb-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatRelativeTime(createdAt)}</span>
            </div>
            {stats.viewCount !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{stats.viewCount.toLocaleString()} 조회</span>
              </div>
            )}
            {stats.likeCount !== undefined && stats.likeCount > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                <span>{stats.likeCount.toLocaleString()} 좋아요</span>
              </div>
            )}
            {stats.replyCount !== undefined && stats.replyCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{stats.replyCount.toLocaleString()} 댓글</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div
            className="flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <ActionBar
              actions={actions}
              onAction={handleAction}
              size="sm"
            />
            {onBookmark && (
              <button
                onClick={onBookmark}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="북마크"
              >
                <Bookmark className={cn('h-5 w-5', bookmarked && 'fill-current text-coral-500')} />
              </button>
            )}
          </div>
        )}

        {/* Confirm Dialogs */}
        <ConfirmDialog
          isOpen={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          onConfirm={handleReportConfirm}
          title="게시글 신고"
          description="이 게시글을 신고하시겠습니까? 신고된 게시글은 검토 후 조치됩니다."
          confirmText="신고하기"
          isLoading={reportMutation.isPending}
        />
        <ConfirmDialog
          isOpen={blockDialogOpen}
          onClose={() => setBlockDialogOpen(false)}
          onConfirm={handleBlockConfirm}
          title="사용자 차단"
          description="이 사용자를 차단하시겠습니까? 차단하면 해당 사용자의 게시글이 피드에 표시되지 않습니다."
          confirmText="차단하기"
          variant="danger"
          isLoading={blockMutation.isPending}
        />
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="게시글 삭제"
          description="이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
          confirmText="삭제하기"
          variant="danger"
        />
      </Card>
    );
  }
);

CommunityFeedCard.displayName = 'CommunityFeedCard';
