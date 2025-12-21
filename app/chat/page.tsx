'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { User, Loader2 } from 'lucide-react';
import { SearchComposeInput } from '@/components/ui/search-compose-input';
import { TrendingConversationsSection } from '@/components/ui/trending-conversations-section';
import { useStore } from '@/hooks/useStore';
import { getMyProfileSummary, buildProfilePromptText } from '@/lib/api';
import type { ProfileSummaryForAI } from '@/lib/api/types';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProfileEnabled, setIsProfileEnabled] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileSummaryForAI | null>(null);
  const router = useRouter();
  const { addRecentQuery } = useStore();

  const handleSubmit = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    addRecentQuery(searchQuery);
    // Profile이 활성화되어 있으면 personalized=true 추가
    const url = isProfileEnabled
      ? `/search?q=${encodeURIComponent(searchQuery)}&personalized=true`
      : `/search?q=${encodeURIComponent(searchQuery)}`;
    router.push(url);
  };

  // 프로필 텍스트 생성 헬퍼
  const buildPromptWithQuestion = useCallback((question: string, profile: ProfileSummaryForAI) => {
    const profileText = buildProfilePromptText(profile);
    return `${question}

---

내정보:
${profileText}`;
  }, []);

  const handleProfileToggle = useCallback(async () => {
    if (isProfileEnabled) {
      // OFF로 전환 - 프로필 텍스트 제거
      setIsProfileEnabled(false);
      setQuery('');
      return;
    }

    // ON으로 전환 - 프로필 로드 및 입력창에 추가
    try {
      setProfileLoading(true);

      // 이미 프로필 데이터가 있으면 재사용
      let profile = profileData;
      if (!profile) {
        const response = await getMyProfileSummary();
        profile = response.profile_data;
        setProfileData(profile);
      }

      // 질문이 위에, 프로필이 아래로
      const promptWithProfile = buildPromptWithQuestion('', profile);
      setQuery(promptWithProfile);
      setIsProfileEnabled(true);
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      toast.error('프로필을 불러오는데 실패했습니다.');
    } finally {
      setProfileLoading(false);
    }
  }, [isProfileEnabled, profileData, buildPromptWithQuestion]);

  const handleQuestionClick = (questionQuery: string, isPersonalized?: boolean) => {
    // 개인화 질문은 URL 파라미터에 personalized=true 추가
    if (isPersonalized) {
      addRecentQuery(questionQuery);
      router.push(`/search?q=${encodeURIComponent(questionQuery)}&personalized=true`);
      return;
    }

    // 일반 질문은 현재 입력창에 추가 (Profile On인 경우 프로필 뒤에)
    if (isProfileEnabled && query) {
      // 프로필 프롬프트 뒤에 질문 추가
      setQuery((prev) => prev + questionQuery);
    } else {
      setQuery(questionQuery);
    }
  };

  // 해시태그 클릭 시 질문 + 프로필 함께 채워짐
  const handleHashtagClick = async (question: string) => {
    try {
      setProfileLoading(true);

      // 프로필 데이터 로드 (캐싱)
      let profile = profileData;
      if (!profile) {
        const response = await getMyProfileSummary();
        profile = response.profile_data;
        setProfileData(profile);
      }

      // 질문 + 프로필 프롬프트 생성
      const fullPrompt = buildPromptWithQuestion(question, profile);
      setQuery(fullPrompt);
      setIsProfileEnabled(true);
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      // 프로필 없이 질문만
      setQuery(question);
    } finally {
      setProfileLoading(false);
    }
  };

  // 해시태그 형태 추천 질문
  const HASHTAG_QUESTIONS = [
    'AI 시대 어떤 커리어를 구축하는게 좋을까?',
  ];

  return (
    <div className="flex-1 flex flex-col px-4 py-8 overflow-auto">
      {/* Hero Section - 검색 영역 */}
      <div className={cn(
        'flex flex-col items-center mb-12 transition-all duration-300',
        isProfileEnabled ? 'pt-4' : 'pt-[20vh]'
      )}>
        <div className={cn(
          'w-full space-y-8 transition-all duration-300',
          isProfileEnabled ? 'max-w-4xl' : 'max-w-3xl'
        )}>
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/images/logo.svg"
              alt="Careerly Logo"
              width={200}
              height={60}
              priority
              className="w-[140px] md:w-[200px] h-auto"
            />
          </div>

          {/* Search Input */}
          <div className="space-y-4">
            <SearchComposeInput
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              loading={loading || profileLoading}
              autoFocus
              placeholder={isProfileEnabled ? '질문을 입력하세요...' : '궁금한 커리어 정보를 검색해보세요...'}
              expanded={isProfileEnabled}
              actions={{
                voice: true,
                fileUpload: true,
                modelSelect: true,
              }}
              onVoiceClick={() => {}}
              onFileUploadClick={() => {}}
              onModelSelectClick={() => {}}
            />

            {/* Profile Toggle + Hashtag Questions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Profile On/Off Toggle */}
              <button
                onClick={handleProfileToggle}
                disabled={profileLoading}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  'border',
                  isProfileEnabled
                    ? 'bg-purple-100 border-purple-400 text-purple-700'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-purple-300 hover:bg-purple-50',
                  profileLoading && 'opacity-50 cursor-wait'
                )}
              >
                {profileLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
                Profile {isProfileEnabled ? 'On' : 'Off'}
              </button>

              {/* Question Chips - 클릭 시 질문+프로필 채워짐 */}
              {HASHTAG_QUESTIONS.map((question) => (
                <button
                  key={question}
                  onClick={() => handleHashtagClick(question)}
                  disabled={profileLoading}
                  className={cn(
                    'inline-flex items-center px-3 py-1.5 rounded-full text-sm',
                    'bg-slate-100 text-slate-600 hover:bg-teal-100 hover:text-teal-700',
                    'transition-all duration-200',
                    profileLoading && 'opacity-50 cursor-wait'
                  )}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trending Conversations Section */}
      <div className="w-full max-w-5xl mx-auto">
        <TrendingConversationsSection
          onQuestionClick={handleQuestionClick}
          onLike={() => {}}
          onAuthorClick={(authorId) => router.push(`/profile/${authorId}`)}
        />
      </div>
    </div>
  );
}
