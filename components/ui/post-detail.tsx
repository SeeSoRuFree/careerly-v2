'use client';

import * as React from 'react';
import Linkify from 'linkify-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ActionBar } from '@/components/ui/action-bar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Clock,
  Send,
  X,
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
import { LikesModal, LikeUser } from '@/components/ui/likes-modal';
import { ImageViewer } from '@/components/ui/image-viewer';
import { formatRelativeTime } from '@/lib/utils/date';
import { useInfinitePostLikers } from '@/lib/api/hooks/queries/usePosts';
import { useInfiniteCommentLikers } from '@/lib/api/hooks/queries/useComments';
import { useRouter } from 'next/navigation';

const linkifyOptions = {
  className: 'text-coral-500 hover:text-coral-600 underline break-all',
  target: '_blank',
  rel: 'noopener noreferrer',
};

export interface Comment {
  id: number;
  userId: number;
  userProfileId?: number;
  userName: string;
  userImage?: string;
  userHeadline?: string;
  content: string;
  createdAt: string;
  likeCount: number;
  liked?: boolean;
}

export interface UserProfile {
  id: number;
  profile_id?: number;
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

export interface PostDetailProps extends React.HTMLAttributes<HTMLDivElement> {
  postId: string;
  authorId?: number;
  userProfile: UserProfile;
  title?: string;
  content: string;
  contentHtml?: string;
  createdAt: string;
  stats?: PostStats;
  imageUrls?: string[];
  comments?: Comment[];
  onLike?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCommentLike?: (commentId: number) => void;
  onCommentSubmit?: (content: string) => void;
  onCommentEdit?: (commentId: number, content: string) => void;
  onCommentDelete?: (commentId: number) => void;
  liked?: boolean;
  bookmarked?: boolean;
  feedType?: string;
  sharedAiContent?: string;
  onClearSharedContent?: () => void;
  currentUser?: {
    id?: number;
    name: string;
    image_url?: string;
  };
}

export const PostDetail = React.forwardRef<HTMLDivElement, PostDetailProps>(
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
      comments = [],
      onLike,
      onShare,
      onBookmark,
      onEdit,
      onDelete,
      onCommentLike,
      onCommentSubmit,
      onCommentEdit,
      onCommentDelete,
      liked = false,
      bookmarked = false,
      feedType,
      sharedAiContent,
      onClearSharedContent,
      currentUser,
      className,
      ...props
    },
    ref
  ) => {
    const [commentInput, setCommentInput] = React.useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [editingCommentId, setEditingCommentId] = React.useState<number | null>(null);
    const [editingCommentContent, setEditingCommentContent] = React.useState('');
    const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = React.useState(false);
    const [commentToDelete, setCommentToDelete] = React.useState<number | null>(null);
    const [likesModalOpen, setLikesModalOpen] = React.useState(false);
    const [commentLikesModalOpen, setCommentLikesModalOpen] = React.useState(false);
    const [selectedCommentId, setSelectedCommentId] = React.useState<number | null>(null);
    const [imageViewerOpen, setImageViewerOpen] = React.useState(false);
    const [imageViewerIndex, setImageViewerIndex] = React.useState(0);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const router = useRouter();

    const numericPostId = typeof postId === 'string' ? parseInt(postId, 10) : postId;

    // Post likers query (only fetch when modal is open)
    const {
      data: likersData,
      isLoading: likersLoading,
      hasNextPage: likersHasNextPage,
      isFetchingNextPage: likersFetchingNextPage,
      fetchNextPage: likersFetchNextPage,
      refetch: refetchLikers,
    } = useInfinitePostLikers(numericPostId, undefined, {
      enabled: likesModalOpen && !isNaN(numericPostId),
    });

    // Comment likers query (only fetch when modal is open)
    const {
      data: commentLikersData,
      isLoading: commentLikersLoading,
      hasNextPage: commentLikersHasNextPage,
      isFetchingNextPage: commentLikersFetchingNextPage,
      fetchNextPage: commentLikersFetchNextPage,
      refetch: refetchCommentLikers,
    } = useInfiniteCommentLikers(selectedCommentId || 0, undefined, {
      enabled: commentLikesModalOpen && selectedCommentId !== null,
    });

    // Refetch when modals open to get fresh data
    React.useEffect(() => {
      if (likesModalOpen) {
        refetchLikers();
      }
    }, [likesModalOpen, refetchLikers]);

    React.useEffect(() => {
      if (commentLikesModalOpen && selectedCommentId) {
        refetchCommentLikers();
      }
    }, [commentLikesModalOpen, selectedCommentId, refetchCommentLikers]);

    // Flatten likers data for modal
    const likers: LikeUser[] = React.useMemo(() => {
      if (!likersData?.pages) return [];
      return likersData.pages.flatMap(page => page.results);
    }, [likersData]);

    const commentLikers: LikeUser[] = React.useMemo(() => {
      if (!commentLikersData?.pages) return [];
      return commentLikersData.pages.flatMap(page => page.results);
    }, [commentLikersData]);

    const handlePostLikesClick = () => {
      setLikesModalOpen(true);
    };

    const handleCommentLikesClick = (commentId: number) => {
      setSelectedCommentId(commentId);
      setCommentLikesModalOpen(true);
    };

    const handleUserClick = (profileId: number) => {
      setLikesModalOpen(false);
      setCommentLikesModalOpen(false);
      router.push(`/profile/${profileId}`);
    };

    const isOwnPost = currentUser?.id !== undefined && (authorId === currentUser.id || userProfile.id === currentUser.id);

    const handleDeleteConfirm = () => {
      onDelete?.();
      setDeleteDialogOpen(false);
    };

    const handleCommentEditStart = (comment: Comment) => {
      setEditingCommentId(comment.id);
      setEditingCommentContent(comment.content);
    };

    const handleCommentEditSave = () => {
      if (editingCommentId && editingCommentContent.trim()) {
        onCommentEdit?.(editingCommentId, editingCommentContent.trim());
        setEditingCommentId(null);
        setEditingCommentContent('');
      }
    };

    const handleCommentEditCancel = () => {
      setEditingCommentId(null);
      setEditingCommentContent('');
    };

    const handleCommentDeleteClick = (commentId: number) => {
      setCommentToDelete(commentId);
      setDeleteCommentDialogOpen(true);
    };

    const handleCommentDeleteConfirm = () => {
      if (commentToDelete) {
        onCommentDelete?.(commentToDelete);
        setCommentToDelete(null);
        setDeleteCommentDialogOpen(false);
      }
    };

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

    // 모든 이미지 URL (HTML 내 이미지 + 별도 이미지)
    const allImageUrls = React.useMemo(() => {
      return [...htmlImageUrls, ...imageUrls];
    }, [htmlImageUrls, imageUrls]);

    const handleImageClick = (index: number) => {
      // imageUrls의 인덱스를 allImageUrls 기준으로 변환
      const actualIndex = htmlImageUrls.length + index;
      setImageViewerIndex(actualIndex);
      setImageViewerOpen(true);
    };

    // contentHtml 내의 이미지 클릭 이벤트 처리 (이벤트 위임 방식)
    const handleContentClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.stopPropagation();
        const img = target as HTMLImageElement;
        const src = img.src;
        const index = allImageUrls.findIndex(url => {
          try {
            return new URL(url, window.location.origin).href === new URL(src, window.location.origin).href;
          } catch {
            return url === src;
          }
        });
        if (index !== -1) {
          setImageViewerIndex(index);
          setImageViewerOpen(true);
        }
      }
    }, [allImageUrls]);

    React.useEffect(() => {
      if (sharedAiContent) {
        setCommentInput(`> AI 답변:\n> ${sharedAiContent.replace(/\n/g, '\n> ')}\n\n`);
      }
    }, [sharedAiContent]);

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

    const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentInput.trim()) return;
      onCommentSubmit?.(commentInput.trim());
      setCommentInput('');
    };

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {/* Main Post */}
        <Card className="border-0 bg-transparent shadow-none p-2">
          {/* Feed Type Badge */}
          {feedType && feedType !== 'RECOMMENDED.INTERESTS' && (
            <div className="mb-2">
              <Badge tone="slate" className="text-xs">
                {feedType}
              </Badge>
            </div>
          )}

          {/* Author Profile */}
          <div className="flex items-start justify-between mb-4">
            <a
              href={`/profile/${userProfile.profile_id || userProfile.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10">
                {userProfile.image_url && (
                  <AvatarImage src={userProfile.image_url} alt={userProfile.name} />
                )}
                <AvatarFallback className="text-sm font-medium">
                  {userProfile.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{userProfile.name}</p>
                {(userProfile.headline || userProfile.title) && (
                  <p className="text-sm text-slate-500 truncate">
                    {userProfile.headline || userProfile.title}
                  </p>
                )}
              </div>
            </a>

            {/* Edit/Delete Menu for own posts */}
            {isOwnPost && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="더보기"
                >
                  <MoreVertical className="h-4 w-4 text-slate-600" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit} className="text-slate-700">
                      <Pencil className="h-4 w-4 mr-2" />
                      수정하기
                    </DropdownMenuItem>
                  )}
                  {onEdit && onDelete && <DropdownMenuSeparator />}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제하기
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Title */}
          {title && (
            <h1 className="text-xl font-bold text-slate-900 mb-3">
              {title}
            </h1>
          )}

          {/* Content */}
          <div className="mb-3">
            {contentHtml ? (
              <div
                ref={contentRef}
                className="text-slate-900 leading-relaxed prose prose-base max-w-none prose-p:whitespace-pre-wrap prose-p:my-0 [&_img]:cursor-pointer [&_img]:hover:opacity-90 [&_img]:transition-opacity"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
                onClick={handleContentClick}
              />
            ) : (
              <p className="text-slate-900 leading-relaxed whitespace-pre-wrap break-all overflow-hidden">
                <Linkify options={linkifyOptions}>
                  {content}
                </Linkify>
              </p>
            )}
          </div>

          {/* Images */}
          {imageUrls.length > 0 && (
            <div
              className={cn(
                'mb-3 rounded-lg overflow-hidden',
                imageUrls.length === 1 && 'grid grid-cols-1',
                imageUrls.length === 2 && 'grid grid-cols-2 gap-2',
                imageUrls.length >= 3 && 'grid grid-cols-2 gap-2'
              )}
            >
              {imageUrls.slice(0, 4).map((url, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'relative aspect-video bg-slate-100 cursor-pointer',
                    imageUrls.length === 1 && 'aspect-[16/10]',
                    imageUrls.length === 3 && idx === 0 && 'col-span-2'
                  )}
                  onClick={() => handleImageClick(idx)}
                >
                  <img
                    src={url}
                    alt={`이미지 ${idx + 1}`}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                  {idx === 3 && imageUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                      <span className="text-white font-semibold text-lg">
                        +{imageUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats Row */}
          {stats && (stats.viewCount || stats.likeCount || stats.replyCount) && (
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
                <button
                  onClick={handlePostLikesClick}
                  className="flex items-center gap-1 hover:text-coral-500 transition-colors"
                >
                  <Heart className="h-3.5 w-3.5" />
                  <span>{stats.likeCount.toLocaleString()} 좋아요</span>
                </button>
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
            <div className="flex items-center justify-between">
              <ActionBar actions={actions} onAction={handleAction} size="sm" />
              {onBookmark && (
                <button
                  onClick={onBookmark}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="북마크"
                >
                  <Bookmark
                    className={cn('h-5 w-5', bookmarked && 'fill-current text-coral-500')}
                  />
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Separator between post and comments */}
        <div className="border-t border-slate-200 -mx-2" />

        {/* Comment Input */}
        {onCommentSubmit && (
          <Card className="border-0 bg-transparent shadow-none p-2 mb-6">
            <form onSubmit={handleCommentSubmit} className="space-y-2">
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
                        setCommentInput('');
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
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        if (commentInput.trim()) {
                          onCommentSubmit?.(commentInput.trim());
                          setCommentInput('');
                        }
                      }
                    }}
                    placeholder="댓글을 입력하세요... (Cmd/Ctrl+Enter로 전송)"
                    className="flex-1 min-h-[80px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="solid"
                      size="md"
                      disabled={!commentInput.trim()}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      댓글 작성
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 px-2 pb-3">
              댓글 {comments.length}
            </h3>
            <div className="divide-y divide-slate-200">
              {comments.map((comment) => {
                const isOwnComment = currentUser?.id === comment.userId;
                const isEditing = editingCommentId === comment.id;

                return (
                  <div key={comment.id} className="p-2 pb-3 pt-3">
                    <div className="flex items-start gap-2">
                      <a
                        href={`/profile/${comment.userProfileId || comment.userId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:opacity-80 transition-opacity flex-shrink-0"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.userImage} alt={comment.userName} />
                          <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </a>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <a
                              href={`/profile/${comment.userProfileId || comment.userId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:opacity-80 transition-opacity"
                            >
                              <span className="font-semibold text-slate-900 text-sm">
                                {comment.userName}
                              </span>
                              {comment.userHeadline && (
                                <p className="text-xs text-slate-600">{comment.userHeadline}</p>
                              )}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <button
                              onClick={() => onCommentLike?.(comment.id)}
                              className={cn(
                                'flex items-center text-xs transition-colors',
                                comment.liked
                                  ? 'text-coral-500'
                                  : 'text-slate-400 hover:text-coral-500'
                              )}
                            >
                              <Heart
                                className={cn(
                                  'h-3.5 w-3.5',
                                  comment.liked && 'fill-current'
                                )}
                              />
                            </button>
                            {comment.likeCount > 0 && (
                              <button
                                onClick={() => handleCommentLikesClick(comment.id)}
                                className="text-xs text-slate-400 hover:text-coral-500 transition-colors"
                              >
                                {comment.likeCount}
                              </button>
                            )}
                            <span className="text-xs text-slate-500">{comment.createdAt}</span>
                            {/* 본인 댓글인 경우 수정/삭제 메뉴 */}
                            {isOwnComment && (onCommentEdit || onCommentDelete) && !isEditing && (
                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger
                                  className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                                  aria-label="더보기"
                                >
                                  <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="z-[9999]">
                                  {onCommentEdit && (
                                    <DropdownMenuItem
                                      onClick={() => handleCommentEditStart(comment)}
                                      className="text-slate-700"
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      수정하기
                                    </DropdownMenuItem>
                                  )}
                                  {onCommentEdit && onCommentDelete && <DropdownMenuSeparator />}
                                  {onCommentDelete && (
                                    <DropdownMenuItem
                                      onClick={() => handleCommentDeleteClick(comment.id)}
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
                              value={editingCommentContent}
                              onChange={(e) => setEditingCommentContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                  e.preventDefault();
                                  handleCommentEditSave();
                                }
                              }}
                              className="text-sm min-h-[80px] resize-none"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="solid"
                                onClick={handleCommentEditSave}
                                disabled={!editingCommentContent.trim()}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                저장
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCommentEditCancel}
                              >
                                취소
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* AI 공유 내용 렌더링 */}
                            {comment.content.includes('> AI 답변:') ? (
                              <div className="space-y-2 mb-2">
                                {/* AI 대화 박스 */}
                                <div className="bg-white rounded-xl p-3 border border-slate-200">
                                  <div className="space-y-2">
                                    {/* 사용자 질문 (있는 경우) */}
                                    {comment.content.includes('> 사용자 질문:') && (
                                      <div className="flex items-start gap-2 justify-end">
                                        <div className="bg-slate-700 rounded-lg p-2 max-w-[85%]">
                                          <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                                            {comment.content.split('\n\n')[0].replace('> 사용자 질문:\n> ', '').replace(/\n> /g, '\n')}
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
                                              const parts = comment.content.split('\n\n');
                                              const hasQuestion = comment.content.includes('> 사용자 질문:');
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
                                  const parts = comment.content.split('\n\n');
                                  const hasQuestion = comment.content.includes('> 사용자 질문:');
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
                                  {comment.content}
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="게시글 삭제"
          description="이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
          confirmText="삭제하기"
          variant="danger"
        />

        {/* Comment Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteCommentDialogOpen}
          onClose={() => {
            setDeleteCommentDialogOpen(false);
            setCommentToDelete(null);
          }}
          onConfirm={handleCommentDeleteConfirm}
          title="댓글 삭제"
          description="이 댓글을 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다."
          confirmText="삭제하기"
          variant="danger"
        />

        {/* Post Likes Modal */}
        <LikesModal
          isOpen={likesModalOpen}
          onClose={() => setLikesModalOpen(false)}
          users={likers}
          isLoading={likersLoading}
          onUserClick={handleUserClick}
          hasNextPage={likersHasNextPage}
          isFetchingNextPage={likersFetchingNextPage}
          fetchNextPage={likersFetchNextPage}
          totalCount={likersData?.pages?.[0]?.count}
        />

        {/* Comment Likes Modal */}
        <LikesModal
          isOpen={commentLikesModalOpen}
          onClose={() => {
            setCommentLikesModalOpen(false);
            setSelectedCommentId(null);
          }}
          users={commentLikers}
          isLoading={commentLikersLoading}
          onUserClick={handleUserClick}
          hasNextPage={commentLikersHasNextPage}
          isFetchingNextPage={commentLikersFetchingNextPage}
          fetchNextPage={commentLikersFetchNextPage}
          totalCount={commentLikersData?.pages?.[0]?.count}
        />

        {/* Image Viewer */}
        <ImageViewer
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          images={allImageUrls}
          initialIndex={imageViewerIndex}
        />
      </div>
    );
  }
);

PostDetail.displayName = 'PostDetail';
