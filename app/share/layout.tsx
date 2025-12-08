'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ShareLayoutProps {
  children: React.ReactNode;
}

/**
 * Share Page Layout
 * 공유 페이지 전용 레이아웃 - 인증 체크 없음
 * 사이드바 없이 심플한 헤더만 표시
 */
export default function ShareLayout({ children }: ShareLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">홈으로</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-slate-900">
                career<span className="text-coral-500">·</span>ly
              </span>
            </Link>
          </div>
          <Button
            variant="coral"
            size="sm"
            asChild
          >
            <Link href="/">질문하기</Link>
          </Button>
        </div>
      </header>

      {/* Main Content - No sidebar padding */}
      <main className="min-h-[calc(100vh-56px)]">
        {children}
      </main>
    </div>
  );
}
