'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import {
  useComments,
  useCreateComment,
  useCurrentUser,
  useDeleteComment,
} from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface CommentSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  postId?: number;
  hasSharedPost?: boolean;
}

const CommentSection = React.forwardRef<HTMLDivElement, CommentSectionProps>(
  ({ postId, hasSharedPost = false, className, ...props }, ref) => {
    const router = useRouter();
    const { data: currentUser } = useCurrentUser();
    const [commentText, setCommentText] = React.useState('');

    // 댓글 목록 조회
    const { data: commentsData, isLoading } = useComments(
      { postId },
      { enabled: !!postId && hasSharedPost }
    );

    // 댓글 작성 mutation
    const createCommentMutation = useCreateComment();
    const deleteCommentMutation = useDeleteComment();

    const handleSubmitComment = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!currentUser) {
        toast.error('로그인이 필요합니다');
        router.push('/login');
        return;
      }

      if (!postId || !hasSharedPost) {
        toast.error('댓글을 작성할 수 없습니다');
        return;
      }

      if (!commentText.trim()) {
        toast.error('댓글 내용을 입력해주세요');
        return;
      }

      try {
        await createCommentMutation.mutateAsync({
          post_id: postId,
          content: commentText.trim(),
        });
        setCommentText('');
      } catch (error) {
        // 에러는 전역 핸들러에서 처리됨
        console.error('댓글 작성 실패:', error);
      }
    };

    const handleDeleteComment = async (commentId: number) => {
      if (!postId) return;

      if (window.confirm('댓글을 삭제하시겠습니까?')) {
        try {
          await deleteCommentMutation.mutateAsync({ id: commentId, postId });
        } catch (error) {
          console.error('댓글 삭제 실패:', error);
        }
      }
    };

    if (!hasSharedPost) {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-white rounded-xl border border-slate-200 p-6 text-center',
            className
          )}
          {...props}
        >
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">
            커뮤니티에 공유된 게시물만 댓글을 작성할 수 있습니다
          </p>
        </div>
      );
    }

    const comments = commentsData?.results || [];

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl border border-slate-200 shadow-sm',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-slate-600" />
            댓글 {comments.length}
          </h3>
        </div>

        {/* Comment Form */}
        {currentUser && (
          <form onSubmit={handleSubmitComment} className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0">
                {currentUser.image_url && (
                  <AvatarImage src={currentUser.image_url} alt={currentUser.name} />
                )}
                <AvatarFallback>
                  {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="min-h-[80px] resize-none"
                  disabled={createCommentMutation.isPending}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!commentText.trim() || createCommentMutation.isPending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {createCommentMutation.isPending ? '작성 중...' : '댓글 작성'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comment List */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="px-6 py-8 text-center text-slate-500">
              댓글을 불러오는 중...
            </div>
          ) : comments.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              첫 댓글을 작성해보세요
            </div>
          ) : (
            comments.map((comment) => {
              const isMyComment = currentUser && comment.user_id === currentUser.id;
              const authorName = comment.author_name || '알 수 없음';
              const authorImageUrl = comment.author_image_url;
              const authorHeadline = comment.author_headline;

              return (
                <div key={comment.id} className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      {authorImageUrl && (
                        <AvatarImage
                          src={authorImageUrl}
                          alt={authorName}
                        />
                      )}
                      <AvatarFallback>
                        {authorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-slate-900">
                          {authorName}
                        </span>
                        {authorHeadline && (
                          <span className="text-xs text-slate-500">
                            {authorHeadline}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                      {isMyComment && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deleteCommentMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                          >
                            삭제
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
);

CommentSection.displayName = 'CommentSection';

export { CommentSection };
