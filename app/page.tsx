'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SearchComposeInput } from '@/components/ui/search-compose-input';
import {
  TrendingConversationsSection,
  SuggestedQuestions,
} from '@/components/ui/trending-conversations-section';
import { useStore } from '@/hooks/useStore';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addRecentQuery } = useStore();

  const handleSubmit = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    addRecentQuery(searchQuery);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleQuestionClick = (questionQuery: string) => {
    setQuery(questionQuery);
    // 선택적: 바로 검색 실행
    // handleSubmit(questionQuery);
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-8 overflow-auto">
      {/* Hero Section - 검색 영역 */}
      <div className="flex flex-col items-center pt-[20vh] mb-12">
        <div className="w-full max-w-3xl space-y-8">
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
          <div className="space-y-6">
            <SearchComposeInput
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              loading={loading}
              autoFocus
              placeholder="궁금한 커리어 정보를 검색해보세요..."
              actions={{
                voice: true,
                fileUpload: true,
                modelSelect: true,
              }}
              onVoiceClick={() => {}}
              onFileUploadClick={() => {}}
              onModelSelectClick={() => {}}
            />

            {/* Suggested Questions Chips */}
            <SuggestedQuestions onQuestionClick={handleQuestionClick} />
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
