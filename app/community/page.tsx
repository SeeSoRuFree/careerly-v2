'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
import { CommunityFeedCard } from '@/components/ui/community-feed-card';
import { AIChatPostCard } from '@/components/ui/ai-chat-post-card';
import { QnaCard } from '@/components/ui/qna-card';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { RecommendedFollowersPanel } from '@/components/ui/recommended-followers-panel';
import { TopPostsPanel } from '@/components/ui/top-posts-panel';
import { TopPostsFeedCard } from '@/components/ui/top-posts-feed-card';
import { RecommendedFollowersFeedCard } from '@/components/ui/recommended-followers-feed-card';
import { CompanyUpdateFeedCard, MOCK_COMPANY_CONTENTS } from '@/components/ui/company-update-feed-card';
import { RecommendedUserPairContainer, type RecentPost, type ProfileInfo } from '@/components/ui/recommended-user-card';
import { LoadMore } from '@/components/ui/load-more';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, MessageCircle, Users, X, ExternalLink, Loader2, PenSquare, HelpCircle, Heart, Link as LinkIcon, ArrowRight, Bot, Clock, Eye, MoreVertical, Pencil, Trash2, EyeOff } from 'lucide-react';
import { AdBanner } from '@/components/ui/ad-banner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import { useInfinitePosts, useInfiniteRecommendedPosts, useInfiniteQuestions, useFollowingPosts, usePosts, useLikePost, useUnlikePost, useSavePost, useUnsavePost, useLikeQuestion, useUnlikeQuestion, useRecommendedFollowers, useCurrentUser, useFollowUser, useUnfollowUser, usePost, useComments, useCreateComment, useViewPost, useLikeComment, useUnlikeComment, useQuestion, useQuestionAnswers, useDeletePost, useDeleteQuestion, useUpdateComment, useDeleteComment, useUpdateAnswer, useDeleteAnswer, useCreateQuestionAnswer, useProfileByUserId, useMyProfileDetail } from '@/lib/api';
import { toast } from 'sonner';
import { QnaDetail } from '@/components/ui/qna-detail';
import { PostDetail } from '@/components/ui/post-detail';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { SidebarFooter } from '@/components/layout/SidebarFooter';
import type { QuestionListItem, PaginatedPostResponse, PaginatedQuestionResponse } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import { useImpressionTracker } from '@/lib/hooks/useImpressionTracker';
import { trackPostDetailView, trackQuestionDetailView, trackContentShare } from '@/lib/analytics';

// 프롬프트에서 질문과 프로필 분리
function parsePrompt(text: string): { question: string; profile: string | null } {
  const separator = '\n---\n';
  const separatorIndex = text.indexOf(separator);

  if (separatorIndex === -1) {
    return { question: text, profile: null };
  }

  const question = text.substring(0, separatorIndex).trim();
  const profileSection = text.substring(separatorIndex + separator.length).trim();
  const profile = profileSection.replace(/^내정보:\s*/i, '').trim();

  return { question, profile };
}

type UserProfile = {
  id: number;
  profile_id?: number;
  name: string;
  image_url: string;
  headline: string;
  description: string;
  small_image_url: string;
};

type CompanyContentData = {
  type: 'blog' | 'jobs';
  company: { name: string; logoUrl: string; siteUrl: string };
  item: { title: string; url: string; summary: string; aiAnalysis: string };
};

type SelectedContent = {
  type: 'post' | 'qna' | 'company';
  id: string;
  userProfile?: UserProfile;
  questionData?: QuestionListItem;
  companyData?: CompanyContentData;
};

// Post 상세 Drawer 컨텐츠 컴포넌트
function PostDetailDrawerContent({
  postId,
  isLiked,
  isSaved,
  onLike,
  onBookmark,
  onEdit,
  onDelete,
}: {
  postId: string;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { data: post, isLoading, error } = usePost(Number(postId));
  const { data: user } = useCurrentUser();
  const { data: commentsData } = useComments({ postId: Number(postId) });
  const { openLoginModal } = useStore();
  const router = useRouter();

  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const viewPost = useViewPost();
  const likeComment = useLikeComment();
  const unlikeComment = useUnlikeComment();

  const [commentLikes, setCommentLikes] = React.useState<Record<number, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // 조회수 증가
  React.useEffect(() => {
    if (postId && !isLoading && !error) {
      viewPost.mutate(Number(postId));
    }
  }, [postId]);

  // 댓글 좋아요 상태 초기화
  React.useEffect(() => {
    if (commentsData?.results) {
      const initialLikes: Record<number, boolean> = {};
      commentsData.results.forEach(comment => {
        initialLikes[comment.id] = comment.is_liked || false;
      });
      setCommentLikes(initialLikes);
    }
  }, [commentsData]);

  const transformedComments = React.useMemo(() => {
    if (!commentsData?.results) return [];
    return commentsData.results.map((comment) => ({
      id: comment.id,
      userId: comment.user_id,
      userProfileId: comment.author_profile_id,
      userName: comment.author_name,
      userImage: comment.author_image_url,
      userHeadline: comment.author_headline,
      content: comment.content,
      createdAt: formatRelativeTime(comment.createdat),
      likeCount: comment.like_count || 0,
      liked: commentLikes[comment.id] ?? comment.is_liked ?? false,
    }));
  }, [commentsData, commentLikes]);

  const handleCommentSubmit = async (content: string) => {
    if (!user) {
      openLoginModal();
      return;
    }
    try {
      await createComment.mutateAsync({
        post_id: Number(postId),
        content,
      });
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleCommentLike = (commentId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }
    const isCurrentlyLiked = commentLikes[commentId] || false;
    setCommentLikes(prev => ({ ...prev, [commentId]: !isCurrentlyLiked }));

    if (isCurrentlyLiked) {
      unlikeComment.mutate(commentId, {
        onError: () => setCommentLikes(prev => ({ ...prev, [commentId]: true })),
      });
    } else {
      likeComment.mutate(commentId, {
        onError: () => setCommentLikes(prev => ({ ...prev, [commentId]: false })),
      });
    }
  };

  const handleCommentEdit = (commentId: number, content: string) => {
    updateComment.mutate({
      id: commentId,
      data: { content },
    });
  };

  const handleCommentDelete = (commentId: number) => {
    deleteComment.mutate({
      id: commentId,
      postId: Number(postId),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600">게시글을 불러올 수 없습니다.</p>
      </div>
    );
  }

  // AI 포스트 (posttype=10)인 경우 간소화된 UI 렌더링
  if (post.posttype === 10) {
    const shareUrl = post.chat_session_id
      ? `/share/${post.chat_session_id}`
      : `/community/post/${postId}`;

    const isOwnPost = user && post.author && post.author.id === user.id;

    // 질문 텍스트 파싱 (프로필 정보 제거)
    const { question: parsedQuestion } = parsePrompt(post.title || '');

    const handleDeleteConfirm = () => {
      onDelete();
      setDeleteDialogOpen(false);
    };

    return (
      <div className="p-6 space-y-4">
        {/* AI Agent Profile + Author */}
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 bg-gradient-to-br from-teal-400 to-teal-600">
              <AvatarFallback className="bg-transparent">
                <Bot className="h-6 w-6 text-white" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900">커리어리 AI 에이전트</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                AI
              </span>
            </div>
            {/* Author Info - by. 작성자 */}
            {post.author && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm text-slate-500">by.</span>
                <button
                  onClick={() => router.push(`/profile/${post.author?.profile_id || post.author?.id}`)}
                  className="text-sm text-slate-600 hover:text-teal-600 transition-colors font-medium"
                >
                  {post.author.name}
                </button>
              </div>
            )}
          </div>

          {/* Delete Menu for own posts */}
          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                aria-label="더보기"
              >
                <MoreVertical className="h-4 w-4 text-slate-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-2">
            Q. {parsedQuestion || '제목 없음'}
          </h3>

          {/* Answer Preview with Fade Out */}
          <div className="relative">
            <div className="text-slate-700 text-sm leading-relaxed line-clamp-6">
              {post.description}
            </div>
            {/* Fade out gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </div>

        {/* URL Preview Card - Kakao/Slack style */}
        <button
          onClick={() => router.push(shareUrl)}
          className="block w-full text-left"
        >
          <div className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors bg-white">
            {/* URL Display */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <LinkIcon className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500">share.careerly.co.kr</span>
            </div>

            {/* OG Card Content */}
            <div className="p-4">
              <div className="text-xs text-slate-500 mb-1">커리어리 AI 검색</div>
              <div className="font-medium text-slate-900 mb-1 line-clamp-1">{parsedQuestion || '제목 없음'}</div>
              <div className="text-sm text-slate-600 line-clamp-2">
                커리어리 AI 에이전트가 답변한 내용입니다
              </div>
            </div>

            {/* Continue Reading CTA */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-2 text-teal-600 font-medium">
              계속 읽기
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </button>

        {/* Stats Row - 일반 카드와 동일한 스타일 */}
        <div className="flex items-center gap-3 text-xs text-slate-500 pb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatRelativeTime(post.createdat)}</span>
          </div>
          {(post.view_count || 0) > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{(post.view_count || 0).toLocaleString()} 조회</span>
            </div>
          )}
          {(post.like_count || 0) > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              <span>{(post.like_count || 0).toLocaleString()} 좋아요</span>
            </div>
          )}
          {(commentsData?.count || post.comment_count || 0) > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{(commentsData?.count || post.comment_count || 0).toLocaleString()} 댓글</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center pt-2 border-t border-slate-200">
          <button
            onClick={onLike}
            className={cn(
              'text-slate-500 hover:text-teal-600 transition-colors',
              isLiked && 'text-teal-600'
            )}
          >
            <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
          </button>
        </div>

        {/* Separator */}
        <div className="border-t border-slate-200 -mx-6" />

        {/* Comment Section for AI Post */}
        <div className="space-y-4">
          {/* Comment Input */}
          {user && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('comment') as HTMLInputElement);
              if (input.value.trim()) {
                handleCommentSubmit(input.value.trim());
                input.value = '';
              }
            }} className="flex gap-2">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user.image_url} alt={user.name} />
                <AvatarFallback className="bg-slate-200 text-slate-600">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <input
                  name="comment"
                  placeholder="댓글을 입력하세요..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          {transformedComments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-slate-900">
                댓글 {transformedComments.length}
              </h4>
              <div className="divide-y divide-slate-200">
                {transformedComments.map((comment) => {
                  const isOwnComment = user && user.id === comment.userId;

                  return (
                    <div key={comment.id} className="py-3 first:pt-0">
                      <div className="flex items-start gap-2">
                        <a
                          href={`/profile/${comment.userProfileId || comment.userId}`}
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
                                onClick={() => handleCommentLike(comment.id)}
                                className={cn(
                                  'flex items-center gap-1 text-xs transition-colors',
                                  comment.liked
                                    ? 'text-teal-600'
                                    : 'text-slate-400 hover:text-teal-600'
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
                              {/* 본인 댓글인 경우 수정/삭제 메뉴 */}
                              {isOwnComment && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                                    aria-label="더보기"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleCommentEdit(comment.id, comment.content)}
                                      className="text-slate-700"
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      수정하기
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleCommentDelete(comment.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      삭제하기
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="게시글 삭제"
          description="이 AI 포스트를 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
          confirmText="삭제하기"
          variant="danger"
        />
      </div>
    );
  }

  // 일반 포스트 렌더링
  const userProfile = post.author
    ? {
        id: post.author.id,
        profile_id: post.author.profile_id,
        name: post.author.name,
        image_url: post.author.image_url,
        headline: post.author.headline,
        title: post.author.headline,
      }
    : {
        id: post.userid,
        profile_id: undefined,
        name: '알 수 없는 사용자',
        image_url: undefined,
        headline: '탈퇴한 사용자',
        title: '탈퇴한 사용자',
      };

  return (
    <div className="p-4">
      <PostDetail
        postId={postId}
        authorId={post.author?.id || post.userid}
        userProfile={userProfile}
        title={post.title || undefined}
        content={post.description}
        contentHtml={post.descriptionhtml}
        createdAt={post.createdat}
        stats={{
          likeCount: post.like_count || 0,
          replyCount: commentsData?.count || post.comment_count || 0,
          viewCount: post.view_count || 0,
        }}
        imageUrls={post.images || []}
        comments={transformedComments}
        onLike={onLike}
        onShare={() => {
          const url = `${window.location.origin}/community/post/${postId}`;
          navigator.clipboard.writeText(url);
          toast.success('링크가 복사되었습니다');
        }}
        onBookmark={onBookmark}
        onEdit={onEdit}
        onDelete={onDelete}
        onCommentLike={handleCommentLike}
        onCommentSubmit={handleCommentSubmit}
        onCommentEdit={handleCommentEdit}
        onCommentDelete={handleCommentDelete}
        liked={isLiked || post.is_liked}
        bookmarked={isSaved || post.is_saved}
        currentUser={user ? { id: user.id, name: user.name, image_url: user.image_url } : undefined}
      />
    </div>
  );
}

// Q&A 상세 Drawer 컨텐츠 컴포넌트
function QnaDetailDrawerContent({
  questionData,
  questionId,
}: {
  questionData?: QuestionListItem;
  questionId?: string;
}) {
  const { data: user } = useCurrentUser();
  const { openLoginModal } = useStore();

  const qnaIdNum = questionData?.id || (questionId ? Number(questionId) : 0);

  // 항상 API로 데이터 가져오기 (답변 작성 후 캐시 무효화 시 자동 refetch)
  const { data: fetchedQuestion, isLoading, error } = useQuestion(
    qnaIdNum,
    { enabled: qnaIdNum > 0 }
  );

  const createAnswer = useCreateQuestionAnswer();
  const updateAnswer = useUpdateAnswer();
  const deleteAnswer = useDeleteAnswer();

  // API에서 가져온 데이터 우선 사용, 로딩 중에는 questionData 사용
  const question = fetchedQuestion || questionData;

  // 답변 데이터 변환 (question.answers가 있으면 사용, 없으면 빈 배열)
  const transformedAnswers = (question as any)?.answers?.map((answer: any) => ({
    id: answer.id,
    userId: answer.user_id,
    userProfileId: answer.author_profile_id,
    userName: answer.author_name,
    userImage: answer.author_image_url,
    userHeadline: answer.author_headline,
    content: answer.description || '',
    createdAt: answer.createdat || '',
    likeCount: answer.like_count || 0,
    dislikeCount: 0,
    isAccepted: answer.is_accepted || false,
    liked: answer.is_liked || false,
    disliked: false,
  })) || [];

  const handleAnswerSubmit = async (content: string) => {
    if (!user) {
      openLoginModal();
      return;
    }
    try {
      await createAnswer.mutateAsync({
        questionId: qnaIdNum,
        description: content,
      });
    } catch (error) {
      console.error('Failed to create answer:', error);
    }
  };

  const handleAnswerEdit = (answerId: number, content: string) => {
    updateAnswer.mutate({
      id: answerId,
      questionId: qnaIdNum,
      data: { description: content },
    });
  };

  const handleAnswerDelete = (answerId: number) => {
    deleteAnswer.mutate({
      id: answerId,
      questionId: qnaIdNum,
    });
  };

  // 초기 로딩 시에만 로딩 UI 표시 (데이터가 없고 로딩 중일 때)
  if (isLoading && !question) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600">질문을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <QnaDetail
        qnaId={question.id.toString()}
        title={question.title}
        description={(question as any).description || question.title}
        createdAt={question.createdat}
        updatedAt={question.updatedat}
        hashTagNames=""
        viewCount={(question as any).view_count || 0}
        status={question.status}
        isPublic={question.ispublic}
        answers={transformedAnswers}
        onAnswerSubmit={handleAnswerSubmit}
        onAcceptAnswer={() => {}}
        onAnswerEdit={handleAnswerEdit}
        onAnswerDelete={handleAnswerDelete}
        currentUser={user ? { id: user.id, name: user.name, image_url: user.image_url } : undefined}
      />
    </div>
  );
}

function CommunityPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 탭 읽기
  // 기존 'recent' URL은 'explore'로 매핑 (하위 호환)
  const tabParam = searchParams.get('tab');
  const mappedTab = tabParam === 'recent' ? 'explore' : tabParam;

  const postIdFromUrl = searchParams.get('post');
  const qnaIdFromUrl = searchParams.get('qna');

  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);
  // user는 아직 로드 안됐을 수 있으므로 초기값은 'explore', useEffect에서 조정
  const [contentFilter, setContentFilter] = React.useState<'explore' | 'recommend' | 'qna' | 'following'>(
    (mappedTab as 'explore' | 'recommend' | 'qna' | 'following') || 'explore'
  );
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<SelectedContent | null>(null);

  // Impression tracking
  const { trackImpression } = useImpressionTracker();

  // Drawer 열릴 때 body 스크롤 막기 및 drawer 상태 표시
  React.useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      document.body.dataset.drawerOpen = 'true';
    } else {
      document.body.style.overflow = '';
      delete document.body.dataset.drawerOpen;
    }
    return () => {
      document.body.style.overflow = '';
      delete document.body.dataset.drawerOpen;
    };
  }, [drawerOpen]);

  // 좋아요 상태 관리 (postId -> liked 상태)
  const [likedPosts, setLikedPosts] = React.useState<Record<number, boolean>>({});
  // 북마크 상태 관리 (postId -> saved 상태)
  const [savedPosts, setSavedPosts] = React.useState<Record<number, boolean>>({});
  // Q&A 좋아요 상태 관리
  const [questionLikes, setQuestionLikes] = React.useState<Record<number, { liked: boolean; disliked: boolean }>>({});

  // 광고 표시 상태 (테스트용) - 각 광고별 개별 상태
  const [hiddenAds, setHiddenAds] = React.useState<Record<string, boolean>>({});
  const showAds = Object.keys(hiddenAds).length < 6; // 전체 토글용

  const hideAd = (adKey: string) => {
    setHiddenAds(prev => ({ ...prev, [adKey]: true }));
  };

  const toggleAllAds = () => {
    if (Object.keys(hiddenAds).length > 0) {
      setHiddenAds({}); // 모두 보이기
    } else {
      setHiddenAds({ feedNative: true, mobileScroll: true }); // 모두 숨기기
    }
  };

  // 샘플 광고 데이터
  const sampleAds = {
    feedNative: {
      variant: 'native' as const,
      imageUrl: 'https://placehold.co/400x300/4ECDC4/FFFFFF?text=Native+AD',
      title: '개발자를 위한 최고의 도구',
      description: '생산성을 200% 높이는 개발 도구를 지금 무료로 시작해보세요',
      linkUrl: 'https://example.com',
    },
    mobileScroll: {
      variant: 'card' as const,
      imageUrl: 'https://placehold.co/320x200/F38181/FFFFFF?text=Mobile+AD',
      title: '취업 성공 가이드',
      description: '이력서 작성부터 면접까지 완벽 대비',
      linkUrl: 'https://example.com',
    },
  };

  // Get current user and login modal state
  const { data: user } = useCurrentUser();
  const { openLoginModal } = useStore();

  // 현재 사용자의 프로필 상세 (팔로잉 수 확인용)
  const { data: myProfile } = useMyProfileDetail(user?.id);

  // 팔로잉 수 (3명 이상이어야 팔로잉 탭 활성화)
  const myFollowingCount = myProfile?.following_count ?? 0;
  const isFollowingTabEnabled = myFollowingCount >= 3;

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'explore' | 'recommend' | 'qna' | 'following') => {
    setContentFilter(tab);
    // URL 업데이트 - explore는 기본값이므로 파라미터 없이
    if (tab === 'explore') {
      router.push('/community');
    } else {
      router.push(`/community?tab=${tab}`);
    }
  };

  // 로그인 사용자: URL 파라미터 없이 접근 시 팔로잉 3명 이상이면 '팔로잉' 탭, 아니면 '둘러보기' 탭
  React.useEffect(() => {
    if (user && !tabParam) {
      if (isFollowingTabEnabled) {
        setContentFilter('following');
      } else {
        setContentFilter('explore');
      }
    }
  }, [user, tabParam, isFollowingTabEnabled]);

  // API Hooks
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts
  } = useInfinitePosts();

  const {
    data: recommendedPostsDataPaginated,
    isLoading: isLoadingRecommendedPostsPaginated,
    error: recommendedPostsError,
    fetchNextPage: fetchNextRecommendedPosts,
    hasNextPage: hasNextRecommendedPosts,
    isFetchingNextPage: isFetchingNextRecommendedPosts
  } = useInfiniteRecommendedPosts(undefined, { enabled: !!user });

  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    error: questionsError,
    fetchNextPage: fetchNextQuestions,
    hasNextPage: hasNextQuestions,
    isFetchingNextPage: isFetchingNextQuestions
  } = useInfiniteQuestions();

  // Recommended Followers - 30명 후보군에서 필터링/셔플 후 5명 노출 (로그인 사용자만)
  const {
    data: recommendedFollowersCandidates,
    isLoading: isLoadingRecommendedFollowers,
  } = useRecommendedFollowers(30, { enabled: !!user });


  // Following Posts (팔로잉하는 사람의 포스트) - 로그인 사용자만
  const {
    data: followingPostsData,
    isLoading: isLoadingFollowingPosts,
    error: followingPostsError,
  } = useFollowingPosts(1, { enabled: !!user });

  // 팔로잉 탭 빈 상태 확인
  const isFollowingEmpty = contentFilter === 'following' &&
    !isLoadingFollowingPosts &&
    (!followingPostsData?.results || followingPostsData.results.length === 0);

  // 추천 사용자 2명씩 페이지네이션 상태
  const [currentPairIndex, setCurrentPairIndex] = React.useState(0);

  // 현재 표시할 2명
  const currentPair = recommendedFollowersCandidates?.slice(currentPairIndex, currentPairIndex + 2);

  // 각 사용자의 프로필 상세 조회
  const { data: profile1 } = useProfileByUserId(
    currentPair?.[0]?.user_id ?? 0,
    { enabled: !!currentPair?.[0] && isFollowingEmpty }
  );
  const { data: profile2 } = useProfileByUserId(
    currentPair?.[1]?.user_id ?? 0,
    { enabled: !!currentPair?.[1] && isFollowingEmpty }
  );

  // 각 사용자의 최근 포스트 3개 조회
  const { data: posts1 } = usePosts(
    { user_id: currentPair?.[0]?.user_id, page_size: 3 },
    { enabled: !!currentPair?.[0] && isFollowingEmpty }
  );
  const { data: posts2 } = usePosts(
    { user_id: currentPair?.[1]?.user_id, page_size: 3 },
    { enabled: !!currentPair?.[1] && isFollowingEmpty }
  );

  // 프로필 캐시 (전환 시 매번 조회하지 않도록)
  const [profilesCache, setProfilesCache] = React.useState<Record<number, ProfileInfo | null>>({});

  // 추천 사용자들의 포스트 캐시 (최대 3개씩)
  const [userPostsCache, setUserPostsCache] = React.useState<Record<number, RecentPost[]>>({});

  // 현재 페어의 user_id들 (안정적인 의존성으로 사용)
  const user1Id = currentPair?.[0]?.user_id;
  const user2Id = currentPair?.[1]?.user_id;

  // 프로필 캐시 업데이트
  React.useEffect(() => {
    if (user1Id && profile1) {
      setProfilesCache(prev => ({
        ...prev,
        [user1Id]: {
          description: profile1.description,
          careers: profile1.careers?.map(c => ({
            company: c.company,
            title: c.title,
            is_current: c.is_current,
          })) || [],
        },
      }));
    }
  }, [user1Id, profile1]);

  React.useEffect(() => {
    if (user2Id && profile2) {
      setProfilesCache(prev => ({
        ...prev,
        [user2Id]: {
          description: profile2.description,
          careers: profile2.careers?.map(c => ({
            company: c.company,
            title: c.title,
            is_current: c.is_current,
          })) || [],
        },
      }));
    }
  }, [user2Id, profile2]);

  // 포스트 캐시 업데이트 (최대 3개)
  React.useEffect(() => {
    if (user1Id && posts1?.results) {
      setUserPostsCache(prev => ({
        ...prev,
        [user1Id]: posts1.results.slice(0, 3).map(post => ({
          id: post.id,
          title: post.title || '',
          content: post.description || '',
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          created_at: post.createdat,
        })),
      }));
    }
  }, [user1Id, posts1]);

  React.useEffect(() => {
    if (user2Id && posts2?.results) {
      setUserPostsCache(prev => ({
        ...prev,
        [user2Id]: posts2.results.slice(0, 3).map(post => ({
          id: post.id,
          title: post.title || '',
          content: post.description || '',
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          created_at: post.createdat,
        })),
      }));
    }
  }, [user2Id, posts2]);

  // 이전/다음 핸들러 (2명씩)
  const handlePrevPair = () => setCurrentPairIndex(prev => Math.max(0, prev - 2));
  const handleNextPair = () => setCurrentPairIndex(prev =>
    Math.min((recommendedFollowersCandidates?.length || 2) - 2, prev + 2)
  );

  // Mutations
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const savePost = useSavePost();
  const unsavePost = useUnsavePost();
  const deletePost = useDeletePost();
  const deleteQuestion = useDeleteQuestion();
  const likeQuestion = useLikeQuestion();
  const unlikeQuestion = useUnlikeQuestion();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // Follow/Unfollow handlers for feed cards
  const handleFollowUser = (userId: string) => {
    if (!user) {
      openLoginModal();
      return;
    }
    followUser.mutate(parseInt(userId, 10));
  };

  const handleUnfollowUser = (userId: string) => {
    if (!user) {
      openLoginModal();
      return;
    }
    unfollowUser.mutate(parseInt(userId, 10));
  };

  // URL과 상태 동기화
  React.useEffect(() => {
    if (mappedTab) {
      setContentFilter(mappedTab as 'explore' | 'recommend' | 'qna' | 'following');
    }
  }, [mappedTab]);

  // URL 파라미터로 drawer 열기
  // 이미 같은 콘텐츠가 선택되어 있으면 userProfile을 보존하기 위해 덮어쓰지 않음
  React.useEffect(() => {
    if (postIdFromUrl) {
      // 이미 같은 post가 선택되어 있으면 selectedContent를 덮어쓰지 않음 (userProfile 보존)
      if (selectedContent?.type === 'post' && selectedContent?.id === postIdFromUrl) {
        if (!drawerOpen) setDrawerOpen(true);
        return;
      }
      setSelectedContent({ type: 'post', id: postIdFromUrl });
      setDrawerOpen(true);
    } else if (qnaIdFromUrl) {
      // 이미 같은 qna가 선택되어 있으면 selectedContent를 덮어쓰지 않음 (questionData 보존)
      if (selectedContent?.type === 'qna' && selectedContent?.id === qnaIdFromUrl) {
        if (!drawerOpen) setDrawerOpen(true);
        return;
      }
      setSelectedContent({ type: 'qna', id: qnaIdFromUrl });
      setDrawerOpen(true);
    }
  }, [postIdFromUrl, qnaIdFromUrl]);

  // API 응답에서 초기 좋아요/북마크 상태 설정
  React.useEffect(() => {
    if (postsData?.pages) {
      const initialLikedState: Record<number, boolean> = {};
      const initialSavedState: Record<number, boolean> = {};
      postsData.pages.forEach((page) => {
        (page as PaginatedPostResponse).results?.forEach((post) => {
          initialLikedState[post.id] = post.is_liked;
          initialSavedState[post.id] = post.is_saved;
        });
      });
      setLikedPosts(prev => ({ ...prev, ...initialLikedState }));
      setSavedPosts(prev => ({ ...prev, ...initialSavedState }));
    }
  }, [postsData]);

  // Recommended posts에서도 초기 좋아요/북마크 상태 설정
  React.useEffect(() => {
    if (recommendedPostsDataPaginated?.pages) {
      const initialLikedState: Record<number, boolean> = {};
      const initialSavedState: Record<number, boolean> = {};
      recommendedPostsDataPaginated.pages.forEach((page) => {
        (page as PaginatedPostResponse).results?.forEach((post) => {
          initialLikedState[post.id] = post.is_liked;
          initialSavedState[post.id] = post.is_saved;
        });
      });
      setLikedPosts(prev => ({ ...prev, ...initialLikedState }));
      setSavedPosts(prev => ({ ...prev, ...initialSavedState }));
    }
  }, [recommendedPostsDataPaginated]);

  // Following posts에서도 초기 좋아요/북마크 상태 설정
  React.useEffect(() => {
    if (followingPostsData?.results) {
      const initialLikedState: Record<number, boolean> = {};
      const initialSavedState: Record<number, boolean> = {};
      followingPostsData.results.forEach((post) => {
        initialLikedState[post.id] = post.is_liked;
        initialSavedState[post.id] = post.is_saved;
      });
      setLikedPosts(prev => ({ ...prev, ...initialLikedState }));
      setSavedPosts(prev => ({ ...prev, ...initialSavedState }));
    }
  }, [followingPostsData]);

  // API 응답에서 초기 질문 좋아요 상태 설정
  React.useEffect(() => {
    if (questionsData?.pages) {
      const initialQuestionLikes: Record<number, { liked: boolean; disliked: boolean }> = {};
      questionsData.pages.forEach((page) => {
        (page as PaginatedQuestionResponse).results?.forEach((question) => {
          initialQuestionLikes[question.id] = {
            liked: question.is_liked || false,
            disliked: false, // API doesn't provide dislike status yet
          };
        });
      });
      setQuestionLikes(prev => ({ ...prev, ...initialQuestionLikes }));
    }
  }, [questionsData]);

  const handleOpenPost = (postId: string, userProfile?: UserProfile) => {
    setSelectedContent({ type: 'post', id: postId, userProfile });
    setDrawerOpen(true);
    // GA4: post_detail_view 이벤트 트래킹
    trackPostDetailView(postId, userProfile?.id?.toString() || '', 'home');
    // URL 업데이트 (히스토리에 추가)
    const params = new URLSearchParams(searchParams.toString());
    params.set('post', postId);
    params.delete('qna');
    router.push(`/community?${params.toString()}`, { scroll: false });
  };

  const handleOpenQna = async (qnaId: string, questionData: QuestionListItem) => {
    // 먼저 drawer를 열고 로딩 상태로 표시
    setSelectedContent({ type: 'qna', id: qnaId, questionData });
    setDrawerOpen(true);
    // GA4: question_detail_view 이벤트 트래킹
    trackQuestionDetailView(qnaId, 'home');

    // URL 업데이트 (히스토리에 추가)
    const params = new URLSearchParams(searchParams.toString());
    params.set('qna', qnaId);
    params.delete('post');
    router.push(`/community?${params.toString()}`, { scroll: false });

    // 상세 API 호출해서 description과 answers 가져오기
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/questions/${qnaId}/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const detailData = await response.json();
        setSelectedContent({ type: 'qna', id: qnaId, questionData: detailData });
      }
    } catch (err) {
      console.error('Failed to fetch question detail:', err);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedContent(null), 300);
    // URL에서 post/qna 파라미터 제거
    const params = new URLSearchParams(searchParams.toString());
    params.delete('post');
    params.delete('qna');
    const queryString = params.toString();
    router.push(queryString ? `/community?${queryString}` : '/community', { scroll: false });
  };

  // 좋아요 핸들러 (Optimistic Update)
  const handleLikePost = (postId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }

    const isCurrentlyLiked = likedPosts[postId] || false;

    // Optimistic update
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !isCurrentlyLiked
    }));

    // API 호출
    if (isCurrentlyLiked) {
      unlikePost.mutate(postId, {
        onError: () => {
          // 실패 시 롤백
          setLikedPosts(prev => ({
            ...prev,
            [postId]: true
          }));
          toast.error('좋아요 취소에 실패했습니다');
        }
      });
    } else {
      likePost.mutate(postId, {
        onError: () => {
          // 실패 시 롤백
          setLikedPosts(prev => ({
            ...prev,
            [postId]: false
          }));
          toast.error('좋아요에 실패했습니다');
        }
      });
    }
  };

  // 북마크 핸들러 (Optimistic Update)
  const handleBookmarkPost = (postId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }

    const isCurrentlySaved = savedPosts[postId] || false;

    // Optimistic update
    setSavedPosts(prev => ({
      ...prev,
      [postId]: !isCurrentlySaved
    }));

    // API 호출
    if (isCurrentlySaved) {
      unsavePost.mutate(postId, {
        onError: () => {
          // 실패 시 롤백
          setSavedPosts(prev => ({
            ...prev,
            [postId]: true
          }));
          toast.error('북마크 취소에 실패했습니다');
        }
      });
    } else {
      savePost.mutate(postId, {
        onError: () => {
          // 실패 시 롤백
          setSavedPosts(prev => ({
            ...prev,
            [postId]: false
          }));
          toast.error('북마크에 실패했습니다');
        }
      });
    }
  };

  // Q&A 좋아요 핸들러 (Optimistic Update)
  const handleLikeQuestion = (questionId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }

    const current = questionLikes[questionId] || { liked: false, disliked: false };

    // Optimistic update
    setQuestionLikes(prev => ({
      ...prev,
      [questionId]: { liked: !current.liked, disliked: false }
    }));

    if (current.liked) {
      unlikeQuestion.mutate(questionId, {
        onError: () => {
          setQuestionLikes(prev => ({ ...prev, [questionId]: current }));
          toast.error('좋아요 취소에 실패했습니다');
        }
      });
    } else {
      likeQuestion.mutate(questionId, {
        onError: () => {
          setQuestionLikes(prev => ({ ...prev, [questionId]: current }));
          toast.error('좋아요에 실패했습니다');
        }
      });
    }
  };

  // Q&A 싫어요 핸들러 (Optimistic Update)
  const handleDislikeQuestion = (questionId: number) => {
    if (!user) {
      openLoginModal();
      return;
    }

    const current = questionLikes[questionId] || { liked: false, disliked: false };

    // Optimistic update
    setQuestionLikes(prev => ({
      ...prev,
      [questionId]: { liked: false, disliked: !current.disliked }
    }));

    // Note: Backend may handle dislike as a separate endpoint or same endpoint with different param
    if (current.disliked) {
      unlikeQuestion.mutate(questionId, {
        onError: () => {
          setQuestionLikes(prev => ({ ...prev, [questionId]: current }));
          toast.error('싫어요 취소에 실패했습니다');
        }
      });
    } else {
      // For now, using like endpoint - backend should handle the toggle
      likeQuestion.mutate(questionId, {
        onError: () => {
          setQuestionLikes(prev => ({ ...prev, [questionId]: current }));
          toast.error('싫어요에 실패했습니다');
        }
      });
    }
  };

  // 글쓰기 버튼 핸들러
  const handleWriteClick = () => {
    if (user) {
      // 현재 탭에 따라 다른 작성 페이지로 이동
      if (contentFilter === 'qna') {
        router.push('/community/new/qna');
      } else {
        router.push('/community/new/post');
      }
    } else {
      openLoginModal();
    }
  };

  // 공유하기 핸들러
  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/community/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      // GA4: content_share 이벤트 트래킹
      trackContentShare('post', postId, 'copy_link');
      toast.success('링크가 클립보드에 복사되었습니다');
    } catch (error) {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  // 수정 핸들러
  const handleEditPost = (postId: number) => {
    router.push(`/community/edit/post/${postId}`);
  };

  // 삭제 핸들러
  const handleDeletePost = (postId: number) => {
    deletePost.mutate(postId);
  };

  // 질문 수정 핸들러
  const handleEditQuestion = (questionId: number) => {
    router.push(`/community/edit/qna/${questionId}`);
  };

  // 질문 삭제 핸들러
  const handleDeleteQuestion = (questionId: number) => {
    deleteQuestion.mutate(questionId);
  };

  const handleLoadMore = () => {
    if (contentFilter === 'explore') {
      if (hasNextPosts && !isFetchingNextPosts) {
        fetchNextPosts();
      }
    } else if (contentFilter === 'recommend') {
      if (hasNextRecommendedPosts && !isFetchingNextRecommendedPosts) {
        fetchNextRecommendedPosts();
      }
    } else if (contentFilter === 'qna') {
      if (hasNextQuestions && !isFetchingNextQuestions) {
        fetchNextQuestions();
      }
    } else {
      // following은 둘 다 fetch
      if (hasNextPosts && !isFetchingNextPosts) {
        fetchNextPosts();
      }
      if (hasNextQuestions && !isFetchingNextQuestions) {
        fetchNextQuestions();
      }
    }
  };

  // Interest categories
  const interestCategories = [
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'ai-ml', label: 'AI/ML' },
    { id: 'design', label: 'Design' },
    { id: 'management', label: 'Management' },
    { id: 'career', label: 'Career' },
  ];

  // Mix all content naturally by interleaving different types
  const allContent = React.useMemo(() => {
    // Use API data for feed and QnA only
    // Flatten all pages (filter out pages with undefined results)
    const feedItems = ((postsData?.pages as PaginatedPostResponse[] | undefined)?.flatMap(page => page.results || []) || []).map((item, idx) => ({
      type: 'feed' as const,
      data: item,
      originalIndex: idx,
    }));

    const recommendedItems = ((recommendedPostsDataPaginated?.pages as PaginatedPostResponse[] | undefined)?.flatMap(page => page.results || []) || []).map((item, idx) => ({
      type: 'feed' as const,
      data: item,
      originalIndex: idx,
    }));

    const qnaItems = ((questionsData?.pages as PaginatedQuestionResponse[] | undefined)?.flatMap(page => page.results || []) || []).map((item, idx) => ({
      type: 'qna' as const,
      data: item,
      originalIndex: idx,
    }));

    // Interleave items to mix them naturally
    const result = [];
    const maxLength = Math.max(feedItems.length, qnaItems.length);

    for (let i = 0; i < maxLength; i++) {
      // Add items in a rotating pattern: feed -> qna -> feed -> qna...
      if (i < feedItems.length) result.push(feedItems[i]);
      if (i < qnaItems.length) result.push(qnaItems[i]);
    }

    return { allItems: result, recommendedItems };
  }, [postsData, recommendedPostsDataPaginated, questionsData]);

  // Filter content based on selected filter
  const filteredContent = React.useMemo(() => {
    if (contentFilter === 'following') {
      // Use following posts data
      if (!followingPostsData?.results) return [];

      return followingPostsData.results.map((item, idx) => ({
        type: 'feed' as const,
        data: item,
        originalIndex: idx,
      }));
    }
    if (contentFilter === 'recommend') {
      return allContent.recommendedItems;
    }
    if (contentFilter === 'explore') {
      // 전체 탭에서는 feed와 qna 모두 표시
      return allContent.allItems;
    }
    return allContent.allItems.filter(item => item.type === contentFilter);
  }, [allContent, contentFilter, followingPostsData]);

  // Loading state
  const isLoading = isLoadingPosts || isLoadingRecommendedPostsPaginated || isLoadingQuestions || isFetchingNextPosts || isFetchingNextRecommendedPosts || isFetchingNextQuestions || (contentFilter === 'following' && isLoadingFollowingPosts);

  // Error state
  const hasError = postsError || recommendedPostsError || questionsError || (contentFilter === 'following' && followingPostsError);

  // Check if there's more data to load
  const hasMoreData = contentFilter === 'explore'
    ? hasNextPosts
    : contentFilter === 'recommend'
      ? hasNextRecommendedPosts
      : contentFilter === 'qna'
        ? hasNextQuestions
        : contentFilter === 'following'
          ? false // Following uses single page for now
          : hasNextPosts || hasNextQuestions;

  // Transform recommended followers data for RecommendedFollowersPanel and FeedCard
  const recommendedFollowers = React.useMemo(() => {
    if (!recommendedFollowersCandidates || recommendedFollowersCandidates.length === 0) return [];

    return recommendedFollowersCandidates.slice(0, 5).map((follower) => ({
      id: follower.user_id.toString(),
      profileId: follower.id,
      name: follower.name,
      image_url: follower.image_url || undefined,
      headline: follower.headline || undefined,
      isFollowing: follower.is_following || false,
      href: `/profile/${follower.id}`,
    }));
  }, [recommendedFollowersCandidates]);

  return (
    <div className="max-w-7xl mx-auto px-4 overflow-x-hidden">
      {/* Main Content */}
      <main className="min-w-0">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="pt-2 md:pt-16 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto flex-nowrap scrollbar-hide min-w-0">
                {/* 로그인 사용자: 팔로잉 탭 (3명 이상 팔로잉 시에만 활성화) */}
                {user && isFollowingTabEnabled && (
                  <Chip
                    variant={contentFilter === 'following' ? 'selected' : 'default'}
                    onClick={() => handleTabChange('following')}
                    className="shrink-0"
                  >
                    팔로잉
                  </Chip>
                )}
                {user && !isFollowingTabEnabled && (
                  <div className="relative group shrink-0">
                    <Chip
                      variant="default"
                      className="opacity-50 cursor-not-allowed"
                    >
                      팔로잉
                    </Chip>
                    <div className="absolute left-0 top-full mt-1 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      3명 이상 팔로우하면 활성화돼요
                    </div>
                  </div>
                )}
                <Chip
                  variant={contentFilter === 'explore' ? 'selected' : 'default'}
                  onClick={() => handleTabChange('explore')}
                  className="shrink-0"
                >
                  둘러보기
                </Chip>
                <Chip
                  variant={contentFilter === 'recommend' ? 'selected' : 'default'}
                  onClick={() => handleTabChange('recommend')}
                  className="shrink-0"
                >
                  추천
                </Chip>
                <Chip
                  variant={contentFilter === 'qna' ? 'selected' : 'default'}
                  onClick={() => handleTabChange('qna')}
                  className="shrink-0"
                >
                  Q&A
                </Chip>
              </div>
              <Button
                variant="coral"
                onClick={handleWriteClick}
                className="flex items-center gap-2 shrink-0"
              >
                <PenSquare className="h-4 w-4" />
                <span className="hidden sm:inline">글쓰기</span>
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && filteredContent.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-3 text-slate-600">Loading content...</span>
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="text-center py-12">
              <p className="text-slate-600">Failed to load content. Please try again later.</p>
            </div>
          )}

          {/* Empty State - 팔로잉 탭: 추천 사용자 카드 2명씩 */}
          {isFollowingEmpty && recommendedFollowersCandidates && recommendedFollowersCandidates.length > 0 && (
            <div className="py-8">
              <div className="text-center mb-6">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  이런 분들을 팔로우해보세요
                </h3>
                <p className="text-sm text-slate-500">
                  관심 있는 사람들을 팔로우하고 그들의 소식을 받아보세요
                </p>
              </div>

              <RecommendedUserPairContainer
                users={recommendedFollowersCandidates.map(f => ({
                  id: f.id,
                  user_id: f.user_id,
                  name: f.name,
                  image_url: f.image_url,
                  headline: f.headline,
                  is_following: f.is_following,
                  follower_count: f.follower_count,
                }))}
                profiles={profilesCache}
                userPosts={userPostsCache}
                currentPairIndex={currentPairIndex}
                onPrev={handlePrevPair}
                onNext={handleNextPair}
                onFollow={handleFollowUser}
                onUnfollow={handleUnfollowUser}
                onPostClick={(postId) => {
                  setSelectedContent({ type: 'post', id: postId.toString() });
                  setDrawerOpen(true);
                }}
              />
            </div>
          )}

          {/* Empty State - 다른 탭: 기본 메시지 */}
          {!isLoading && !hasError && filteredContent.length === 0 && contentFilter !== 'following' && (
            <div className="text-center py-12">
              <p className="text-slate-600">No content available.</p>
            </div>
          )}

          {/* Feed Layout */}
          {filteredContent.length > 0 && (
            <>
              {/* 모바일: 첫 1개 피드 */}
              <div className="lg:hidden space-y-4">
                {filteredContent.slice(0, 1).map((item) => {
                  if (item.type === 'feed') {
                    const post = item.data;
                    // Track impression
                    trackImpression(post.id);

                    // AI Chat Session Post (posttype=10)
                    if (post.posttype === 10) {
                      return (
                        <AIChatPostCard
                          key={`mobile-ai-${post.id}`}
                          postId={post.id}
                          question={post.title || '제목 없음'}
                          answerPreview={post.description}
                          sessionId={post.chat_session_id}
                          createdAt={post.createdat}
                          likeCount={post.like_count || 0}
                          commentCount={post.comment_count || 0}
                          viewCount={post.view_count || 0}
                          isLiked={likedPosts[post.id] || false}
                          onLike={() => handleLikePost(post.id)}
                          onClick={() => handleOpenPost(post.id.toString())}
                          authorName={post.author?.name}
                          authorImageUrl={post.author?.image_url || undefined}
                          authorId={post.author?.id}
                          authorProfileId={post.author?.profile_id}
                        />
                      );
                    }

                    // Regular Post
                    const userProfile: UserProfile = post.author ? {
                      id: post.author.id,
                      profile_id: post.author.profile_id,
                      name: post.author.name,
                      image_url: post.author.image_url || '',
                      headline: post.author.headline || '',
                      description: post.author.description || '',
                      small_image_url: post.author.image_url || '',
                    } : {
                      id: post.userid,
                      profile_id: undefined,
                      name: '알 수 없는 사용자',
                      image_url: '',
                      headline: '',
                      description: '',
                      small_image_url: '',
                    };
                    return (
                      <CommunityFeedCard
                        key={`mobile-feed-${post.id}`}
                        postId={post.id}
                        authorId={post.author?.id || post.userid}
                        userProfile={userProfile}
                        title={post.title ?? undefined}
                        content={post.description}
                        contentHtml={post.descriptionhtml}
                        createdAt={post.createdat}
                        stats={{
                          likeCount: post.like_count || 0,
                          replyCount: post.comment_count || 0,
                          viewCount: post.view_count || 0,
                        }}
                        imageUrls={post.images || []}
                        onClick={() => handleOpenPost(post.id.toString(), userProfile)}
                        onLike={() => handleLikePost(post.id)}
                        onShare={() => handleShare(post.id.toString())}
                        onBookmark={() => handleBookmarkPost(post.id)}
                        onEdit={() => handleEditPost(post.id)}
                        onDelete={() => handleDeletePost(post.id)}
                        liked={likedPosts[post.id] || false}
                        bookmarked={savedPosts[post.id] || false}
                      />
                    );
                  } else if (item.type === 'qna') {
                    const question = item.data;
                    // Track impression for Q&A
                    trackImpression(question.id, { type: 'question' });
                    const author = {
                      id: question.user_id,
                      profile_id: (question as any).author_profile_id,
                      name: question.author_name,
                      email: '',
                      image_url: (question as any).author_image_url || null,
                      headline: (question as any).author_headline || null,
                    };
                    return (
                      <QnaCard
                        key={`mobile-qna-${question.id}`}
                        title={question.title}
                        description={(question as any).description || question.title}
                        author={author}
                        createdAt={question.createdat}
                        updatedAt={question.updatedat}
                        status={question.status}
                        isPublic={question.ispublic}
                        answerCount={question.answer_count || 0}
                        commentCount={0}
                        viewCount={question.view_count || 0}
                        hashTagNames=""
                        qnaId={question.id}
                        onClick={() => handleOpenQna(question.id.toString(), question)}
                        onEdit={() => handleEditQuestion(question.id)}
                        onDelete={() => handleDeleteQuestion(question.id)}
                      />
                    );
                  }
                  return null;
                })}
              </div>

              {/* 모바일: 나머지 피드 (광고, 인기글, 추천 팔로워 카드 혼합) */}
              <div className="lg:hidden space-y-4">
                {filteredContent.slice(1).flatMap((item, index) => {
                  const elements: React.ReactNode[] = [];
                  const realIndex = index + 1; // slice(1)이므로 실제 인덱스는 +1

                  // 3번째 아이템 후에 Sponsored 광고 삽입
                  if (realIndex === 3 && !hiddenAds['feedNative']) {
                    elements.push(
                      <AdBanner
                        key="mobile-sponsored-ad"
                        {...sampleAds.feedNative}
                        onClose={() => hideAd('feedNative')}
                      />
                    );
                  }

                  // 6번째 아이템 후에 인기글 카드 삽입
                  if (realIndex === 6) {
                    elements.push(
                      <TopPostsFeedCard
                        key="mobile-top-posts-card"
                        maxItems={5}
                        onPostClick={(postId) => handleOpenPost(postId)}
                      />
                    );
                  }

                  // 9번째 아이템 후에 추천 팔로워 카드 삽입 (로그인 사용자만)
                  if (realIndex === 9 && user && recommendedFollowers.length > 0) {
                    elements.push(
                      <RecommendedFollowersFeedCard
                        key="mobile-recommended-followers-card"
                        followers={recommendedFollowers}
                        maxItems={5}
                        onFollow={handleFollowUser}
                        onUnfollow={handleUnfollowUser}
                      />
                    );
                  }

                  // 12번째 아이템 후에 기업 블로그 카드 삽입
                  if (realIndex === 12) {
                    elements.push(
                      <CompanyUpdateFeedCard
                        key="mobile-company-blog-card"
                        type="blog"
                        company={MOCK_COMPANY_CONTENTS.blog.company}
                        item={MOCK_COMPANY_CONTENTS.blog.item}
                        onCardClick={() => {
                          setSelectedContent({
                            type: 'company',
                            id: 'blog-toss',
                            companyData: {
                              type: 'blog',
                              company: MOCK_COMPANY_CONTENTS.blog.company,
                              item: MOCK_COMPANY_CONTENTS.blog.item,
                            },
                          });
                          setDrawerOpen(true);
                        }}
                      />
                    );
                  }

                  // 18번째 아이템 후에 채용공고 카드 삽입
                  if (realIndex === 18) {
                    elements.push(
                      <CompanyUpdateFeedCard
                        key="mobile-company-jobs-card"
                        type="jobs"
                        company={MOCK_COMPANY_CONTENTS.jobs.company}
                        item={MOCK_COMPANY_CONTENTS.jobs.item}
                        onCardClick={() => {
                          setSelectedContent({
                            type: 'company',
                            id: 'jobs-kakao',
                            companyData: {
                              type: 'jobs',
                              company: MOCK_COMPANY_CONTENTS.jobs.company,
                              item: MOCK_COMPANY_CONTENTS.jobs.item,
                            },
                          });
                          setDrawerOpen(true);
                        }}
                      />
                    );
                  }

                  // 피드 아이템 렌더링
                  if (item.type === 'feed') {
                    const post = item.data;
                    trackImpression(post.id);

                    if (post.posttype === 10) {
                      elements.push(
                        <AIChatPostCard
                          key={`mobile-ai-${post.id}`}
                          postId={post.id}
                          question={post.title || '제목 없음'}
                          answerPreview={post.description}
                          sessionId={post.chat_session_id}
                          createdAt={post.createdat}
                          likeCount={post.like_count || 0}
                          commentCount={post.comment_count || 0}
                          viewCount={post.view_count || 0}
                          isLiked={likedPosts[post.id] || false}
                          onLike={() => handleLikePost(post.id)}
                          onClick={() => handleOpenPost(post.id.toString())}
                          authorName={post.author?.name}
                          authorImageUrl={post.author?.image_url || undefined}
                          authorId={post.author?.id}
                          authorProfileId={post.author?.profile_id}
                        />
                      );
                      return elements;
                    }

                    const userProfile: UserProfile = post.author ? {
                      id: post.author.id,
                      profile_id: post.author.profile_id,
                      name: post.author.name,
                      image_url: post.author.image_url || '',
                      headline: post.author.headline || '',
                      description: post.author.description || '',
                      small_image_url: post.author.image_url || '',
                    } : {
                      id: post.userid,
                      profile_id: undefined,
                      name: '알 수 없는 사용자',
                      image_url: '',
                      headline: '',
                      description: '',
                      small_image_url: '',
                    };
                    elements.push(
                      <CommunityFeedCard
                        key={`mobile-feed-${post.id}`}
                        postId={post.id}
                        authorId={post.author?.id || post.userid}
                        userProfile={userProfile}
                        title={post.title ?? undefined}
                        content={post.description}
                        contentHtml={post.descriptionhtml}
                        createdAt={post.createdat}
                        stats={{
                          likeCount: post.like_count || 0,
                          replyCount: post.comment_count || 0,
                          viewCount: post.view_count || 0,
                        }}
                        imageUrls={post.images || []}
                        onClick={() => handleOpenPost(post.id.toString(), userProfile)}
                        onLike={() => handleLikePost(post.id)}
                        onShare={() => handleShare(post.id.toString())}
                        onBookmark={() => handleBookmarkPost(post.id)}
                        onEdit={() => handleEditPost(post.id)}
                        onDelete={() => handleDeletePost(post.id)}
                        liked={likedPosts[post.id] || false}
                        bookmarked={savedPosts[post.id] || false}
                      />
                    );
                  } else if (item.type === 'qna') {
                    const question = item.data;
                    trackImpression(question.id, { type: 'question' });
                    const author = {
                      id: question.user_id,
                      profile_id: (question as any).author_profile_id,
                      name: question.author_name,
                      email: '',
                      image_url: (question as any).author_image_url || null,
                      headline: (question as any).author_headline || null,
                    };
                    elements.push(
                      <QnaCard
                        key={`mobile-qna-${question.id}`}
                        title={question.title}
                        description={(question as any).description || question.title}
                        author={author}
                        createdAt={question.createdat}
                        updatedAt={question.updatedat}
                        status={question.status}
                        isPublic={question.ispublic}
                        answerCount={question.answer_count || 0}
                        commentCount={0}
                        viewCount={question.view_count || 0}
                        hashTagNames=""
                        qnaId={question.id}
                        onClick={() => handleOpenQna(question.id.toString(), question)}
                        onEdit={() => handleEditQuestion(question.id)}
                        onDelete={() => handleDeleteQuestion(question.id)}
                      />
                    );
                  }
                  return elements;
                })}
              </div>

              {/* PC: 3열 Masonry 레이아웃 */}
              <div className="hidden lg:block">
                <Masonry
                  breakpointCols={{ default: 3, 1280: 3, 1024: 2, 768: 1 }}
                  className="flex -ml-6 w-auto"
                  columnClassName="pl-6 bg-clip-padding"
                >
                  {filteredContent.flatMap((item, index) => {
                    const elements: React.ReactNode[] = [];

                    // 3번째 아이템 후에 Sponsored 광고 삽입
                    if (index === 3 && !hiddenAds['feedNative']) {
                      elements.push(
                        <div key="sponsored-ad" className="mb-6">
                          <AdBanner
                            {...sampleAds.feedNative}
                            onClose={() => hideAd('feedNative')}
                          />
                        </div>
                      );
                    }

                    // 6번째 아이템 후에 인기글 카드 삽입
                    if (index === 6) {
                      elements.push(
                        <div key="top-posts-card" className="mb-6">
                          <TopPostsFeedCard
                            maxItems={5}
                            onPostClick={(postId) => handleOpenPost(postId)}
                          />
                        </div>
                      );
                    }

                    // 9번째 아이템 후에 추천 팔로워 카드 삽입 (로그인 사용자만)
                    if (index === 9 && user && recommendedFollowers.length > 0) {
                      elements.push(
                        <div key="recommended-followers-card" className="mb-6">
                          <RecommendedFollowersFeedCard
                            followers={recommendedFollowers}
                            maxItems={5}
                            onFollow={handleFollowUser}
                            onUnfollow={handleUnfollowUser}
                          />
                        </div>
                      );
                    }

                    // 12번째 아이템 후에 기업 블로그 카드 삽입
                    if (index === 12) {
                      elements.push(
                        <div key="company-blog-card" className="mb-6">
                          <CompanyUpdateFeedCard
                            type="blog"
                            company={MOCK_COMPANY_CONTENTS.blog.company}
                            item={MOCK_COMPANY_CONTENTS.blog.item}
                            onCardClick={() => {
                              setSelectedContent({
                                type: 'company',
                                id: 'blog-toss',
                                companyData: {
                                  type: 'blog',
                                  company: MOCK_COMPANY_CONTENTS.blog.company,
                                  item: MOCK_COMPANY_CONTENTS.blog.item,
                                },
                              });
                              setDrawerOpen(true);
                            }}
                          />
                        </div>
                      );
                    }

                    // 18번째 아이템 후에 채용공고 카드 삽입
                    if (index === 18) {
                      elements.push(
                        <div key="company-jobs-card" className="mb-6">
                          <CompanyUpdateFeedCard
                            type="jobs"
                            company={MOCK_COMPANY_CONTENTS.jobs.company}
                            item={MOCK_COMPANY_CONTENTS.jobs.item}
                            onCardClick={() => {
                              setSelectedContent({
                                type: 'company',
                                id: 'jobs-kakao',
                                companyData: {
                                  type: 'jobs',
                                  company: MOCK_COMPANY_CONTENTS.jobs.company,
                                  item: MOCK_COMPANY_CONTENTS.jobs.item,
                                },
                              });
                              setDrawerOpen(true);
                            }}
                          />
                        </div>
                      );
                    }

                    // 피드 아이템 렌더링
                    if (item.type === 'feed') {
                      const post = item.data;
                      // Track impression
                      trackImpression(post.id);

                      // AI Chat Session Post (posttype=10)
                      if (post.posttype === 10) {
                        elements.push(
                          <div key={`ai-${post.id}`} className="mb-6">
                            <AIChatPostCard
                              postId={post.id}
                              question={post.title || '제목 없음'}
                              answerPreview={post.description}
                              sessionId={post.chat_session_id}
                              createdAt={post.createdat}
                              likeCount={post.like_count || 0}
                              commentCount={post.comment_count || 0}
                              viewCount={post.view_count || 0}
                              isLiked={likedPosts[post.id] || false}
                              onLike={() => handleLikePost(post.id)}
                              onClick={() => handleOpenPost(post.id.toString())}
                              authorName={post.author?.name}
                              authorImageUrl={post.author?.image_url || undefined}
                              authorId={post.author?.id}
                              authorProfileId={post.author?.profile_id}
                            />
                          </div>
                        );
                        return elements;
                      }

                      // Regular Post
                      const userProfile: UserProfile = post.author ? {
                        id: post.author.id,
                        profile_id: post.author.profile_id,
                        name: post.author.name,
                        image_url: post.author.image_url || '',
                        headline: post.author.headline || '',
                        description: post.author.description || '',
                        small_image_url: post.author.image_url || '',
                      } : {
                        id: post.userid,
                        profile_id: undefined,
                        name: '알 수 없는 사용자',
                        image_url: '',
                        headline: '',
                        description: '',
                        small_image_url: '',
                      };
                      elements.push(
                        <div key={`feed-${post.id}`} className="mb-6">
                          <CommunityFeedCard
                            postId={post.id}
                            authorId={post.author?.id || post.userid}
                            userProfile={userProfile}
                            title={post.title ?? undefined}
                            content={post.description}
                            contentHtml={post.descriptionhtml}
                            createdAt={post.createdat}
                            stats={{
                              likeCount: post.like_count || 0,
                              replyCount: post.comment_count || 0,
                              viewCount: post.view_count || 0,
                            }}
                            imageUrls={post.images || []}
                            onClick={() => handleOpenPost(post.id.toString(), userProfile)}
                            onLike={() => handleLikePost(post.id)}
                            onShare={() => handleShare(post.id.toString())}
                            onBookmark={() => handleBookmarkPost(post.id)}
                            onEdit={() => handleEditPost(post.id)}
                            onDelete={() => handleDeletePost(post.id)}
                            liked={likedPosts[post.id] || false}
                            bookmarked={savedPosts[post.id] || false}
                          />
                        </div>
                      );
                    } else if (item.type === 'qna') {
                      const question = item.data;
                      // Track impression for Q&A
                      trackImpression(question.id, { type: 'question' });
                      const author = {
                        id: question.user_id,
                        profile_id: (question as any).author_profile_id,
                        name: question.author_name,
                        email: '',
                        image_url: (question as any).author_image_url || null,
                        headline: (question as any).author_headline || null,
                      };
                      elements.push(
                        <div key={`qna-${question.id}`} className="mb-6">
                          <QnaCard
                            title={question.title}
                            description={(question as any).description || question.title}
                            author={author}
                            createdAt={question.createdat}
                            updatedAt={question.updatedat}
                            status={question.status}
                            isPublic={question.ispublic}
                            answerCount={question.answer_count || 0}
                            commentCount={0}
                            viewCount={question.view_count || 0}
                            hashTagNames=""
                            qnaId={question.id}
                            onClick={() => handleOpenQna(question.id.toString(), question)}
                            onEdit={() => handleEditQuestion(question.id)}
                            onDelete={() => handleDeleteQuestion(question.id)}
                          />
                        </div>
                      );
                    }
                    return elements;
                  })}
                </Masonry>
              </div>
            </>
          )}

          {/* Load More */}
          {filteredContent.length > 0 && (
            <LoadMore
              hasMore={!!hasMoreData}
              loading={isLoading}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
      </main>


      {/* Right Drawer - z-index를 높여서 pull-to-refresh 스피너(z-50) 위에 표시 */}
      <div
        className={cn(
          "fixed -top-20 bottom-0 right-0 z-[60] w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto pt-[calc(5rem+env(safe-area-inset-top))]",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selectedContent && (
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedContent.type === 'post' ? '게시글' : selectedContent.type === 'qna' ? '질문' : 'AI 추천'}
              </h2>
              <button
                onClick={handleCloseDrawer}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedContent.type === 'post' && (
                <PostDetailDrawerContent
                  postId={selectedContent.id}
                  isLiked={likedPosts[Number(selectedContent.id)] || false}
                  isSaved={savedPosts[Number(selectedContent.id)] || false}
                  onLike={() => handleLikePost(Number(selectedContent.id))}
                  onBookmark={() => handleBookmarkPost(Number(selectedContent.id))}
                  onEdit={() => {
                    handleCloseDrawer();
                    handleEditPost(Number(selectedContent.id));
                  }}
                  onDelete={() => {
                    handleCloseDrawer();
                    // drawer가 닫힌 후에 삭제하여 "글을 찾을 수 없습니다" 에러 방지
                    setTimeout(() => {
                      handleDeletePost(Number(selectedContent.id));
                    }, 300);
                  }}
                />
              )}
              {selectedContent.type === 'qna' && (
                <QnaDetailDrawerContent
                  questionData={selectedContent.questionData}
                  questionId={selectedContent.id}
                />
              )}
              {selectedContent.type === 'company' && selectedContent.companyData && (
                <div className="p-6">
                  {/* 기업 + AI 헤더 */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: selectedContent.companyData.company.brandColor }}
                      >
                        <span className="text-xl font-bold text-white">
                          {selectedContent.companyData.company.name.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-coral-500 flex items-center justify-center ring-2 ring-white">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{selectedContent.companyData.company.name}</span>
                        <span className="text-slate-300">×</span>
                        <span className="text-coral-500 font-medium">커리어리 AI</span>
                      </div>
                      <span className="text-sm text-slate-400">
                        {selectedContent.companyData.type === 'blog' ? '기술 블로그 분석' : '채용 공고 분석'}
                      </span>
                    </div>
                  </div>

                  {/* 콘텐츠 제목 */}
                  <h2 className="text-xl font-bold text-slate-900 mb-4 leading-snug">
                    {selectedContent.companyData.item.title}
                  </h2>

                  {/* AI 분석 내용 */}
                  <div className="bg-gradient-to-br from-slate-50 to-coral-50/30 rounded-xl p-5 mb-6 border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-full bg-coral-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-700">커리어리 AI의 분석</span>
                    </div>
                    <div className="prose prose-sm prose-slate max-w-none">
                      {selectedContent.companyData.item.aiAnalysis.split('\n\n').map((paragraph, idx) => {
                        // 볼드 처리된 제목 감지
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return (
                            <h4 key={idx} className="text-base font-semibold text-slate-800 mt-4 mb-2">
                              {paragraph.replace(/\*\*/g, '')}
                            </h4>
                          );
                        }
                        // 리스트 항목 감지
                        if (paragraph.includes('\n-') || paragraph.startsWith('-')) {
                          const lines = paragraph.split('\n');
                          return (
                            <div key={idx}>
                              {lines.map((line, lineIdx) => {
                                if (line.startsWith('-')) {
                                  return (
                                    <p key={lineIdx} className="text-slate-600 leading-relaxed pl-4 my-1">
                                      • {line.substring(1).trim()}
                                    </p>
                                  );
                                }
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return (
                                    <h4 key={lineIdx} className="text-base font-semibold text-slate-800 mt-4 mb-2">
                                      {line.replace(/\*\*/g, '')}
                                    </h4>
                                  );
                                }
                                return line ? (
                                  <p key={lineIdx} className="text-slate-600 leading-relaxed my-2">
                                    {line}
                                  </p>
                                ) : null;
                              })}
                            </div>
                          );
                        }
                        // 번호 리스트 감지
                        if (/^\d+\./.test(paragraph)) {
                          return (
                            <p key={idx} className="text-slate-600 leading-relaxed my-2 pl-4">
                              {paragraph}
                            </p>
                          );
                        }
                        // 일반 문단
                        return (
                          <p key={idx} className="text-slate-600 leading-relaxed my-3">
                            {paragraph.replace(/\*\*/g, '')}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  {/* 원문 보기 버튼 */}
                  <a
                    href={selectedContent.companyData.item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {selectedContent.companyData.type === 'blog' ? '원문 보러가기' : '채용 공고 보러가기'}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] transition-opacity duration-300"
          onClick={handleCloseDrawer}
        />
      )}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}>
      <CommunityPageContent />
    </Suspense>
  );
}
