'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/date';

export interface Comment {
  id: number;
  userId: number;
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
  userProfile: UserProfile;
  content: string;
  contentHtml?: string;
  createdAt: string;
  stats?: PostStats;
  imageUrls?: string[];
  comments?: Comment[];
  onLike?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onCommentLike?: (commentId: number) => void;
  onCommentSubmit?: (content: string) => void;
  liked?: boolean;
  bookmarked?: boolean;
  feedType?: string;
  sharedAiContent?: string;
  onClearSharedContent?: () => void;
  currentUser?: {
    name: string;
    image_url?: string;
  };
}

export const PostDetail = React.forwardRef<HTMLDivElement, PostDetailProps>(
  (
    {
      postId,
      userProfile,
      content,
      contentHtml,
      createdAt,
      stats,
      imageUrls = [],
      comments = [],
      onLike,
      onShare,
      onBookmark,
      onCommentLike,
      onCommentSubmit,
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
          <a
            href={`/profile/${userProfile.id}`}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
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

          {/* Content */}
          <div className="mb-3">
            {contentHtml ? (
              <div
                className="text-slate-900 leading-relaxed prose prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : (
              <p className="text-slate-900 leading-relaxed whitespace-pre-wrap">
                {content}
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
                    'relative aspect-video bg-slate-100',
                    imageUrls.length === 1 && 'aspect-[16/10]',
                    imageUrls.length === 3 && idx === 0 && 'col-span-2'
                  )}
                >
                  <img
                    src={url}
                    alt={`이미지 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 3 && imageUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
                <div className="flex-1 flex gap-2">
                  <Input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    variant="solid"
                    size="md"
                    disabled={!commentInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
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
              {comments.map((comment) => (
                <div key={comment.id} className="p-2 pb-3 pt-3">
                <div className="flex items-start gap-2">
                  <a
                    href={`/profile/${comment.userId}`}
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
                          href={`/profile/${comment.userId}`}
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
                      <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                        <button
                          onClick={() => onCommentLike?.(comment.id)}
                          className={cn(
                            'flex items-center gap-1 text-xs transition-colors',
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
                          {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                        </button>
                        <span className="text-xs text-slate-500">{comment.createdAt}</span>
                      </div>
                    </div>

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
                              {userComment}
                            </p>
                          ) : null;
                        })()}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

PostDetail.displayName = 'PostDetail';
