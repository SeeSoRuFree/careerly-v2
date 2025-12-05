'use client';

import { BookmarkIcon, Loader2 } from 'lucide-react';
import { useInfiniteMySavedPosts } from '@/lib/api';
import { CommunityFeedCard } from '@/components/ui/community-feed-card';
import { LoadMore } from '@/components/ui/load-more';
import type { PaginatedPostResponse } from '@/lib/api';

export default function BookmarksPage() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMySavedPosts();

  const posts = data?.pages.flatMap((page: PaginatedPostResponse) => page.results) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-center text-red-500">북마크를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BookmarkIcon className="w-6 h-6 text-teal-500" />
          <h1 className="text-2xl font-bold text-slate-900">북마크</h1>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <BookmarkIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">저장된 북마크가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <CommunityFeedCard
                key={post.id}
                postId={post.id}
                authorId={post.author?.id || post.userid}
                userProfile={{
                  id: post.author?.id || post.userid,
                  name: post.author?.name || '알 수 없음',
                  image_url: post.author?.image_url || '',
                  headline: post.author?.headline || '',
                }}
                content={post.description}
                createdAt={post.createdat}
                stats={{
                  likeCount: 0,
                  replyCount: post.comment_count || 0,
                  repostCount: 0,
                  viewCount: 0,
                }}
                onClick={() => window.location.href = `/community/post/${post.id}`}
              />
            ))}
            <LoadMore
              hasMore={!!hasNextPage}
              loading={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
