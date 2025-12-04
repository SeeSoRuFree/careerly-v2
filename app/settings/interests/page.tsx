'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useInterests, useUserInterests, useUpdateUserInterests } from '@/lib/api';
import type { Interest } from '@/lib/api/services/settings.service';
import { cn } from '@/lib/utils';

const MAX_INTERESTS = 3;

export default function InterestsSettingsPage() {
  const router = useRouter();
  const { data: interests, isLoading: isLoadingInterests } = useInterests();
  const { data: initialSelectedIds, isLoading: isLoadingUserInterests } = useUserInterests();
  const updateInterests = useUpdateUserInterests();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 초기값 설정
  useEffect(() => {
    if (initialSelectedIds) {
      setSelectedIds(initialSelectedIds);
    }
  }, [initialSelectedIds]);

  const isLoading = isLoadingInterests || isLoadingUserInterests;

  const toggleInterest = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= MAX_INTERESTS) {
        return prev; // 최대 3개 제한
      }
      return [...prev, id];
    });
  };

  const getOrder = (id: number) => {
    const index = selectedIds.indexOf(id);
    return index >= 0 ? index + 1 : null;
  };

  const hasChanges =
    JSON.stringify([...selectedIds].sort()) !== JSON.stringify([...(initialSelectedIds || [])].sort());

  const handleSave = () => {
    updateInterests.mutate(selectedIds, {
      onSuccess: () => router.back(),
    });
  };

  // 개발/엔지니어링 관심사와 그 외로 분리
  const engineeringInterests = interests?.filter((i) => i.isEngineering === true) || [];
  const nonEngineeringInterests = interests?.filter((i) => i.isEngineering !== true) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 bg-slate-50 z-50 pt-4 pb-2">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <span className="font-semibold">관심사 설정</span>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || updateInterests.isPending}>
            저장
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-slate-600">관심 분야를 선택해주세요.</p>
          <p className="text-slate-500 text-sm">
            최대 {MAX_INTERESTS}개까지 선택할 수 있습니다. ({selectedIds.length}/{MAX_INTERESTS} 선택됨)
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-10">
            {/* 개발 섹션 */}
            {engineeringInterests.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-4">개발</h4>
                <div className="flex flex-wrap gap-2">
                  {engineeringInterests.map((interest) => {
                    const isSelected = selectedIds.includes(interest.id);
                    const order = getOrder(interest.id);

                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={cn(
                          'flex items-center gap-2 px-[18px] py-[14px] rounded-lg border transition-colors',
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        )}
                      >
                        {order && (
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">
                            {order}
                          </span>
                        )}
                        <span className="text-base leading-normal">{interest.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 그 외 섹션 */}
            {nonEngineeringInterests.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-4">그 외</h4>
                <div className="flex flex-wrap gap-2">
                  {nonEngineeringInterests.map((interest) => {
                    const isSelected = selectedIds.includes(interest.id);
                    const order = getOrder(interest.id);

                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={cn(
                          'flex items-center gap-2 px-[18px] py-[14px] rounded-lg border transition-colors',
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        )}
                      >
                        {order && (
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">
                            {order}
                          </span>
                        )}
                        <span className="text-base leading-normal">{interest.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
