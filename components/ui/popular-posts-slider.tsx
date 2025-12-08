'use client';

import { useEffect, useState, useRef } from 'react';
import { Heart, MessageCircle, Eye, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { getTopPosts, type TopPostsPeriod } from '@/lib/api/services/posts.service';
import type { PostListItem } from '@/lib/api/types/posts.types';
import { cn } from '@/lib/utils';

interface PopularPostsSliderProps {
  period?: TopPostsPeriod;
  limit?: number;
  autoSlide?: boolean;
  autoSlideInterval?: number;
  className?: string;
}

/**
 * 인기글 카드 슬라이더
 * AI 응답 대기 중에 사용자에게 유용한 콘텐츠 제공
 */
export function PopularPostsSlider({
  period = 'monthly',
  limit = 10,
  autoSlide = true,
  autoSlideInterval = 4000,
  className,
}: PopularPostsSliderProps) {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  // 인기글 로드
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const data = await getTopPosts(period, limit);
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load popular posts:', err);
        setError('인기글을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [period, limit]);

  // 자동 슬라이드
  useEffect(() => {
    if (!autoSlide || posts.length <= 1) return;

    autoSlideRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, autoSlideInterval);

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [autoSlide, autoSlideInterval, posts.length]);

  // 슬라이드 이동
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // 수동 이동 시 자동 슬라이드 재시작
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
      }, autoSlideInterval);
    }
  };

  const goToPrev = () => {
    goToSlide(currentIndex === 0 ? posts.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % posts.length);
  };

  // 숫자 포맷
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // 텍스트 자르기
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  };

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-6 w-32 bg-slate-200 rounded mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 h-32 bg-slate-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return null; // 에러나 데이터 없으면 표시 안함
  }

  return (
    <div className={cn('', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">
            답변을 준비하는 동안...
          </span>
          <span className="text-sm text-teal-600 font-medium">
            이번 달 인기글
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrev}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-400 min-w-[40px] text-center">
            {currentIndex + 1} / {posts.length}
          </span>
          <button
            onClick={goToNext}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 슬라이더 */}
      <div className="relative overflow-hidden rounded-xl" ref={sliderRef}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {posts.map((post) => (
            <a
              key={post.id}
              href={`https://careerly.co.kr/posts/${post.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-full"
            >
              <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all group">
                {/* 작성자 정보 */}
                <div className="flex items-center gap-2 mb-2">
                  {post.author ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-medium">
                        {post.author.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm text-slate-600 truncate max-w-[120px]">
                        {post.author.name || '익명'}
                      </span>
                      {post.author.headline && (
                        <span className="text-xs text-slate-400 truncate max-w-[150px]">
                          · {post.author.headline}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">익명 사용자</span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">
                    {formatDate(post.createdat)}
                  </span>
                </div>

                {/* 제목/내용 */}
                <h3 className="font-medium text-slate-900 mb-2 line-clamp-2 group-hover:text-teal-700 transition-colors">
                  {post.title || truncateText(post.description, 80)}
                </h3>

                {/* 본문 미리보기 */}
                {post.title && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {truncateText(post.description.replace(/<[^>]*>/g, ''), 100)}
                  </p>
                )}

                {/* 통계 */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {formatCount(post.like_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {formatCount(post.comment_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatCount(post.view_count)}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>보러가기</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 인디케이터 (5개 이하일 때만) */}
      {posts.length <= 5 && posts.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {posts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                index === currentIndex
                  ? 'w-4 bg-teal-500'
                  : 'bg-slate-300 hover:bg-slate-400'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
