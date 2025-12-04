'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  // 커뮤니티 페이지로 리다이렉트 (drawer로 표시)
  React.useEffect(() => {
    if (postId) {
      router.replace(`/community?post=${postId}`);
    }
  }, [postId, router]);

  // 리다이렉트 중 로딩 표시
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );
}
