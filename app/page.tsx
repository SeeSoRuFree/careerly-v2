'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Wrench, Sparkles, Scissors, Send } from 'lucide-react';
import { SearchComposeInput } from '@/components/ui/search-compose-input';
import { Chip } from '@/components/ui/chip';
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

  // 미구현 기능 - suggestion chips 주석처리
  // const suggestions = [
  //   { icon: Sparkles, label: '양육' },
  //   { icon: Wrench, label: '문제 해결' },
  //   { icon: Sparkles, label: '당황감 101' },
  //   { icon: Scissors, label: '분석하다' },
  //   { icon: Send, label: '지역' },
  // ];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-2 md:px-4">
      <div className="w-full max-w-3xl space-y-8 md:space-y-12">
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
              modelSelect: true
            }}
            onVoiceClick={() => console.log('Voice input')}
            onFileUploadClick={() => console.log('File upload')}
            onModelSelectClick={() => console.log('Model select')}
          />

          {/* Suggestion Chips - 미구현 기능 주석처리 */}
          {/* <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map((item, index) => (
              <Chip
                key={index}
                variant="default"
                onClick={() => setQuery(item.label)}
                className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Chip>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
}
