'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chip } from '@/components/ui/chip';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityFeedCard } from '@/components/ui/community-feed-card';
import { QnaCard } from '@/components/ui/qna-card';
import {
  User,
  Briefcase,
  GraduationCap,
  Clock,
  Search,
  MessageSquare,
  Link as LinkIcon,
  Trash2,
  Edit,
  Plus,
  X,
  HelpCircle,
  Bookmark,
  Loader2,
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import {
  useMyProfileDetail,
  useCurrentUser,
  useUpdateMyProfile,
  useDeleteCareer,
  useDeleteEducation,
  useAddCareer,
  useUpdateCareer,
  useAddEducation,
  useUpdateEducation,
  useInfiniteMyPosts,
  useInfiniteMyQuestions,
  useInfiniteMySavedPosts,
} from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils/date';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-8">
          <div className="flex items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2 pt-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

type ContentTab = 'posts' | 'qna' | 'bookmarks';

function ProfilePageContent() {
  const router = useRouter();
  const { recentQueries, clearRecentQueries } = useStore();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<ContentTab>('posts');

  // 편집 상태
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [basicInfoValues, setBasicInfoValues] = useState({ name: '', headline: '', openToWork: '' });

  // 경력/학력 추가 폼 상태
  const [showAddCareer, setShowAddCareer] = useState(false);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [editingCareer, setEditingCareer] = useState<number | null>(null);
  const [editingEducation, setEditingEducation] = useState<number | null>(null);

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

  // API 데이터 가져오기
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: profile, isLoading: isProfileLoading, error } = useMyProfileDetail(currentUser?.id);

  // Mutation 훅
  const updateProfile = useUpdateMyProfile();
  const deleteCareer = useDeleteCareer();
  const deleteEducation = useDeleteEducation();
  const addCareer = useAddCareer();
  const updateCareer = useUpdateCareer();
  const addEducation = useAddEducation();
  const updateEducation = useUpdateEducation();

  // 내 게시글/질문/북마크 훅
  const {
    data: myPostsData,
    isLoading: isLoadingMyPosts,
    fetchNextPage: fetchNextPosts,
    hasNextPage: hasNextPosts,
    isFetchingNextPage: isFetchingNextPosts,
  } = useInfiniteMyPosts(currentUser?.id);

  const {
    data: myQuestionsData,
    isLoading: isLoadingMyQuestions,
    fetchNextPage: fetchNextQuestions,
    hasNextPage: hasNextQuestions,
    isFetchingNextPage: isFetchingNextQuestions,
  } = useInfiniteMyQuestions(currentUser?.id);

  const {
    data: myBookmarksData,
    isLoading: isLoadingMyBookmarks,
    fetchNextPage: fetchNextBookmarks,
    hasNextPage: hasNextBookmarks,
    isFetchingNextPage: isFetchingNextBookmarks,
  } = useInfiniteMySavedPosts();

  const isLoading = isUserLoading || isProfileLoading;

  // 프로필 데이터 로드 시 상태 초기화
  useEffect(() => {
    if (profile) {
      setDescriptionValue(profile.long_description || '');
      setBasicInfoValues({
        name: profile.name || '',
        headline: profile.headline || '',
        openToWork: profile.open_to_work_status || '',
      });
    }
  }, [profile]);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '현재';
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  // 자기소개 저장
  const handleSaveDescription = async () => {
    try {
      await updateProfile.mutateAsync({
        long_description: descriptionValue,
      });
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

  // 경력 삭제
  const handleDeleteCareer = async (careerId: number) => {
    if (!confirm('이 경력을 삭제하시겠습니까?')) return;
    try {
      await deleteCareer.mutateAsync(careerId);
    } catch (error) {
      console.error('Failed to delete career:', error);
    }
  };

  // 학력 삭제
  const handleDeleteEducation = async (educationId: number) => {
    if (!confirm('이 학력을 삭제하시겠습니까?')) return;
    try {
      await deleteEducation.mutateAsync(educationId);
    } catch (error) {
      console.error('Failed to delete education:', error);
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

  // Generate fallback initials from display name
  const fallback = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  // 로그인 체크
  if (!currentUser && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center py-12">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">프로필을 보려면 로그인이 필요합니다.</p>
          <Button onClick={() => router.push('/login')}>
            로그인
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">프로필을 불러오는 중 오류가 발생했습니다.</p>
          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
            <Avatar className="h-24 w-24">
              {profile?.image_url && <AvatarImage src={profile.image_url} alt={profile.name} />}
              <AvatarFallback className="text-xl font-semibold">{fallback}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{profile?.name || currentUser?.name || ''}</h1>
                  <p className="text-base text-slate-600 mt-2">{profile?.headline || '직무 미설정'}</p>

                  {/* 팔로워수, 게시글수 */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-900">0</span> 팔로워
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">0</span> 게시글
                    </div>
                  </div>

                  {profile?.open_to_work_status === 'open' && (
                    <Badge tone="success" className="mt-3">
                      구직 중
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditingBasicInfo(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  프로필 편집
                </Button>
              </div>
            </div>
          </div>

          {/* 기본 정보 편집 모달 */}
          {editingBasicInfo && (
            <div className="space-y-3 p-4 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">기본 정보 편집</h2>
                <button
                  onClick={() => setEditingBasicInfo(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">이름</label>
                <input
                  type="text"
                  value={basicInfoValues.name}
                  onChange={(e) => setBasicInfoValues({ ...basicInfoValues, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">직무</label>
                <input
                  type="text"
                  value={basicInfoValues.headline}
                  onChange={(e) => setBasicInfoValues({ ...basicInfoValues, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="예: 프론트엔드 개발자"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">구직 상태</label>
                <select
                  value={basicInfoValues.openToWork}
                  onChange={(e) => setBasicInfoValues({ ...basicInfoValues, openToWork: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">선택 안함</option>
                  <option value="open">구직 중</option>
                  <option value="closed">비공개</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveBasicInfo}
                  disabled={updateProfile.isPending}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateProfile.isPending ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => {
                    setEditingBasicInfo(false);
                    setBasicInfoValues({
                      name: profile?.name || '',
                      headline: profile?.headline || '',
                      openToWork: profile?.open_to_work_status || '',
                    });
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 소개 */}
          {(profile?.description || profile?.long_description || editingDescription) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">소개</h2>
                {!editingDescription && (
                  <button
                    onClick={() => setEditingDescription(true)}
                    className="px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    편집
                  </button>
                )}
              </div>
              {editingDescription ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full min-h-[120px] p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="자신을 소개하는 글을 작성해보세요..."
                    value={descriptionValue}
                    onChange={(e) => setDescriptionValue(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleSaveDescription}
                      disabled={updateProfile.isPending}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateProfile.isPending ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDescription(false);
                        setDescriptionValue(profile?.long_description || '');
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed">
                  {profile?.long_description || profile?.description}
                </p>
              )}
            </div>
          )}

          {/* 스킬 */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">스킬</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Chip key={skill.id} variant="default">
                    {skill.name}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* 사이트/링크 */}
          {profile?.sites && profile.sites.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">링크</h2>
              <div className="space-y-3">
                {profile.sites.map((site) => (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900">{site.name}</p>
                      <p className="text-sm text-slate-500">{site.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 경력 요약 */}
          {profile?.career_duration && (
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">경력 요약</h2>
              <p className="text-sm text-slate-600">
                총 경력 <span className="font-semibold text-slate-900">{profile.career_duration.career_year}년</span> ({profile.career_duration.total_career_duration_months}개월)
              </p>
            </div>
          )}

          {/* 경력 */}
          {((profile?.careers && profile.careers.length > 0) || showAddCareer) && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-600" />
                  경력
                </h2>
                <button
                  onClick={() => {
                    if (showAddCareer) {
                      resetCareerForm();
                    } else {
                      setShowAddCareer(true);
                    }
                  }}
                  className="px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  {showAddCareer ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showAddCareer ? '취소' : '경력 추가'}
                </button>
              </div>
              {showAddCareer && (
                <div className="p-4 border border-slate-200 bg-white rounded-lg space-y-4">
                  <h3 className="font-semibold text-slate-900">
                    {editingCareer ? '경력 수정' : '경력 추가'}
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">회사명 *</label>
                      <input
                        type="text"
                        value={careerForm.company}
                        onChange={(e) => setCareerForm({ ...careerForm, company: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="회사명"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">직책 *</label>
                      <input
                        type="text"
                        value={careerForm.title}
                        onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="예: 프론트엔드 개발자"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">고용 형태 *</label>
                    <select
                      value={careerForm.type}
                      onChange={(e) => setCareerForm({ ...careerForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="full_time">정규직</option>
                      <option value="contract">계약직</option>
                      <option value="freelance">프리랜서</option>
                      <option value="internship">인턴</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">시작일 *</label>
                      <input
                        type="month"
                        value={careerForm.start_date}
                        onChange={(e) => setCareerForm({ ...careerForm, start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">종료일</label>
                      <input
                        type="month"
                        value={careerForm.end_date}
                        onChange={(e) => setCareerForm({ ...careerForm, end_date: e.target.value })}
                        disabled={careerForm.is_current}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_current_career"
                      checked={careerForm.is_current}
                      onChange={(e) => setCareerForm({ ...careerForm, is_current: e.target.checked, end_date: e.target.checked ? '' : careerForm.end_date })}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="is_current_career" className="text-sm text-slate-700">
                      현재 재직 중
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">업무 설명</label>
                    <textarea
                      value={careerForm.description}
                      onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })}
                      className="w-full min-h-[100px] px-3 py-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="담당했던 업무나 성과를 입력해주세요"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveCareer}
                      disabled={!careerForm.company || !careerForm.title || !careerForm.start_date || addCareer.isPending || updateCareer.isPending}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addCareer.isPending || updateCareer.isPending ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={resetCareerForm}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {profile?.careers && profile.careers.length > 0 ? (
                  profile.careers.map((career) => (
                    <div key={career.id} className="space-y-2 p-3 bg-slate-50/50 rounded-lg relative group">
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleEditCareer(career)}
                          className="p-2 text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCareer(career.id)}
                          disabled={deleteCareer.isPending}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-start justify-between pr-20">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base text-slate-900">{career.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{career.company}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {formatDate(career.start_date)} -{' '}
                            {career.is_current ? '현재' : formatDate(career.end_date)}
                          </p>
                          {career.description && (
                            <p className="text-sm text-slate-600 mt-3">{career.description}</p>
                          )}
                        </div>
                        {career.is_current === 1 && <Badge tone="success">재직 중</Badge>}
                      </div>
                    </div>
                  ))
                ) : !showAddCareer ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">등록된 경력이 없습니다.</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* 학력 */}
          {((profile?.educations && profile.educations.length > 0) || showAddEducation) && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-600" />
                  학력
                </h2>
                <button
                  onClick={() => {
                    if (showAddEducation) {
                      resetEducationForm();
                    } else {
                      setShowAddEducation(true);
                    }
                  }}
                  className="px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  {showAddEducation ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showAddEducation ? '취소' : '학력 추가'}
                </button>
              </div>
              {showAddEducation && (
                <div className="p-4 border border-slate-200 bg-white rounded-lg space-y-4">
                  <h3 className="font-semibold text-slate-900">
                    {editingEducation ? '학력 수정' : '학력 추가'}
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">학교명 *</label>
                      <input
                        type="text"
                        value={educationForm.institute}
                        onChange={(e) => setEducationForm({ ...educationForm, institute: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="학교명"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">전공 *</label>
                      <input
                        type="text"
                        value={educationForm.major}
                        onChange={(e) => setEducationForm({ ...educationForm, major: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="예: 컴퓨터공학"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">학위 유형 *</label>
                    <select
                      value={educationForm.type}
                      onChange={(e) => setEducationForm({ ...educationForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="high_school">고등학교</option>
                      <option value="associate">전문학사</option>
                      <option value="bachelor">학사</option>
                      <option value="master">석사</option>
                      <option value="doctorate">박사</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">시작일 *</label>
                      <input
                        type="month"
                        value={educationForm.start_date}
                        onChange={(e) => setEducationForm({ ...educationForm, start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">종료일</label>
                      <input
                        type="month"
                        value={educationForm.end_date}
                        onChange={(e) => setEducationForm({ ...educationForm, end_date: e.target.value })}
                        disabled={educationForm.is_current}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_current_education"
                      checked={educationForm.is_current}
                      onChange={(e) => setEducationForm({ ...educationForm, is_current: e.target.checked, end_date: e.target.checked ? '' : educationForm.end_date })}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="is_current_education" className="text-sm text-slate-700">
                      현재 재학 중
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">설명</label>
                    <textarea
                      value={educationForm.description}
                      onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })}
                      className="w-full min-h-[100px] px-3 py-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="학업 관련 활동이나 성과를 입력해주세요"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveEducation}
                      disabled={!educationForm.institute || !educationForm.major || !educationForm.start_date || addEducation.isPending || updateEducation.isPending}
                      className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addEducation.isPending || updateEducation.isPending ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={resetEducationForm}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {profile?.educations && profile.educations.length > 0 ? (
                  profile.educations.map((edu) => (
                    <div key={edu.id} className="space-y-2 p-3 bg-slate-50/50 rounded-lg relative group">
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleEditEducation(edu)}
                          className="p-2 text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEducation(edu.id)}
                          disabled={deleteEducation.isPending}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="pr-20">
                        <h3 className="font-semibold text-base text-slate-900">{edu.institute}</h3>
                        <p className="text-sm text-slate-600">{edu.major}</p>
                        <p className="text-sm text-slate-500">
                          {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                        </p>
                        {edu.description && (
                          <p className="text-sm text-slate-600 mt-2">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : !showAddEducation ? (
                  <div className="text-center py-8">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">등록된 학력이 없습니다.</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* 컨텐츠 탭 */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            {/* 탭 버튼 */}
            <div className="flex gap-1 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                게시글
                {myPostsData?.pages?.[0]?.count !== undefined && (
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                    {myPostsData.pages[0].count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('qna')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'qna'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                Q&A
                {myQuestionsData?.pages?.[0]?.count !== undefined && (
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                    {myQuestionsData.pages[0].count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                북마크
                {myBookmarksData?.pages?.[0]?.count !== undefined && (
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                    {myBookmarksData.pages[0].count}
                  </span>
                )}
              </button>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="min-h-[200px]">
              {/* 게시글 탭 */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {isLoadingMyPosts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : myPostsData?.pages?.flatMap(p => p.results).length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">작성한 게시글이 없습니다.</p>
                    </div>
                  ) : (
                    <>
                      {myPostsData?.pages?.flatMap(p => p.results).map((post) => {
                        // 내 게시글이므로 현재 프로필 정보 사용
                        const userProfile = {
                          id: currentUser?.id || post.author?.id || 0,
                          name: profile?.name || currentUser?.name || post.author?.name || '',
                          image_url: profile?.image_url || post.author?.image_url || '',
                          headline: profile?.headline || post.author?.headline || '',
                        };
                        return (
                          <CommunityFeedCard
                            key={post.id}
                            userProfile={userProfile}
                            content={post.description}
                            createdAt={post.createdat}
                            stats={{
                              likeCount: post.like_count || 0,
                              replyCount: post.comment_count || 0,
                              viewCount: post.view_count || 0,
                            }}
                            onClick={() => router.push(`/community?post=${post.id}`)}
                            liked={post.is_liked}
                            bookmarked={post.is_saved}
                          />
                        );
                      })}
                      {hasNextPosts && (
                        <button
                          onClick={() => fetchNextPosts()}
                          disabled={isFetchingNextPosts}
                          className="w-full py-3 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          {isFetchingNextPosts ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            '더 보기'
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Q&A 탭 */}
              {activeTab === 'qna' && (
                <div className="space-y-4">
                  {isLoadingMyQuestions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : myQuestionsData?.pages?.flatMap(p => p.results).length === 0 ? (
                    <div className="text-center py-8">
                      <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">작성한 질문이 없습니다.</p>
                    </div>
                  ) : (
                    <>
                      {myQuestionsData?.pages?.flatMap(p => p.results).map((question) => (
                        <QnaCard
                          key={question.id}
                          qnaId={question.id}
                          title={question.title}
                          description=""
                          createdAt={question.createdat}
                          answerCount={question.answer_count || 0}
                          likeCount={question.like_count || 0}
                          viewCount={0}
                          status={question.status}
                          liked={question.is_liked}
                          onClick={() => router.push(`/community?qna=${question.id}`)}
                        />
                      ))}
                      {hasNextQuestions && (
                        <button
                          onClick={() => fetchNextQuestions()}
                          disabled={isFetchingNextQuestions}
                          className="w-full py-3 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          {isFetchingNextQuestions ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            '더 보기'
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* 북마크 탭 */}
              {activeTab === 'bookmarks' && (
                <div className="space-y-4">
                  {isLoadingMyBookmarks ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : myBookmarksData?.pages?.flatMap(p => p.results).length === 0 ? (
                    <div className="text-center py-8">
                      <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">북마크한 게시글이 없습니다.</p>
                    </div>
                  ) : (
                    <>
                      {myBookmarksData?.pages?.flatMap(p => p.results).map((post) => {
                        // 북마크는 다른 사람 게시글이므로 author 정보 사용
                        const userProfile = {
                          id: post.author?.id || post.userid,
                          name: post.author?.name || '알 수 없는 사용자',
                          image_url: post.author?.image_url || '',
                          headline: post.author?.headline || '',
                        };
                        return (
                          <CommunityFeedCard
                            key={post.id}
                            userProfile={userProfile}
                            content={post.description}
                            createdAt={post.createdat}
                            stats={{
                              likeCount: post.like_count || 0,
                              replyCount: post.comment_count || 0,
                              viewCount: post.view_count || 0,
                            }}
                            onClick={() => router.push(`/community?post=${post.id}`)}
                            liked={post.is_liked}
                            bookmarked={true}
                          />
                        );
                      })}
                      {hasNextBookmarks && (
                        <button
                          onClick={() => fetchNextBookmarks()}
                          disabled={isFetchingNextBookmarks}
                          className="w-full py-3 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          {isFetchingNextBookmarks ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            '더 보기'
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 검색 히스토리 */}
          {recentQueries.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  최근 검색
                </h2>
                <button
                  onClick={clearRecentQueries}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  전체 삭제
                </button>
              </div>
              <div className="space-y-2">
                {recentQueries.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearch(item.query)}
                    className="w-full flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-teal-50 hover:border-teal-200 border border-transparent transition-all text-left group"
                  >
                    <Search className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 text-sm font-medium truncate">
                        {item.query}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {dayjs(item.timestamp).fromNow()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
}
