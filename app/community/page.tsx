'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Masonry from 'react-masonry-css';
import { CommunityFeedCard } from '@/components/ui/community-feed-card';
import { QnaCard } from '@/components/ui/qna-card';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { RecommendedPostsPanel } from '@/components/ui/recommended-posts-panel';
import { RecommendedFollowersPanel } from '@/components/ui/recommended-followers-panel';
import { TopPostsPanel } from '@/components/ui/top-posts-panel';
import { LoadMore } from '@/components/ui/load-more';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Users, X, ExternalLink, Loader2, PenSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInfinitePosts, useInfiniteQuestions, useFollowingPosts, useLikePost, useUnlikePost, useSavePost, useUnsavePost, useLikeQuestion, useUnlikeQuestion, useRecommendedPosts, useRecommendedFollowers, useCurrentUser, useFollowUser, useUnfollowUser, usePost, useComments, useCreateComment, useViewPost, useLikeComment, useUnlikeComment, useQuestion, useQuestionAnswers } from '@/lib/api';
import { toast } from 'sonner';
import { QnaDetail } from '@/components/ui/qna-detail';
import { PostDetail } from '@/components/ui/post-detail';
import type { QuestionListItem, PaginatedPostResponse, PaginatedQuestionResponse } from '@/lib/api';
import { useStore } from '@/hooks/useStore';


type UserProfile = {
  id: number;
  name: string;
  image_url: string;
  headline: string;
  description: string;
  small_image_url: string;
};

type SelectedContent = {
  type: 'post' | 'qna';
  id: string;
  userProfile?: UserProfile;
  questionData?: QuestionListItem;
};

// Post 상세 Drawer 컨텐츠 컴포넌트
function PostDetailDrawerContent({
  postId,
  isLiked,
  isSaved,
  onLike,
  onBookmark,
}: {
  postId: string;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onBookmark: () => void;
}) {
  const { data: post, isLoading, error } = usePost(Number(postId));
  const { data: user } = useCurrentUser();
  const { data: commentsData } = useComments({ postId: Number(postId) });
  const { openLoginModal } = useStore();

  const createComment = useCreateComment();
  const viewPost = useViewPost();
  const likeComment = useLikeComment();
  const unlikeComment = useUnlikeComment();

  const [commentLikes, setCommentLikes] = React.useState<Record<number, boolean>>({});

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
      userName: comment.author_name,
      userImage: undefined,
      userHeadline: undefined,
      content: comment.content,
      createdAt: new Date(comment.createdat).toLocaleDateString('ko-KR'),
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

  const userProfile = post.author
    ? {
        id: post.author.id,
        name: post.author.name,
        image_url: post.author.image_url,
        headline: post.author.headline,
        title: post.author.headline,
      }
    : {
        id: post.userid,
        name: '알 수 없는 사용자',
        image_url: undefined,
        headline: '탈퇴한 사용자',
        title: '탈퇴한 사용자',
      };

  return (
    <div className="p-4">
      <PostDetail
        postId={postId}
        userProfile={userProfile}
        content={post.description}
        contentHtml={post.descriptionhtml}
        createdAt={post.createdat}
        stats={{
          likeCount: post.like_count || 0,
          replyCount: commentsData?.count || post.comment_count || 0,
          viewCount: post.view_count || 0,
        }}
        imageUrls={[]}
        comments={transformedComments}
        onLike={onLike}
        onShare={() => {
          const url = `${window.location.origin}/community/post/${postId}`;
          navigator.clipboard.writeText(url);
          toast.success('링크가 복사되었습니다');
        }}
        onBookmark={onBookmark}
        onCommentLike={handleCommentLike}
        onCommentSubmit={handleCommentSubmit}
        liked={isLiked}
        bookmarked={isSaved}
        currentUser={user ? { name: user.name, image_url: user.image_url } : undefined}
      />
    </div>
  );
}

// Q&A 상세 Drawer 컨텐츠 컴포넌트
function QnaDetailDrawerContent({
  questionData,
}: {
  questionData: QuestionListItem;
}) {
  const { data: user } = useCurrentUser();

  // 답변 데이터 변환 (questionData.answers가 있으면 사용, 없으면 빈 배열)
  const transformedAnswers = (questionData as any).answers?.map((answer: any) => ({
    id: answer.id,
    userId: answer.user_id,
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

  return (
    <div className="p-6">
      <QnaDetail
        qnaId={questionData.id.toString()}
        title={questionData.title}
        description={(questionData as any).description || questionData.title}
        createdAt={questionData.createdat}
        updatedAt={questionData.updatedat}
        hashTagNames=""
        viewCount={0}
        likeCount={questionData.like_count || 0}
        dislikeCount={0}
        status={questionData.status}
        isPublic={questionData.ispublic}
        answers={transformedAnswers}
        onLike={() => {}}
        onDislike={() => {}}
        onAnswerLike={() => {}}
        onAnswerDislike={() => {}}
        onAnswerSubmit={() => {}}
        onAcceptAnswer={() => {}}
        currentUser={user ? { name: user.name, image_url: user.image_url } : undefined}
      />
    </div>
  );
}

function CommunityPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 탭 읽기 (기본값: 'feed')
  const currentTab = (searchParams.get('tab') as 'feed' | 'qna' | 'following') || 'feed';
  const postIdFromUrl = searchParams.get('post');
  const qnaIdFromUrl = searchParams.get('qna');

  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);
  const [contentFilter, setContentFilter] = React.useState<'feed' | 'qna' | 'following'>(currentTab);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<SelectedContent | null>(null);

  // 좋아요 상태 관리 (postId -> liked 상태)
  const [likedPosts, setLikedPosts] = React.useState<Record<number, boolean>>({});
  // 북마크 상태 관리 (postId -> saved 상태)
  const [savedPosts, setSavedPosts] = React.useState<Record<number, boolean>>({});
  // Q&A 좋아요 상태 관리
  const [questionLikes, setQuestionLikes] = React.useState<Record<number, { liked: boolean; disliked: boolean }>>({});

  // Get current user and login modal state
  const { data: user } = useCurrentUser();
  const { openLoginModal } = useStore();

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'feed' | 'qna' | 'following') => {
    setContentFilter(tab);
    // URL 업데이트
    if (tab === 'feed') {
      router.push('/community');
    } else {
      router.push(`/community?tab=${tab}`);
    }
  };

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
    data: questionsData,
    isLoading: isLoadingQuestions,
    error: questionsError,
    fetchNextPage: fetchNextQuestions,
    hasNextPage: hasNextQuestions,
    isFetchingNextPage: isFetchingNextQuestions
  } = useInfiniteQuestions();

  // Recommended Posts (팔로잉 기반 또는 글로벌 트렌딩)
  const {
    data: recommendedPostsData,
    isLoading: isLoadingRecommendedPosts,
  } = useRecommendedPosts(5);

  // Recommended Followers (friends of friends 또는 popular authors)
  const {
    data: recommendedFollowersData,
    isLoading: isLoadingRecommendedFollowers,
  } = useRecommendedFollowers(5);

  // Following Posts (팔로잉하는 사람의 포스트)
  const {
    data: followingPostsData,
    isLoading: isLoadingFollowingPosts,
    error: followingPostsError,
  } = useFollowingPosts(1);

  // Mutations
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const savePost = useSavePost();
  const unsavePost = useUnsavePost();
  const likeQuestion = useLikeQuestion();
  const unlikeQuestion = useUnlikeQuestion();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // URL과 상태 동기화
  React.useEffect(() => {
    setContentFilter(currentTab);
  }, [currentTab]);

  // URL 파라미터로 drawer 열기
  React.useEffect(() => {
    if (postIdFromUrl) {
      setSelectedContent({ type: 'post', id: postIdFromUrl });
      setDrawerOpen(true);
    } else if (qnaIdFromUrl) {
      // QnA의 경우 questionData가 필요하므로 별도 처리 필요
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
        (page as PaginatedPostResponse).results.forEach((post) => {
          initialLikedState[post.id] = post.is_liked;
          initialSavedState[post.id] = post.is_saved;
        });
      });
      setLikedPosts(prev => ({ ...prev, ...initialLikedState }));
      setSavedPosts(prev => ({ ...prev, ...initialSavedState }));
    }
  }, [postsData]);

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
        (page as PaginatedQuestionResponse).results.forEach((question) => {
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
      router.push('/community/new/post');
    } else {
      openLoginModal();
    }
  };

  // 공유하기 핸들러
  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/community/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('링크가 클립보드에 복사되었습니다');
    } catch (error) {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  const handleLoadMore = () => {
    if (contentFilter === 'feed') {
      if (hasNextPosts && !isFetchingNextPosts) {
        fetchNextPosts();
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
    // Flatten all pages
    const feedItems = ((postsData?.pages as PaginatedPostResponse[] | undefined)?.flatMap(page => page.results) || []).map((item, idx) => ({
      type: 'feed' as const,
      data: item,
      originalIndex: idx,
    }));

    const qnaItems = ((questionsData?.pages as PaginatedQuestionResponse[] | undefined)?.flatMap(page => page.results) || []).map((item, idx) => ({
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

    return result;
  }, [postsData, questionsData]);

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
    return allContent.filter(item => item.type === contentFilter);
  }, [allContent, contentFilter, followingPostsData]);

  // Loading state
  const isLoading = isLoadingPosts || isLoadingQuestions || isFetchingNextPosts || isFetchingNextQuestions || (contentFilter === 'following' && isLoadingFollowingPosts);

  // Error state
  const hasError = postsError || questionsError || (contentFilter === 'following' && followingPostsError);

  // Check if there's more data to load
  const hasMoreData = contentFilter === 'feed'
    ? hasNextPosts
    : contentFilter === 'qna'
      ? hasNextQuestions
      : contentFilter === 'following'
        ? false // Following uses single page for now
        : hasNextPosts || hasNextQuestions;

  // Transform recommended posts data for RecommendedPostsPanel
  const recommendedPosts = React.useMemo(() => {
    if (!recommendedPostsData || recommendedPostsData.length === 0) return [];

    return recommendedPostsData.map((post) => ({
      id: post.id.toString(),
      title: post.title || post.description.substring(0, 50) + '...',
      author: {
        name: post.author?.name || '알 수 없음',
        image_url: post.author?.image_url,
      },
      likeCount: post.like_count,
      href: `/community/post/${post.id}`,
    }));
  }, [recommendedPostsData]);

  // Transform recommended followers data for RecommendedFollowersPanel
  const recommendedFollowers = React.useMemo(() => {
    if (!recommendedFollowersData || recommendedFollowersData.length === 0) return [];

    return recommendedFollowersData.map((follower) => ({
      id: follower.id.toString(),
      name: follower.name,
      image_url: follower.image_url || undefined,
      headline: follower.headline || undefined,
      isFollowing: false, // TODO: 팔로잉 상태 확인 API 필요
      href: `/profile/${follower.id}`,
    }));
  }, [recommendedFollowersData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Main Content */}
      <main className="lg:col-span-9">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="pt-16 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-10 w-10 text-slate-700" />
                  <h1 className="text-3xl font-bold text-slate-900">Community</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Chip
                    variant={contentFilter === 'feed' ? 'selected' : 'default'}
                    onClick={() => handleTabChange('feed')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Feed
                  </Chip>
                  <Chip
                    variant={contentFilter === 'qna' ? 'selected' : 'default'}
                    onClick={() => handleTabChange('qna')}
                  >
                    Q&A
                  </Chip>
                  <Chip
                    variant={contentFilter === 'following' ? 'selected' : 'default'}
                    onClick={() => handleTabChange('following')}
                  >
                    <Users className="h-4 w-4" />
                    팔로잉
                  </Chip>
                </div>
                <Button
                  variant="coral"
                  onClick={handleWriteClick}
                  className="flex items-center gap-2"
                >
                  <PenSquare className="h-4 w-4" />
                  글쓰기
                </Button>
              </div>
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

          {/* Empty State */}
          {!isLoading && !hasError && filteredContent.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No content available.</p>
            </div>
          )}

          {/* Masonry 2-Column Layout */}
          {filteredContent.length > 0 && (
            <Masonry
              breakpointCols={{ default: 2, 768: 1 }}
              className="flex -ml-6 w-auto"
              columnClassName="pl-6 bg-clip-padding"
            >
              {filteredContent.map((item, idx) => {
                if (item.type === 'feed') {
                  const post = item.data;
                  // Map API response to component props
                  const userProfile: UserProfile = post.author ? {
                    id: post.author.id,
                    name: post.author.name,
                    image_url: post.author.image_url || '',
                    headline: post.author.headline || '',
                    description: post.author.description || '',
                    small_image_url: post.author.image_url || '',
                  } : {
                    id: post.userid,
                    name: '알 수 없는 사용자',
                    image_url: '',
                    headline: '',
                    description: '',
                    small_image_url: '',
                  };

                  return (
                    <div key={`feed-${post.id}`} className="mb-6">
                      <CommunityFeedCard
                        userProfile={userProfile}
                        content={post.description}
                        contentHtml={post.description} // API doesn't provide HTML separately in list
                        createdAt={post.createdat}
                        stats={{
                          likeCount: post.like_count || 0,
                          replyCount: post.comment_count || 0,
                          viewCount: post.view_count || 0,
                        }}
                        imageUrls={[]} // Not available in list view
                        onClick={() => handleOpenPost(post.id.toString(), userProfile)}
                        onLike={() => handleLikePost(post.id)}
                        onShare={() => handleShare(post.id.toString())}
                        onBookmark={() => handleBookmarkPost(post.id)}
                        liked={likedPosts[post.id] || false}
                        bookmarked={savedPosts[post.id] || false}
                      />
                    </div>
                  );
                } else if (item.type === 'qna') {
                  const question = item.data;
                  // Map author fields to author object for QnaCard component
                  const author = {
                    id: question.user_id,
                    name: question.author_name,
                    email: '',
                    image_url: (question as any).author_image_url || null,
                    headline: (question as any).author_headline || null,
                  };

                  return (
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
                        likeCount={question.like_count || 0}
                        dislikeCount={0}
                        viewCount={0}
                        hashTagNames=""
                        qnaId={question.id}
                        onClick={() => handleOpenQna(question.id.toString(), question)}
                        onLike={() => handleLikeQuestion(question.id)}
                        onDislike={() => handleDislikeQuestion(question.id)}
                        liked={questionLikes[question.id]?.liked || false}
                        disliked={questionLikes[question.id]?.disliked || false}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </Masonry>
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

      {/* Right Sidebar */}
      <aside className="lg:col-span-3">
        <div className="space-y-4 pt-16">
          {/* Top Posts (인기글 - 주간/월간) */}
          <TopPostsPanel
            maxItems={10}
            onPostClick={(postId) => handleOpenPost(postId)}
          />

          {/* Recommended Posts (추천 포스트) */}
          <RecommendedPostsPanel
            posts={recommendedPosts}
            maxItems={5}
            onPostClick={(postId) => handleOpenPost(postId)}
          />

          {/* Recommended Followers (추천 팔로워) */}
          <RecommendedFollowersPanel
            followers={recommendedFollowers}
            maxItems={5}
            onFollow={(userId) => followUser.mutate(userId)}
            onUnfollow={(userId) => unfollowUser.mutate(userId)}
          />
        </div>
      </aside>

      {/* Right Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selectedContent && (
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              {selectedContent.type === 'post' && selectedContent.userProfile ? (
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => window.open(`/profile/${selectedContent.userProfile?.id}`, '_blank')}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                    aria-label="프로필 보기"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedContent.userProfile.small_image_url || selectedContent.userProfile.image_url}
                        alt={selectedContent.userProfile.name}
                      />
                      <AvatarFallback>
                        {selectedContent.userProfile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">
                          {selectedContent.userProfile.name}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                      </div>
                      <span className="text-xs text-slate-600">
                        {selectedContent.userProfile.headline}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedContent.type === 'post' ? '게시글' : '질문'}
                </h2>
              )}
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
                />
              )}
              {selectedContent.type === 'qna' && selectedContent.questionData && (
                <QnaDetailDrawerContent questionData={selectedContent.questionData} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
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
