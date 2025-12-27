'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityFeedCard } from '@/components/ui/community-feed-card';
import { QnaCard } from '@/components/ui/qna-card';
import {
  Briefcase,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  UserPlus,
  UserMinus,
  Loader2,
  Link as LinkIcon,
  MoreVertical,
  Flag,
  Ban,
  ShieldOff,
  Plus,
  Edit,
  Trash2,
  X,
  Bookmark,
  Check,
  Save,
  Camera,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthPicker } from '@/components/ui/month-picker';
import * as Dialog from '@radix-ui/react-dialog';
import {
  useProfileById,
  useInfinitePosts,
  useInfiniteQuestions,
  useFollowStatus,
  useFollowUser,
  useUnfollowUser,
  useInfiniteUserFollowers,
  useInfiniteUserFollowing,
  useCurrentUser,
  useReportContent,
  useBlockUser,
  useUnblockUser,
  useIsUserBlocked,
  useUpdateMyProfile,
  useUploadProfileImage,
  useDeleteCareer,
  useDeleteEducation,
  useAddCareer,
  useUpdateCareer,
  useAddEducation,
  useUpdateEducation,
  useInfiniteMySavedPosts,
  useReplaceProfileSkills,
  searchSkills,
  usePost,
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useLikeComment,
  useUnlikeComment,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useViewPost,
  useDeletePost,
  useQuestion,
  useCreateQuestionAnswer,
  useUpdateAnswer,
  useDeleteAnswer,
  CONTENT_TYPE,
  useInfiniteChatSessions,
  useDeleteChatSession,
} from '@/lib/api';
import type { Skill, FollowUser } from '@/lib/api';
import { FollowersModal } from '@/components/ui/followers-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { LoadMore } from '@/components/ui/load-more';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PostDetail } from '@/components/ui/post-detail';
import { QnaDetail } from '@/components/ui/qna-detail';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/date';
import { trackProfileView } from '@/lib/analytics';

type ContentTab = 'posts' | 'qna' | 'bookmarks' | 'ai-chats';

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

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* 모바일: 세로 레이아웃, PC: 가로 레이아웃 */}
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
        <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
        <div className="flex-1 space-y-2 text-center md:text-left md:pt-2 w-full">
          <Skeleton className="h-7 w-32 md:h-8 md:w-48 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-24 md:w-32 mx-auto md:mx-0" />
        </div>
        <Skeleton className="h-10 w-full md:w-24" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function UserProfilePage({ params }: { params: { profileId: string } }) {
  const router = useRouter();

  // API 데이터 가져오기
  const profileId = parseInt(params.profileId, 10);
  const { data: profile, isLoading, error } = useProfileById(profileId);
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useCurrentUser();

  // 본인 프로필 여부 (프로필의 user_id와 현재 사용자 id 비교)
  const isOwnProfile = profile && currentUser ? currentUser.id === profile.user_id : false;
  // currentUser와 profile 로드 완료 후 본인 프로필인지 확인된 상태
  const isOwnProfileConfirmed = !isLoadingCurrentUser && !isLoading && isOwnProfile;

  // 탭 상태 (본인 프로필일 때만 사용)
  const [activeTab, setActiveTab] = useState<ContentTab>('posts');

  // 편집 상태 (본인 프로필일 때만 사용)
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [basicInfoValues, setBasicInfoValues] = useState({ name: '', headline: '', openToWork: '' });

  // 경력/학력 추가 폼 상태
  const [showAddCareer, setShowAddCareer] = useState(false);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [editingCareer, setEditingCareer] = useState<number | null>(null);
  const [editingEducation, setEditingEducation] = useState<number | null>(null);

  // 삭제 확인 다이얼로그 상태
  const [deleteCareerConfirm, setDeleteCareerConfirm] = useState<{ isOpen: boolean; careerId: number | null }>({ isOpen: false, careerId: null });
  const [deleteEducationConfirm, setDeleteEducationConfirm] = useState<{ isOpen: boolean; educationId: number | null }>({ isOpen: false, educationId: null });

  // 팔로워/팔로잉 모달 상태
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  // 상세 drawer 상태
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedQnaId, setSelectedQnaId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'post' | 'qna'>('post');

  // 낙관적 업데이트를 위한 로컬 팔로잉 상태
  // optimisticFollowIds: 팔로우한 ID (추가)
  // optimisticUnfollowIds: 언팔로우한 ID (제거)
  const [optimisticFollowIds, setOptimisticFollowIds] = useState<Set<number>>(new Set());
  const [optimisticUnfollowIds, setOptimisticUnfollowIds] = useState<Set<number>>(new Set());

  // 경력 폼 데이터
  const [careerForm, setCareerForm] = useState({
    company: '',
    title: '',
    type: 'full_time',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
  });

  // 학력 폼 데이터
  const [educationForm, setEducationForm] = useState({
    institute: '',
    major: '',
    type: 'bachelor',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
  });

  // GA4: profile_view 이벤트 트래킹
  useEffect(() => {
    if (!isLoadingCurrentUser && profile) {
      trackProfileView(String(profile.user_id), isOwnProfile);
    }
  }, [profile, isOwnProfile, isLoadingCurrentUser]);

  // 프로필 데이터 로드 시 상태 초기화
  useEffect(() => {
    if (profile && isOwnProfile) {
      setDescriptionValue(profile.long_description || '');
      setBasicInfoValues({
        name: profile.name || '',
        headline: profile.headline || '',
        openToWork: profile.open_to_work_status || '',
      });
    }
  }, [profile, isOwnProfile]);

  // 해당 사용자의 게시글/질문 가져오기 (무한 스크롤)
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
  } = useInfinitePosts({ user_id: profile?.user_id });

  const {
    data: questionsData,
    isLoading: isLoadingQuestions,
    fetchNextPage: fetchNextQuestions,
    hasNextPage: hasNextQuestions,
    isFetchingNextPage: isFetchingNextQuestions,
  } = useInfiniteQuestions({ user_id: profile?.user_id });

  // 본인 프로필일 때 북마크 데이터
  const {
    data: myBookmarksData,
    isLoading: isLoadingMyBookmarks,
    fetchNextPage: fetchNextBookmarks,
    hasNextPage: hasNextBookmarks,
    isFetchingNextPage: isFetchingNextBookmarks,
  } = useInfiniteMySavedPosts(isOwnProfileConfirmed);

  // 내 AI 채팅 세션 목록 조회 (본인 프로필에서만)
  const {
    data: chatSessionsData,
    isLoading: isLoadingChatSessions,
    fetchNextPage: fetchNextChatSessions,
    hasNextPage: hasNextChatSessions,
    isFetchingNextPage: isFetchingNextChatSessions,
  } = useInfiniteChatSessions(20, {
    enabled: isOwnProfileConfirmed,
  });

  // AI 채팅 세션 삭제
  const deleteChatSession = useDeleteChatSession({
    onSuccess: () => {
      toast.success('대화가 삭제되었습니다');
    },
    onError: () => {
      toast.error('대화 삭제에 실패했습니다');
    },
  });

  // 팔로우 상태 조회 (로그인한 경우에만, 자기 자신이 아닐 때만)
  const { data: followStatus, isLoading: isLoadingFollowStatus } = useFollowStatus(
    isOwnProfile ? undefined : profile?.user_id
  );

  // 해당 프로필 유저의 팔로워/팔로잉 목록 조회 (무한 스크롤, 모달이 열릴 때만)
  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    fetchNextPage: fetchNextFollowers,
    hasNextPage: hasNextFollowers,
    isFetchingNextPage: isFetchingNextFollowers,
  } = useInfiniteUserFollowers(profile?.user_id, followersModalOpen);

  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    fetchNextPage: fetchNextFollowing,
    hasNextPage: hasNextFollowing,
    isFetchingNextPage: isFetchingNextFollowing,
  } = useInfiniteUserFollowing(profile?.user_id, followingModalOpen);

  // 내(현재 로그인 유저)의 팔로잉 목록 조회 (모달이 열릴 때만, 타인 프로필일 때만)
  const isModalOpen = followersModalOpen || followingModalOpen;
  const {
    data: myFollowingData,
    fetchNextPage: fetchNextMyFollowing,
    hasNextPage: hasNextMyFollowing,
  } = useInfiniteUserFollowing(currentUser?.id, isModalOpen && !isOwnProfile && !!currentUser?.id);

  // 내 팔로잉 전체를 가져오기 위해 hasNextPage가 있으면 자동으로 다음 페이지 로드
  useEffect(() => {
    if (hasNextMyFollowing && isModalOpen && !isOwnProfile) {
      fetchNextMyFollowing();
    }
  }, [hasNextMyFollowing, isModalOpen, isOwnProfile, fetchNextMyFollowing]);

  // 해당 프로필 유저의 팔로워/팔로잉 데이터를 평탄화
  const flatFollowers = followersData?.pages.flatMap(page => page.results) ?? [];
  const flatFollowing = followingData?.pages.flatMap(page => page.results) ?? [];
  const followersCount = followersData?.pages[0]?.count;
  const followingCount = followingData?.pages[0]?.count;

  // 내 팔로잉 목록에서 ID 추출 (본인 프로필이면 flatFollowing 사용)
  const myFlatFollowing = isOwnProfile
    ? flatFollowing
    : (myFollowingData?.pages.flatMap(page => page.results) ?? []);
  const myServerFollowingIds = new Set(myFlatFollowing.map(f => f.user?.id).filter(Boolean) as number[]);

  // 낙관적 업데이트와 내 팔로잉 데이터를 병합한 최종 팔로잉 상태
  // (내 서버 데이터 + 새로 팔로우한 ID) - 언팔로우한 ID
  const mergedFollowingIds = new Set(
    [...myServerFollowingIds, ...optimisticFollowIds].filter(id => !optimisticUnfollowIds.has(id))
  );

  // 팔로우/언팔로우 mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // 모달 내 팔로우 핸들러 (낙관적 업데이트 적용)
  const handleModalFollow = (targetUserId: number) => {
    // 낙관적 업데이트: 즉시 UI 반영
    setOptimisticFollowIds(prev => new Set([...prev, targetUserId]));
    setOptimisticUnfollowIds(prev => {
      const next = new Set(prev);
      next.delete(targetUserId);
      return next;
    });
    followMutation.mutate(targetUserId, {
      onError: () => {
        // 실패 시 롤백
        setOptimisticFollowIds(prev => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      },
    });
  };

  // 모달 내 언팔로우 핸들러 (낙관적 업데이트 적용)
  const handleModalUnfollow = (targetUserId: number) => {
    // 낙관적 업데이트: 즉시 UI 반영
    setOptimisticUnfollowIds(prev => new Set([...prev, targetUserId]));
    setOptimisticFollowIds(prev => {
      const next = new Set(prev);
      next.delete(targetUserId);
      return next;
    });
    unfollowMutation.mutate(targetUserId, {
      onError: () => {
        // 실패 시 롤백
        setOptimisticUnfollowIds(prev => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      },
    });
  };

  // 신고/차단 관련
  const reportMutation = useReportContent();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const { data: isBlocked, isLoading: isLoadingBlockStatus } = useIsUserBlocked(
    isOwnProfile ? 0 : (profile?.user_id || 0)
  );

  // 본인 프로필 편집 mutations
  const updateProfile = useUpdateMyProfile();
  const uploadProfileImage = useUploadProfileImage();
  const deleteCareer = useDeleteCareer();
  const deleteEducation = useDeleteEducation();
  const addCareer = useAddCareer();
  const updateCareer = useUpdateCareer();
  const addEducation = useAddEducation();
  const updateEducation = useUpdateEducation();
  const replaceSkills = useReplaceProfileSkills();

  // 게시글 상세 관련 hooks
  const { data: selectedPost, isLoading: isLoadingSelectedPost } = usePost(selectedPostId || 0, {
    enabled: !!selectedPostId,
  });
  const { data: commentsData } = useComments(
    { postId: selectedPostId || 0 },
    { enabled: !!selectedPostId }
  );
  const createComment = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const savePostMutation = useSavePost();
  const unsavePostMutation = useUnsavePost();
  const viewPostMutation = useViewPost();
  const deletePostMutation = useDeletePost();

  // 게시글 상세 drawer 좋아요/북마크 상태
  const [postLiked, setPostLiked] = useState(false);
  const [postSaved, setPostSaved] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});

  // 선택된 게시글 ID가 변경될 때만 상태 초기화 (Optimistic Update와 충돌 방지)
  const prevSelectedPostIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (selectedPostId && selectedPostId !== prevSelectedPostIdRef.current && selectedPost) {
      setPostLiked(selectedPost.is_liked || false);
      setPostSaved(selectedPost.is_saved || false);
      // 조회수 증가
      viewPostMutation.mutate(selectedPostId);
      prevSelectedPostIdRef.current = selectedPostId;
    }
    // 게시글 닫을 때 ref 초기화
    if (!selectedPostId) {
      prevSelectedPostIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPostId, selectedPost]);

  // 댓글 좋아요 상태 초기화
  useEffect(() => {
    if (commentsData?.results) {
      const initialLikes: Record<number, boolean> = {};
      commentsData.results.forEach(comment => {
        initialLikes[comment.id] = comment.is_liked || false;
      });
      setCommentLikes(initialLikes);
    }
  }, [commentsData]);

  // Drawer 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // 게시글 클릭 핸들러
  const handleOpenPost = (postId: number) => {
    setSelectedPostId(postId);
    setDrawerType('post');
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedPostId(null);
      setSelectedQnaId(null);
    }, 300);
  };

  // 게시글 좋아요 핸들러
  const handlePostLike = () => {
    if (!currentUser || !selectedPostId) return;
    const isCurrentlyLiked = postLiked;
    setPostLiked(!isCurrentlyLiked);
    if (isCurrentlyLiked) {
      unlikePostMutation.mutate(selectedPostId, {
        onError: () => setPostLiked(true),
      });
    } else {
      likePostMutation.mutate(selectedPostId, {
        onError: () => setPostLiked(false),
      });
    }
  };

  // 게시글 북마크 핸들러
  const handlePostBookmark = () => {
    if (!currentUser || !selectedPostId) return;
    const isCurrentlySaved = postSaved;
    setPostSaved(!isCurrentlySaved);
    if (isCurrentlySaved) {
      unsavePostMutation.mutate(selectedPostId, {
        onError: () => setPostSaved(true),
      });
    } else {
      savePostMutation.mutate(selectedPostId, {
        onError: () => setPostSaved(false),
      });
    }
  };

  // 댓글 작성 핸들러
  const handleCommentSubmit = async (content: string) => {
    if (!currentUser || !selectedPostId) return;
    try {
      await createComment.mutateAsync({
        post_id: selectedPostId,
        content,
      });
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  // 댓글 좋아요 핸들러
  const handleCommentLike = (commentId: number) => {
    if (!currentUser) return;
    const isCurrentlyLiked = commentLikes[commentId] || false;
    setCommentLikes(prev => ({ ...prev, [commentId]: !isCurrentlyLiked }));
    if (isCurrentlyLiked) {
      unlikeCommentMutation.mutate(commentId, {
        onError: () => setCommentLikes(prev => ({ ...prev, [commentId]: true })),
      });
    } else {
      likeCommentMutation.mutate(commentId, {
        onError: () => setCommentLikes(prev => ({ ...prev, [commentId]: false })),
      });
    }
  };

  // 댓글 수정 핸들러
  const handleCommentEdit = (commentId: number, content: string) => {
    updateCommentMutation.mutate({ id: commentId, data: { content } });
  };

  // 댓글 삭제 핸들러
  const handleCommentDelete = (commentId: number) => {
    if (!selectedPostId) return;
    deleteCommentMutation.mutate({ id: commentId, postId: selectedPostId });
  };

  // 댓글 데이터 변환
  const transformedComments = commentsData?.results?.map((comment) => ({
    id: comment.id,
    userId: comment.user_id,
    userName: comment.author_name,
    userImage: comment.author_image_url,
    userHeadline: comment.author_headline,
    content: comment.content,
    createdAt: formatRelativeTime(comment.createdat),
    likeCount: comment.like_count || 0,
    liked: commentLikes[comment.id] ?? comment.is_liked ?? false,
  })) || [];

  // Q&A 상세 관련 hooks
  const { data: selectedQuestion, isLoading: isLoadingSelectedQuestion } = useQuestion(
    selectedQnaId || 0,
    { enabled: !!selectedQnaId }
  );
  const createAnswer = useCreateQuestionAnswer();
  const updateAnswerMutation = useUpdateAnswer();
  const deleteAnswerMutation = useDeleteAnswer();

  // Q&A 클릭 핸들러
  const handleOpenQna = (qnaId: number) => {
    setSelectedQnaId(qnaId);
    setDrawerType('qna');
    setDrawerOpen(true);
  };

  // 답변 작성 핸들러
  const handleAnswerSubmit = async (content: string) => {
    if (!currentUser || !selectedQnaId) return;
    try {
      await createAnswer.mutateAsync({
        questionId: selectedQnaId,
        description: content,
      });
    } catch (error) {
      console.error('Failed to create answer:', error);
    }
  };

  // 답변 수정 핸들러
  const handleAnswerEdit = (answerId: number, content: string) => {
    if (!selectedQnaId) return;
    updateAnswerMutation.mutate({
      id: answerId,
      questionId: selectedQnaId,
      data: { description: content },
    });
  };

  // 답변 삭제 핸들러
  const handleAnswerDelete = (answerId: number) => {
    if (!selectedQnaId) return;
    deleteAnswerMutation.mutate({
      id: answerId,
      questionId: selectedQnaId,
    });
  };

  // 답변 데이터 변환
  const transformedAnswers = (selectedQuestion as any)?.answers?.map((answer: any) => ({
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

  // 프로필 이미지 업로드용 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 이미지 업로드 핸들러
  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    uploadProfileImage.mutate(file);

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 스킬 편집 상태
  const [editingSkills, setEditingSkills] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Array<{ id: number; name: string; category: string }>>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillSearchResults, setSkillSearchResults] = useState<Skill[]>([]);
  const [isSearchingSkills, setIsSearchingSkills] = useState(false);

  // 스킬 편집 다이얼로그 열 때 기존 스킬로 초기화
  const handleOpenSkillEditor = () => {
    if (profile?.skills) {
      setSelectedSkills(profile.skills.map(s => ({
        id: s.skill_id,
        name: s.name,
        category: s.category,
      })));
    }
    setEditingSkills(true);
  };

  // 스킬 검색
  const handleSkillSearch = async (query: string) => {
    setSkillSearchQuery(query);
    if (query.length < 1) {
      setSkillSearchResults([]);
      return;
    }
    setIsSearchingSkills(true);
    try {
      const results = await searchSkills(query, 10);
      // 이미 선택된 스킬은 제외
      const selectedIds = new Set(selectedSkills.map(s => s.id));
      setSkillSearchResults(results.filter(r => !selectedIds.has(r.id)));
    } catch {
      setSkillSearchResults([]);
    } finally {
      setIsSearchingSkills(false);
    }
  };

  // 스킬 추가
  const handleAddSkill = (skill: Skill) => {
    setSelectedSkills(prev => [...prev, { id: skill.id, name: skill.name, category: skill.category }]);
    setSkillSearchQuery('');
    setSkillSearchResults([]);
  };

  // 스킬 제거
  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== skillId));
  };

  // 스킬 저장
  const handleSaveSkills = () => {
    replaceSkills.mutate(
      {
        skills: selectedSkills.map((s, idx) => ({
          skill_id: s.id,
          display_sequence: idx + 1,
        })),
      },
      {
        onSuccess: () => {
          setEditingSkills(false);
        },
      }
    );
  };

  const isFollowing = followStatus?.is_following ?? false;
  const isFollowedBy = followStatus?.is_followed_by ?? false;
  const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;
  const isBlockLoading = blockMutation.isPending || unblockMutation.isPending;

  const handleFollowToggle = () => {
    if (isFollowLoading || !profile?.user_id) return;

    if (isFollowing) {
      unfollowMutation.mutate(profile.user_id);
    } else {
      followMutation.mutate(profile.user_id);
    }
  };

  const handleReportProfile = () => {
    if (!currentUser || !profile?.user_id) {
      // TODO: Show login modal
      return;
    }
    reportMutation.mutate({ contentType: CONTENT_TYPE.PROFILE, contentId: profile.user_id });
  };

  const handleBlockToggle = () => {
    if (isBlockLoading || !currentUser || !profile?.user_id) return;

    if (isBlocked) {
      unblockMutation.mutate(profile.user_id);
    } else {
      blockMutation.mutate(profile.user_id);
    }
  };

  // 자기소개 저장
  const handleSaveDescription = async () => {
    try {
      await updateProfile.mutateAsync({ long_description: descriptionValue });
      setEditingDescription(false);
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  // 기본 정보 저장
  const handleSaveBasicInfo = async () => {
    try {
      await updateProfile.mutateAsync({
        name: basicInfoValues.name,
        headline: basicInfoValues.headline,
        open_to_work_status: basicInfoValues.openToWork,
      });
      setEditingBasicInfo(false);
    } catch (error) {
      console.error('Failed to update basic info:', error);
    }
  };

  // 경력 삭제 다이얼로그 열기
  const handleDeleteCareerClick = (careerId: number) => {
    setDeleteCareerConfirm({ isOpen: true, careerId });
  };

  // 경력 삭제 확인
  const handleConfirmDeleteCareer = async () => {
    if (!deleteCareerConfirm.careerId) return;
    try {
      await deleteCareer.mutateAsync(deleteCareerConfirm.careerId);
    } catch (error) {
      console.error('Failed to delete career:', error);
    } finally {
      setDeleteCareerConfirm({ isOpen: false, careerId: null });
    }
  };

  // 학력 삭제 다이얼로그 열기
  const handleDeleteEducationClick = (educationId: number) => {
    setDeleteEducationConfirm({ isOpen: true, educationId });
  };

  // 학력 삭제 확인
  const handleConfirmDeleteEducation = async () => {
    if (!deleteEducationConfirm.educationId) return;
    try {
      await deleteEducation.mutateAsync(deleteEducationConfirm.educationId);
    } catch (error) {
      console.error('Failed to delete education:', error);
    } finally {
      setDeleteEducationConfirm({ isOpen: false, educationId: null });
    }
  };

  // 경력 폼 초기화
  const resetCareerForm = () => {
    setCareerForm({
      company: '',
      title: '',
      type: 'full_time',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
    });
    setEditingCareer(null);
    setShowAddCareer(false);
  };

  // 학력 폼 초기화
  const resetEducationForm = () => {
    setEducationForm({
      institute: '',
      major: '',
      type: 'bachelor',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
    });
    setEditingEducation(null);
    setShowAddEducation(false);
  };

  // 경력 저장 (추가 또는 수정)
  const handleSaveCareer = async () => {
    try {
      const careerData = {
        company: careerForm.company,
        title: careerForm.title,
        type: careerForm.type,
        start_date: careerForm.start_date + '-01',
        end_date: careerForm.is_current ? undefined : (careerForm.end_date ? careerForm.end_date + '-01' : undefined),
        is_current: careerForm.is_current,
        description: careerForm.description || undefined,
      };

      if (editingCareer) {
        await updateCareer.mutateAsync({ careerId: editingCareer, data: careerData });
      } else {
        await addCareer.mutateAsync(careerData);
      }
      resetCareerForm();
    } catch (error) {
      console.error('Failed to save career:', error);
    }
  };

  // 학력 저장 (추가 또는 수정)
  const handleSaveEducation = async () => {
    try {
      const educationData = {
        institute: educationForm.institute,
        major: educationForm.major,
        type: educationForm.type,
        start_date: educationForm.start_date + '-01',
        end_date: educationForm.is_current ? undefined : (educationForm.end_date ? educationForm.end_date + '-01' : undefined),
        is_current: educationForm.is_current,
        description: educationForm.description || undefined,
      };

      if (editingEducation) {
        await updateEducation.mutateAsync({ educationId: editingEducation, data: educationData });
      } else {
        await addEducation.mutateAsync(educationData);
      }
      resetEducationForm();
    } catch (error) {
      console.error('Failed to save education:', error);
    }
  };

  // 경력 수정 시작
  const handleEditCareer = (career: any) => {
    setCareerForm({
      company: career.company,
      title: career.title,
      type: career.type,
      start_date: career.start_date ? career.start_date.substring(0, 7) : '',
      end_date: career.end_date ? career.end_date.substring(0, 7) : '',
      is_current: career.is_current === 1,
      description: career.description || '',
    });
    setEditingCareer(career.id);
    setShowAddCareer(true);
  };

  // 학력 수정 시작
  const handleEditEducation = (education: any) => {
    setEducationForm({
      institute: education.institute,
      major: education.major,
      type: education.type,
      start_date: education.start_date ? education.start_date.substring(0, 7) : '',
      end_date: education.end_date ? education.end_date.substring(0, 7) : '',
      is_current: education.is_current === 1,
      description: education.description || '',
    });
    setEditingEducation(education.id);
    setShowAddEducation(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '현재';
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">프로필을 찾을 수 없습니다.</p>
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // Generate fallback initials from display name
  const fallback = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header with Back Button */}
      <header className="w-full bg-slate-50 sticky top-0 z-50 safe-pt md:hidden">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2 hover:bg-slate-200">
              <ChevronLeft className="h-6 w-6 text-slate-900" />
            </Button>
            <span className="font-semibold text-slate-900">프로필</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        <div className="space-y-5 md:space-y-6">
          {/* Profile Header - 모바일: 세로 중앙정렬, PC: 가로 레이아웃 */}
          <div className="flex flex-col items-center gap-4 pb-5 border-b border-slate-200 md:flex-row md:items-center md:gap-6 md:pb-6">
            {/* 프로필 이미지 - 본인일 경우 클릭하여 변경 가능 */}
            <div className="relative group">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                {profile.image_url && <AvatarImage src={profile.image_url} alt={profile.name} />}
                <AvatarFallback className="text-lg md:text-xl font-semibold">{fallback}</AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProfileImage.isPending}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                  >
                    {uploadProfileImage.isPending ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>
                </>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">{profile.name}</h1>
              <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2">{profile.headline || '직무 미설정'}</p>

              {/* 팔로워수, 팔로잉수, 게시글수 */}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-600">
                <button
                  onClick={() => setFollowersModalOpen(true)}
                  className="hover:text-slate-900 transition-colors"
                >
                  <span className="font-semibold text-slate-900">
                    {profile.follower_count ?? 0}
                  </span>{' '}
                  팔로워
                </button>
                <button
                  onClick={() => setFollowingModalOpen(true)}
                  className="hover:text-slate-900 transition-colors"
                >
                  <span className="font-semibold text-slate-900">
                    {profile.following_count ?? 0}
                  </span>{' '}
                  팔로잉
                </button>
                <div>
                  <span className="font-semibold text-slate-900">
                    {postsData?.pages?.[0]?.count ?? 0}
                  </span>{' '}
                  게시글
                </div>
              </div>

              {profile.open_to_work_status === 'actively_looking' && (
                <Badge tone="coral" className="mt-3">
                  적극 구직 중
                </Badge>
              )}
              {profile.open_to_work_status === 'open' && (
                <Badge tone="success" className="mt-3">
                  이직 열려 있음
                </Badge>
              )}
            </div>

            {/* 본인 프로필: 편집 버튼, 타인 프로필: 팔로우/더보기 버튼 */}
            {isOwnProfile ? (
              <Button
                variant="outline"
                onClick={() => setEditingBasicInfo(true)}
                className="gap-2 w-full md:w-auto mt-2 md:mt-0"
              >
                <Edit className="h-4 w-4" />
                프로필 편집
              </Button>
            ) : (
              <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <div className="flex flex-col items-center md:items-end gap-1 flex-1 md:flex-none">
                  <Button
                    variant={isFollowing ? 'outline' : 'coral'}
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading || isLoadingFollowStatus}
                    className="gap-2 w-full md:w-auto"
                  >
                    {isFollowLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      <UserMinus className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {isFollowing ? '팔로잉' : '팔로우'}
                  </Button>
                  {isFollowedBy && !isFollowing && (
                    <span className="text-xs text-slate-500">나를 팔로우 중</span>
                  )}
                </div>

                {/* Report/Block Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 shrink-0"
                      aria-label="더보기"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleReportProfile} className="text-slate-700">
                      <Flag className="h-4 w-4 mr-2" />
                      프로필 신고하기
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleBlockToggle}
                      disabled={isBlockLoading || isLoadingBlockStatus}
                      className={isBlocked ? 'text-slate-700' : 'text-red-600'}
                    >
                      {isBlockLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : isBlocked ? (
                        <ShieldOff className="h-4 w-4 mr-2" />
                      ) : (
                        <Ban className="h-4 w-4 mr-2" />
                      )}
                      {isBlocked ? '차단 해제' : '이 사용자 차단하기'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* 기본 정보 편집 모달 */}
          <Dialog.Root open={editingBasicInfo} onOpenChange={setEditingBasicInfo}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                <Dialog.Title className="text-lg font-semibold text-slate-900 mb-4">
                  프로필 편집
                </Dialog.Title>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">이름</Label>
                    <Input
                      id="edit-name"
                      value={basicInfoValues.name}
                      onChange={(e) => setBasicInfoValues({ ...basicInfoValues, name: e.target.value })}
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-headline">직함</Label>
                    <Input
                      id="edit-headline"
                      value={basicInfoValues.headline}
                      onChange={(e) => setBasicInfoValues({ ...basicInfoValues, headline: e.target.value })}
                      placeholder="예: 소프트웨어 엔지니어 @ 회사명"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-opentowork">구직 상태</Label>
                    <Select
                      value={basicInfoValues.openToWork}
                      onValueChange={(value) => setBasicInfoValues({ ...basicInfoValues, openToWork: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="구직 상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_interested">이직 의향 없음</SelectItem>
                        <SelectItem value="open">이직에 열려 있음</SelectItem>
                        <SelectItem value="actively_looking">적극적으로 구직 중</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditingBasicInfo(false)}
                    disabled={updateProfile.isPending}
                  >
                    취소
                  </Button>
                  <Button
                    variant="coral"
                    onClick={handleSaveBasicInfo}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    저장
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* 소개 */}
          {(profile.description || profile.long_description || isOwnProfile) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-slate-900">소개</h2>
                {isOwnProfile && !editingDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDescription(true)}
                    className="h-8 px-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editingDescription ? (
                <div className="space-y-3">
                  <Textarea
                    value={descriptionValue}
                    onChange={(e) => setDescriptionValue(e.target.value)}
                    placeholder="자신을 소개해주세요..."
                    className="min-h-[120px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDescriptionValue(profile.long_description || '');
                        setEditingDescription(false);
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      variant="coral"
                      size="sm"
                      onClick={handleSaveDescription}
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      저장
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                  {profile.long_description || profile.description || (isOwnProfile && <span className="text-slate-400">아직 소개가 없습니다. 편집 버튼을 눌러 소개를 추가해보세요.</span>)}
                </p>
              )}
            </div>
          )}

          {/* 스킬 */}
          {((profile.skills && profile.skills.length > 0) || isOwnProfile) && (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  스킬
                </h2>
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenSkillEditor}
                    className="h-8 px-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {profile.skills.map((skill) => (
                    <Chip key={skill.id} variant="default">
                      {skill.name}
                    </Chip>
                  ))}
                </div>
              ) : isOwnProfile ? (
                <div className="text-center py-6 bg-slate-50/50 rounded-lg">
                  <p className="text-sm text-slate-500">아직 등록된 스킬이 없습니다.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleOpenSkillEditor}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    스킬 추가
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {/* 스킬 편집 다이얼로그 */}
          <Dialog.Root open={editingSkills} onOpenChange={setEditingSkills}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[95vw] max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <Dialog.Title className="text-lg font-semibold">스킬 편집</Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </Dialog.Close>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  {/* 스킬 검색 */}
                  <div className="space-y-2">
                    <Label>스킬 검색</Label>
                    <Input
                      placeholder="스킬 이름을 입력하세요"
                      value={skillSearchQuery}
                      onChange={(e) => handleSkillSearch(e.target.value)}
                    />
                    {/* 검색 결과 */}
                    {skillSearchResults.length > 0 && (
                      <div className="border rounded-lg max-h-40 overflow-y-auto">
                        {skillSearchResults.map((skill) => (
                          <button
                            key={skill.id}
                            className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center justify-between"
                            onClick={() => handleAddSkill(skill)}
                          >
                            <span className="text-sm">{skill.name}</span>
                            <span className="text-xs text-slate-500">{skill.category}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {isSearchingSkills && (
                      <div className="text-sm text-slate-500 text-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin inline-block mr-1" />
                        검색 중...
                      </div>
                    )}
                  </div>

                  {/* 선택된 스킬 목록 */}
                  <div className="space-y-2">
                    <Label>선택된 스킬 ({selectedSkills.length}개)</Label>
                    {selectedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1"
                          >
                            <span className="text-sm">{skill.name}</span>
                            <button
                              onClick={() => handleRemoveSkill(skill.id)}
                              className="text-slate-500 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">선택된 스킬이 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t">
                  <Dialog.Close asChild>
                    <Button variant="outline">취소</Button>
                  </Dialog.Close>
                  <Button
                    variant="coral"
                    onClick={handleSaveSkills}
                    disabled={replaceSkills.isPending}
                  >
                    {replaceSkills.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    저장
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* 사이트/링크 */}
          {profile.sites && profile.sites.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base md:text-lg font-bold text-slate-900">
                링크
              </h2>
              <div className="space-y-2 md:space-y-3">
                {profile.sites.map((site) => (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors overflow-hidden"
                  >
                    <LinkIcon className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm md:text-base">{site.name}</p>
                      <p className="text-xs md:text-sm text-slate-500 truncate">{site.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 경력 요약 */}
          {profile.career_duration && (
            <div className="space-y-2">
              <h2 className="text-base md:text-lg font-bold text-slate-900">경력 요약</h2>
              <p className="text-xs md:text-sm text-slate-600">
                총 경력 <span className="font-semibold text-slate-900">{profile.career_duration.career_year}년</span> ({profile.career_duration.total_career_duration_months}개월)
              </p>
            </div>
          )}

          {/* 경력 */}
          {(profile.careers && profile.careers.length > 0) || isOwnProfile ? (
            <div className="space-y-3 pt-5 md:pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-600" />
                  경력
                </h2>
                {isOwnProfile && !showAddCareer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetCareerForm();
                      setShowAddCareer(true);
                    }}
                    className="h-8 px-2 gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    추가
                  </Button>
                )}
              </div>

              {/* 경력 추가/수정 폼 */}
              {showAddCareer && isOwnProfile && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-900">
                    {editingCareer ? '경력 수정' : '경력 추가'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="career-company">회사명 *</Label>
                      <Input
                        id="career-company"
                        value={careerForm.company}
                        onChange={(e) => setCareerForm({ ...careerForm, company: e.target.value })}
                        placeholder="회사명"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="career-title">직함 *</Label>
                      <Input
                        id="career-title"
                        value={careerForm.title}
                        onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })}
                        placeholder="직함"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="career-type">고용 형태</Label>
                      <Select
                        value={careerForm.type}
                        onValueChange={(value) => setCareerForm({ ...careerForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">정규직</SelectItem>
                          <SelectItem value="part_time">파트타임</SelectItem>
                          <SelectItem value="contract">계약직</SelectItem>
                          <SelectItem value="intern">인턴</SelectItem>
                          <SelectItem value="freelance">프리랜서</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="career-start">시작일 *</Label>
                      <MonthPicker
                        id="career-start"
                        value={careerForm.start_date}
                        onChange={(value) => setCareerForm({ ...careerForm, start_date: value })}
                        placeholder="시작일 선택"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="career-end">종료일</Label>
                      <MonthPicker
                        id="career-end"
                        value={careerForm.end_date}
                        onChange={(value) => setCareerForm({ ...careerForm, end_date: value })}
                        placeholder="종료일 선택"
                        disabled={careerForm.is_current}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="career-current"
                        checked={careerForm.is_current}
                        onChange={(e) => setCareerForm({ ...careerForm, is_current: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <Label htmlFor="career-current" className="text-sm font-normal">현재 재직 중</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="career-desc">설명</Label>
                    <Textarea
                      id="career-desc"
                      value={careerForm.description}
                      onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })}
                      placeholder="담당 업무, 성과 등을 입력하세요"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={resetCareerForm}>
                      취소
                    </Button>
                    <Button
                      variant="coral"
                      size="sm"
                      onClick={handleSaveCareer}
                      disabled={!careerForm.company || !careerForm.title || !careerForm.start_date || addCareer.isPending || updateCareer.isPending}
                    >
                      {(addCareer.isPending || updateCareer.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {editingCareer ? '수정' : '추가'}
                    </Button>
                  </div>
                </div>
              )}

              {/* 경력 목록 */}
              {profile.careers && profile.careers.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {profile.careers.map((career) => (
                    <div key={career.id} className="space-y-1.5 md:space-y-2 p-3 bg-slate-50/50 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base text-slate-900">{career.title}</h3>
                          <p className="text-xs md:text-sm text-slate-600 mt-1">{career.company}</p>
                          <p className="text-xs md:text-sm text-slate-500 mt-1">
                            {formatDate(career.start_date)} -{' '}
                            {career.is_current ? '현재' : formatDate(career.end_date)}
                          </p>
                          {career.description && (
                            <p className="text-xs md:text-sm text-slate-600 mt-2 md:mt-3">{career.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {career.is_current === 1 && <Badge tone="success" className="shrink-0 text-xs">재직 중</Badge>}
                          {isOwnProfile && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditCareer(career)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteCareerClick(career.id)}
                                disabled={deleteCareer.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isOwnProfile && !showAddCareer ? (
                <div className="text-center py-6 bg-slate-50/50 rounded-lg">
                  <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">아직 등록된 경력이 없습니다.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      resetCareerForm();
                      setShowAddCareer(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    경력 추가
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* 학력 */}
          {(profile.educations && profile.educations.length > 0) || isOwnProfile ? (
            <div className="space-y-3 pt-5 md:pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-600" />
                  학력
                </h2>
                {isOwnProfile && !showAddEducation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetEducationForm();
                      setShowAddEducation(true);
                    }}
                    className="h-8 px-2 gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    추가
                  </Button>
                )}
              </div>

              {/* 학력 추가/수정 폼 */}
              {showAddEducation && isOwnProfile && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                  <h3 className="font-semibold text-sm text-slate-900">
                    {editingEducation ? '학력 수정' : '학력 추가'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edu-institute">학교명 *</Label>
                      <Input
                        id="edu-institute"
                        value={educationForm.institute}
                        onChange={(e) => setEducationForm({ ...educationForm, institute: e.target.value })}
                        placeholder="학교명"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edu-major">전공 *</Label>
                      <Input
                        id="edu-major"
                        value={educationForm.major}
                        onChange={(e) => setEducationForm({ ...educationForm, major: e.target.value })}
                        placeholder="전공"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edu-type">학위</Label>
                      <Select
                        value={educationForm.type}
                        onValueChange={(value) => setEducationForm({ ...educationForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high_school">고등학교</SelectItem>
                          <SelectItem value="associate">전문학사</SelectItem>
                          <SelectItem value="bachelor">학사</SelectItem>
                          <SelectItem value="master">석사</SelectItem>
                          <SelectItem value="doctorate">박사</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edu-start">시작일 *</Label>
                      <MonthPicker
                        id="edu-start"
                        value={educationForm.start_date}
                        onChange={(value) => setEducationForm({ ...educationForm, start_date: value })}
                        placeholder="시작일 선택"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edu-end">종료일</Label>
                      <MonthPicker
                        id="edu-end"
                        value={educationForm.end_date}
                        onChange={(value) => setEducationForm({ ...educationForm, end_date: value })}
                        placeholder="종료일 선택"
                        disabled={educationForm.is_current}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="edu-current"
                        checked={educationForm.is_current}
                        onChange={(e) => setEducationForm({ ...educationForm, is_current: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <Label htmlFor="edu-current" className="text-sm font-normal">재학 중</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edu-desc">설명</Label>
                    <Textarea
                      id="edu-desc"
                      value={educationForm.description}
                      onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                      placeholder="활동, 성적 등을 입력하세요"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={resetEducationForm}>
                      취소
                    </Button>
                    <Button
                      variant="coral"
                      size="sm"
                      onClick={handleSaveEducation}
                      disabled={!educationForm.institute || !educationForm.major || !educationForm.start_date || addEducation.isPending || updateEducation.isPending}
                    >
                      {(addEducation.isPending || updateEducation.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {editingEducation ? '수정' : '추가'}
                    </Button>
                  </div>
                </div>
              )}

              {/* 학력 목록 */}
              {profile.educations && profile.educations.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {profile.educations.map((edu) => (
                    <div key={edu.id} className="space-y-1.5 md:space-y-2 p-3 bg-slate-50/50 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base text-slate-900">{edu.institute}</h3>
                          <p className="text-xs md:text-sm text-slate-600">{edu.major}</p>
                          <p className="text-xs md:text-sm text-slate-500">
                            {formatDate(edu.start_date)} - {edu.is_current ? '현재' : formatDate(edu.end_date)}
                          </p>
                          {edu.description && (
                            <p className="text-xs md:text-sm text-slate-600 mt-2">{edu.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {edu.is_current === 1 && <Badge tone="success" className="shrink-0 text-xs">재학 중</Badge>}
                          {isOwnProfile && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditEducation(edu)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => handleDeleteEducationClick(edu.id)}
                                disabled={deleteEducation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isOwnProfile && !showAddEducation ? (
                <div className="text-center py-6 bg-slate-50/50 rounded-lg">
                  <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">아직 등록된 학력이 없습니다.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      resetEducationForm();
                      setShowAddEducation(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    학력 추가
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* 내 활동 */}
          <div className="space-y-3 pt-5 md:pt-6 border-t border-slate-200">
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              {isOwnProfile ? '내 활동' : '활동'}
            </h2>
            {/* 탭 헤더 */}
            <div className="flex border-b border-slate-200 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'posts'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                게시글
                {postsData?.pages?.[0]?.count !== undefined && postsData.pages[0].count > 0 && (
                  <Badge tone="default" className="text-xs">{postsData.pages[0].count}</Badge>
                )}
              </button>
              <button
                onClick={() => setActiveTab('qna')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'qna'
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                Q&A
                {questionsData?.pages?.[0]?.count !== undefined && questionsData.pages[0].count > 0 && (
                  <Badge tone="default" className="text-xs">{questionsData.pages[0].count}</Badge>
                )}
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'bookmarks'
                      ? 'text-slate-900 border-slate-900'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  북마크
                  {myBookmarksData?.pages?.[0]?.count !== undefined && myBookmarksData.pages[0].count > 0 && (
                    <Badge tone="default" className="text-xs">{myBookmarksData.pages[0].count}</Badge>
                  )}
                </button>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('ai-chats')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'ai-chats'
                      ? 'text-slate-900 border-slate-900'
                      : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  AI 대화
                  {chatSessionsData?.pages?.[0]?.count !== undefined && chatSessionsData.pages[0].count > 0 && (
                    <Badge tone="default" className="text-xs">{chatSessionsData.pages[0].count}</Badge>
                  )}
                </button>
              )}
            </div>

            {/* 게시글 탭 */}
            {activeTab === 'posts' && (
              <div className="space-y-3">
                {isLoadingPosts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : !postsData?.pages || postsData.pages.flatMap(page => page.results).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">작성한 게시글이 없습니다.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {postsData.pages.flatMap(page => page.results).map((post) => {
                        const userProfile = {
                          id: profile?.user_id || post.author?.id || 0,
                          profile_id: profile?.id,
                          name: profile?.name || post.author?.name || '',
                          image_url: profile?.image_url || post.author?.image_url || '',
                          headline: profile?.headline || post.author?.headline || '',
                          description: profile?.long_description || '',
                          small_image_url: profile?.image_url || post.author?.image_url || '',
                        };
                        return (
                          <CommunityFeedCard
                            key={post.id}
                            postId={post.id}
                            authorId={post.author?.id || profile?.user_id || 0}
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
                            onClick={() => handleOpenPost(post.id)}
                            onLike={() => {
                              if (!currentUser) return;
                              if (post.is_liked) {
                                unlikePostMutation.mutate(post.id);
                              } else {
                                likePostMutation.mutate(post.id);
                              }
                            }}
                            onShare={() => {
                              const url = `${window.location.origin}/community/post/${post.id}`;
                              navigator.clipboard.writeText(url);
                              toast.success('링크가 복사되었습니다');
                            }}
                            onBookmark={() => {
                              if (!currentUser) return;
                              if (post.is_saved) {
                                unsavePostMutation.mutate(post.id);
                              } else {
                                savePostMutation.mutate(post.id);
                              }
                            }}
                            onEdit={isOwnProfile ? () => router.push(`/community/edit/post/${post.id}`) : undefined}
                            onDelete={isOwnProfile ? () => {
                              deletePostMutation.mutate(post.id);
                            } : undefined}
                            liked={post.is_liked}
                            bookmarked={post.is_saved}
                          />
                        );
                      })}
                    </div>
                    <LoadMore
                      hasMore={!!hasNextPosts}
                      loading={isFetchingNextPosts}
                      onLoadMore={fetchNextPosts}
                      loadMoreText="게시글 더보기"
                      endText="모든 게시글을 표시했습니다"
                    />
                  </>
                )}
              </div>
            )}

            {/* Q&A 탭 */}
            {activeTab === 'qna' && (
              <div className="space-y-3">
                {isLoadingQuestions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : !questionsData?.pages || questionsData.pages.flatMap(page => page.results).length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">작성한 질문이 없습니다.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {questionsData.pages.flatMap(page => page.results).map((question) => {
                        // API에서 반환하는 필드 우선 사용, 없으면 프로필 정보 사용
                        const q = question as any;
                        const author = {
                          id: q.user_id || profile?.user_id || 0,
                          profile_id: q.author_profile_id || profile?.id,
                          name: q.author_name || profile?.name || '알 수 없음',
                          email: '',
                          image_url: q.author_image_url || profile?.image_url || '',
                          headline: q.author_headline || profile?.headline || '',
                        };
                        return (
                          <QnaCard
                            key={question.id}
                            qnaId={question.id}
                            title={question.title}
                            description={q.description || ''}
                            author={author}
                            createdAt={question.createdat}
                            updatedAt={question.updatedat}
                            status={question.status}
                            isPublic={question.ispublic}
                            answerCount={question.answer_count || 0}
                            commentCount={0}
                            viewCount={question.view_count || 0}
                            hashTagNames=""
                            onClick={() => handleOpenQna(question.id)}
                            onEdit={isOwnProfile ? () => router.push(`/community/edit/qna/${question.id}`) : undefined}
                            onDelete={isOwnProfile ? () => {
                              // TODO: 삭제 확인 다이얼로그 추가
                            } : undefined}
                          />
                        );
                      })}
                    </div>
                    <LoadMore
                      hasMore={!!hasNextQuestions}
                      loading={isFetchingNextQuestions}
                      onLoadMore={fetchNextQuestions}
                      loadMoreText="질문 더보기"
                      endText="모든 질문을 표시했습니다"
                    />
                  </>
                )}
              </div>
            )}

            {/* 북마크 탭 (본인 프로필에서만) */}
            {activeTab === 'bookmarks' && isOwnProfile && (
              <div className="space-y-3">
                {isLoadingMyBookmarks ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : !myBookmarksData?.pages || myBookmarksData.pages.flatMap(page => page.results || []).length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">북마크한 게시글이 없습니다.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {myBookmarksData.pages.flatMap(page => page.results || []).map((post) => {
                        const userProfile = {
                          id: post.author?.id || 0,
                          name: post.author?.name || '',
                          image_url: post.author?.image_url || '',
                          headline: post.author?.headline || '',
                          description: '',
                          small_image_url: post.author?.image_url || '',
                        };
                        return (
                          <CommunityFeedCard
                            key={post.id}
                            postId={post.id}
                            authorId={post.author?.id || 0}
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
                            onClick={() => handleOpenPost(post.id)}
                            onLike={() => {
                              if (!currentUser) return;
                              if (post.is_liked) {
                                unlikePostMutation.mutate(post.id);
                              } else {
                                likePostMutation.mutate(post.id);
                              }
                            }}
                            onShare={() => {
                              const url = `${window.location.origin}/community/post/${post.id}`;
                              navigator.clipboard.writeText(url);
                              toast.success('링크가 복사되었습니다');
                            }}
                            onBookmark={() => {
                              if (!currentUser) return;
                              if (post.is_saved) {
                                unsavePostMutation.mutate(post.id);
                              } else {
                                savePostMutation.mutate(post.id);
                              }
                            }}
                            liked={post.is_liked}
                            bookmarked={post.is_saved}
                          />
                        );
                      })}
                    </div>
                    <LoadMore
                      hasMore={!!hasNextBookmarks}
                      loading={isFetchingNextBookmarks}
                      onLoadMore={fetchNextBookmarks}
                      loadMoreText="북마크 더보기"
                      endText="모든 북마크를 표시했습니다"
                    />
                  </>
                )}
              </div>
            )}

            {/* AI 대화 탭 (본인 프로필에서만) */}
            {activeTab === 'ai-chats' && isOwnProfile && (
              <div className="space-y-3">
                {isLoadingChatSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : !chatSessionsData?.pages || chatSessionsData.pages.flatMap(page => page.results || []).length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">AI 대화 기록이 없습니다.</p>
                    <p className="text-sm text-slate-400 mt-1">커리어리 AI에게 질문해보세요!</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => router.push('/')}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI에게 질문하기
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {chatSessionsData.pages.flatMap(page => page.results || []).map((session) => {
                        // 제목에서 프로필 정보 제거
                        const { question: parsedTitle } = parsePrompt(session.title || '');
                        return (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer group"
                          onClick={() => router.push(`/share/${session.id}`)}
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <h3 className="text-sm font-medium text-slate-900 truncate">
                              {parsedTitle || '제목 없음'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400">
                                {formatRelativeTime(session.created_at)}
                              </span>
                              <span className="text-xs text-slate-300">•</span>
                              <span className="text-xs text-slate-400">
                                {session.message_count}개 메시지
                              </span>
                              {session.is_public && (
                                <>
                                  <span className="text-xs text-slate-300">•</span>
                                  <Badge tone="success" className="text-xs">공개</Badge>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-1.5 rounded-md hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4 text-slate-500" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const url = `${window.location.origin}/share/${session.id}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success('링크가 복사되었습니다');
                                  }}
                                >
                                  <LinkIcon className="h-4 w-4 mr-2" />
                                  링크 복사
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('이 대화를 삭제하시겠습니까?')) {
                                      deleteChatSession.mutate(session.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  삭제
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      );
                      })}
                    </div>
                    <LoadMore
                      hasMore={!!hasNextChatSessions}
                      loading={isFetchingNextChatSessions}
                      onLoadMore={fetchNextChatSessions}
                      loadMoreText="대화 더보기"
                      endText="모든 대화를 표시했습니다"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 경력 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={deleteCareerConfirm.isOpen}
        onClose={() => setDeleteCareerConfirm({ isOpen: false, careerId: null })}
        onConfirm={handleConfirmDeleteCareer}
        title="경력 삭제"
        description="이 경력을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        isLoading={deleteCareer.isPending}
      />

      {/* 학력 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={deleteEducationConfirm.isOpen}
        onClose={() => setDeleteEducationConfirm({ isOpen: false, educationId: null })}
        onConfirm={handleConfirmDeleteEducation}
        title="학력 삭제"
        description="이 학력을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        isLoading={deleteEducation.isPending}
      />

      {/* 팔로워 목록 모달 */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        title="팔로워"
        users={flatFollowers}
        isLoading={isLoadingFollowers}
        onUserClick={(clickedUserId) => {
          setFollowersModalOpen(false);
          router.push(`/profile/${clickedUserId}`);
        }}
        onFollow={handleModalFollow}
        onUnfollow={handleModalUnfollow}
        currentUserId={currentUser?.id}
        followingIds={mergedFollowingIds}
        isFollowLoading={false}
        hasNextPage={hasNextFollowers}
        isFetchingNextPage={isFetchingNextFollowers}
        fetchNextPage={fetchNextFollowers}
        totalCount={followersCount}
      />

      {/* 팔로잉 목록 모달 */}
      <FollowersModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        title="팔로잉"
        users={flatFollowing}
        isLoading={isLoadingFollowing}
        onUserClick={(clickedUserId) => {
          setFollowingModalOpen(false);
          router.push(`/profile/${clickedUserId}`);
        }}
        onFollow={handleModalFollow}
        onUnfollow={handleModalUnfollow}
        currentUserId={currentUser?.id}
        followingIds={mergedFollowingIds}
        isFollowLoading={false}
        hasNextPage={hasNextFollowing}
        isFetchingNextPage={isFetchingNextFollowing}
        fetchNextPage={fetchNextFollowing}
        totalCount={followingCount}
      />

      {/* 상세 Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {(selectedPostId || selectedQnaId) && (
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {drawerType === 'post' ? '게시글' : 'Q&A'}
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
              {drawerType === 'post' && selectedPostId && (
                <>
                  {isLoadingSelectedPost ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : selectedPost ? (
                    <div className="p-4">
                      <PostDetail
                        postId={selectedPostId.toString()}
                        authorId={selectedPost.author?.id || selectedPost.userid}
                        userProfile={{
                          id: selectedPost.author?.id || selectedPost.userid,
                          name: selectedPost.author?.name || '알 수 없는 사용자',
                          image_url: selectedPost.author?.image_url,
                          headline: selectedPost.author?.headline || '',
                          title: selectedPost.author?.headline || '',
                        }}
                        content={selectedPost.description}
                        contentHtml={selectedPost.descriptionhtml}
                        createdAt={selectedPost.createdat}
                        stats={{
                          likeCount: selectedPost.like_count || 0,
                          replyCount: commentsData?.count || selectedPost.comment_count || 0,
                          viewCount: selectedPost.view_count || 0,
                        }}
                        imageUrls={selectedPost.images || []}
                        comments={transformedComments}
                        onLike={handlePostLike}
                        onShare={() => {
                          const url = `${window.location.origin}/community/post/${selectedPostId}`;
                          navigator.clipboard.writeText(url);
                          toast.success('링크가 복사되었습니다');
                        }}
                        onBookmark={handlePostBookmark}
                        onEdit={() => {
                          handleCloseDrawer();
                          router.push(`/community/edit/post/${selectedPostId}`);
                        }}
                        onDelete={() => {
                          if (selectedPostId) {
                            deletePostMutation.mutate(selectedPostId, {
                              onSuccess: () => {
                                handleCloseDrawer();
                              },
                            });
                          }
                        }}
                        onCommentLike={handleCommentLike}
                        onCommentSubmit={handleCommentSubmit}
                        onCommentEdit={handleCommentEdit}
                        onCommentDelete={handleCommentDelete}
                        liked={postLiked}
                        bookmarked={postSaved}
                        currentUser={currentUser ? { id: currentUser.id, name: currentUser.name, image_url: currentUser.image_url } : undefined}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-600">게시글을 불러올 수 없습니다.</p>
                    </div>
                  )}
                </>
              )}

              {drawerType === 'qna' && selectedQnaId && (
                <>
                  {isLoadingSelectedQuestion ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : selectedQuestion ? (
                    <div className="p-6">
                      <QnaDetail
                        qnaId={selectedQuestion.id.toString()}
                        title={selectedQuestion.title}
                        description={(selectedQuestion as any).description || selectedQuestion.title}
                        createdAt={selectedQuestion.createdat}
                        updatedAt={selectedQuestion.updatedat}
                        hashTagNames=""
                        viewCount={(selectedQuestion as any).view_count || 0}
                        status={selectedQuestion.status}
                        isPublic={selectedQuestion.ispublic}
                        answers={transformedAnswers}
                        onAnswerSubmit={handleAnswerSubmit}
                        onAcceptAnswer={() => {}}
                        onAnswerEdit={handleAnswerEdit}
                        onAnswerDelete={handleAnswerDelete}
                        currentUser={currentUser ? { id: currentUser.id, name: currentUser.name, image_url: currentUser.image_url } : undefined}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-600">질문을 불러올 수 없습니다.</p>
                    </div>
                  )}
                </>
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
