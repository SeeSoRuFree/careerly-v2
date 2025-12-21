'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/api';
import { Loader2 } from 'lucide-react';

// /profile -> /profile/[profileId] 리다이렉트
// 로그인한 사용자의 프로필 페이지로 이동

export default function ProfilePage() {
  const router = useRouter();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading) {
      if (currentUser?.profile_id) {
        router.replace(`/profile/${currentUser.profile_id}`);
      } else {
        router.replace('/');
      }
    }
  }, [currentUser, isLoading, router]);

  // 리다이렉트 중 로딩 표시
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );
}
