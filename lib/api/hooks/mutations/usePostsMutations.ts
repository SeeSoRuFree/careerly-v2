/**
 * Posts 관련 React Query Mutation 훅
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createPost,
  updatePost,
  patchPost,
  deletePost,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  viewPost,
  repostPost,
  unrepostPost,
  uploadPostImage,
} from '../../services/posts.service';
import { postsKeys } from '../queries/usePosts';
import { userKeys } from '../queries/useUser';
import type { Post, PostCreateRequest, PostUpdateRequest, ImageUploadResponse } from '../../types/posts.types';

/**
 * 게시물 생성 mutation
 */
export function useCreatePost(
  options?: Omit<UseMutationOptions<Post, Error, PostCreateRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<Post, Error, PostCreateRequest>({
    mutationFn: createPost,
    onSuccess: (data) => {
      // 게시물 목록 무효화 (모든 페이지)
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      // 새로운 게시물 캐시에 추가
      queryClient.setQueryData(postsKeys.detail(data.id), data);

      toast.success('게시물이 생성되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '게시물 생성에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 수정 (PUT) mutation
 */
export function useUpdatePost(
  options?: Omit<
    UseMutationOptions<Post, Error, { id: number; data: PostUpdateRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Post, Error, { id: number; data: PostUpdateRequest }>({
    mutationFn: ({ id, data }) => updatePost(id, data),
    onSuccess: (data, variables) => {
      // 해당 게시물 상세 캐시 업데이트
      queryClient.setQueryData(postsKeys.detail(variables.id), data);

      // 게시물 목록 무효화
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      toast.success('게시물이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '게시물 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 부분 수정 (PATCH) mutation
 */
export function usePatchPost(
  options?: Omit<
    UseMutationOptions<Post, Error, { id: number; data: Partial<PostUpdateRequest> }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<Post, Error, { id: number; data: Partial<PostUpdateRequest> }>({
    mutationFn: ({ id, data }) => patchPost(id, data),
    onSuccess: (data, variables) => {
      // 해당 게시물 상세 캐시 업데이트
      queryClient.setQueryData(postsKeys.detail(variables.id), data);

      // 게시물 목록 무효화
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      toast.success('게시물이 수정되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '게시물 수정에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 삭제 mutation
 */
export function useDeletePost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deletePost,
    onSuccess: (_, postId) => {
      // 해당 게시물 상세 캐시 제거
      queryClient.removeQueries({ queryKey: postsKeys.detail(postId) });

      // 게시물 목록 무효화
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      toast.success('게시물이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '게시물 삭제에 실패했습니다.');
    },
    ...options,
  });
}

// 목록 캐시에서 게시물 좋아요 상태를 Optimistic Update하는 헬퍼 함수
function updatePostLikeInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  isLiked: boolean
) {
  // 모든 목록 캐시를 순회하며 해당 게시물의 좋아요 상태 업데이트
  queryClient.setQueriesData(
    { queryKey: postsKeys.lists() },
    (oldData: any) => {
      if (!oldData) return oldData;
      // InfiniteQuery 데이터 구조 처리
      if (oldData.pages) {
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            results: page.results?.map((post: any) =>
              post.id === postId
                ? {
                    ...post,
                    is_liked: isLiked,
                    like_count: isLiked
                      ? (post.like_count || 0) + 1
                      : Math.max((post.like_count || 0) - 1, 0),
                  }
                : post
            ),
          })),
        };
      }
      // 일반 쿼리 데이터 구조 처리
      if (oldData.results) {
        return {
          ...oldData,
          results: oldData.results.map((post: any) =>
            post.id === postId
              ? {
                  ...post,
                  is_liked: isLiked,
                  like_count: isLiked
                    ? (post.like_count || 0) + 1
                    : Math.max((post.like_count || 0) - 1, 0),
                }
              : post
          ),
        };
      }
      return oldData;
    }
  );
}

/**
 * 게시물 좋아요 mutation
 */
export function useLikePost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: likePost,
    onMutate: async (postId) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists() });
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(postId) });

      // Optimistic Update 적용
      updatePostLikeInCache(queryClient, postId, true);

      // 상세 캐시도 업데이트
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          is_liked: true,
          like_count: (oldData.like_count || 0) + 1,
        };
      });

      // 공유 페이지 세션 캐시도 업데이트 (Optimistic Update)
      queryClient.setQueriesData(
        { queryKey: ['sharePageSession'] },
        (oldData: any) => {
          if (!oldData?.shared_post || oldData.shared_post.id !== postId) return oldData;
          return {
            ...oldData,
            shared_post: {
              ...oldData.shared_post,
              is_liked: true,
              like_count: (oldData.shared_post.like_count || 0) + 1,
            },
          };
        }
      );
    },
    onSuccess: (_, postId) => {
      // 공유 페이지 세션 캐시 무효화 (실제 데이터로 갱신)
      queryClient.invalidateQueries({ queryKey: ['sharePageSession'] });
      toast.success('게시물을 좋아합니다.');
    },
    onError: (error, postId) => {
      // 에러 시 롤백
      updatePostLikeInCache(queryClient, postId, false);
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          is_liked: false,
          like_count: Math.max((oldData.like_count || 0) - 1, 0),
        };
      });

      // 공유 페이지 세션 캐시도 롤백
      queryClient.setQueriesData(
        { queryKey: ['sharePageSession'] },
        (oldData: any) => {
          if (!oldData?.shared_post || oldData.shared_post.id !== postId) return oldData;
          return {
            ...oldData,
            shared_post: {
              ...oldData.shared_post,
              is_liked: false,
              like_count: Math.max((oldData.shared_post.like_count || 0) - 1, 0),
            },
          };
        }
      );

      toast.error(error.message || '좋아요에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 좋아요 취소 mutation
 */
export function useUnlikePost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: unlikePost,
    onMutate: async (postId) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists() });
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(postId) });

      // Optimistic Update 적용
      updatePostLikeInCache(queryClient, postId, false);

      // 상세 캐시도 업데이트
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          is_liked: false,
          like_count: Math.max((oldData.like_count || 0) - 1, 0),
        };
      });

      // 공유 페이지 세션 캐시도 업데이트 (Optimistic Update)
      queryClient.setQueriesData(
        { queryKey: ['sharePageSession'] },
        (oldData: any) => {
          if (!oldData?.shared_post || oldData.shared_post.id !== postId) return oldData;
          return {
            ...oldData,
            shared_post: {
              ...oldData.shared_post,
              is_liked: false,
              like_count: Math.max((oldData.shared_post.like_count || 0) - 1, 0),
            },
          };
        }
      );
    },
    onSuccess: (_, postId) => {
      // 공유 페이지 세션 캐시 무효화 (실제 데이터로 갱신)
      queryClient.invalidateQueries({ queryKey: ['sharePageSession'] });
      toast.success('좋아요를 취소했습니다.');
    },
    onError: (error, postId) => {
      // 에러 시 롤백
      updatePostLikeInCache(queryClient, postId, true);
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          is_liked: true,
          like_count: (oldData.like_count || 0) + 1,
        };
      });

      // 공유 페이지 세션 캐시도 롤백
      queryClient.setQueriesData(
        { queryKey: ['sharePageSession'] },
        (oldData: any) => {
          if (!oldData?.shared_post || oldData.shared_post.id !== postId) return oldData;
          return {
            ...oldData,
            shared_post: {
              ...oldData.shared_post,
              is_liked: true,
              like_count: (oldData.shared_post.like_count || 0) + 1,
            },
          };
        }
      );

      toast.error(error.message || '좋아요 취소에 실패했습니다.');
    },
    ...options,
  });
}

// 목록 캐시에서 게시물 북마크 상태를 Optimistic Update하는 헬퍼 함수
function updatePostSaveInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number,
  isSaved: boolean
) {
  // 모든 목록 캐시를 순회하며 해당 게시물의 북마크 상태 업데이트
  queryClient.setQueriesData(
    { queryKey: postsKeys.lists() },
    (oldData: any) => {
      if (!oldData) return oldData;
      // InfiniteQuery 데이터 구조 처리
      if (oldData.pages) {
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            results: page.results?.map((post: any) =>
              post.id === postId
                ? { ...post, is_saved: isSaved }
                : post
            ),
          })),
        };
      }
      // 일반 쿼리 데이터 구조 처리
      if (oldData.results) {
        return {
          ...oldData,
          results: oldData.results.map((post: any) =>
            post.id === postId
              ? { ...post, is_saved: isSaved }
              : post
          ),
        };
      }
      return oldData;
    }
  );
}

// 북마크 mutation context 타입
type BookmarkMutationContext = {
  previousSavedPosts: unknown;
};

/**
 * 게시물 북마크 mutation
 */
export function useSavePost(
  options?: Omit<UseMutationOptions<void, Error, number, BookmarkMutationContext>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number, BookmarkMutationContext>({
    mutationFn: savePost,
    onMutate: async (postId) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists() });
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(postId) });
      await queryClient.cancelQueries({ queryKey: [...userKeys.all, 'savedPosts'] });

      // Optimistic Update 적용
      updatePostSaveInCache(queryClient, postId, true);

      // 상세 캐시도 업데이트
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, is_saved: true };
      });

      // savedPosts 캐시에서 해당 포스트의 is_saved 상태를 true로 변경 (Optimistic Update)
      // 롤백을 위해 이전 데이터 저장
      const savedPostsKey = [...userKeys.all, 'savedPosts', 'infinite'];
      const previousSavedPosts = queryClient.getQueryData(savedPostsKey);

      // 정확한 쿼리 키로 캐시 업데이트 (카운트 즉시 반영)
      queryClient.setQueryData(
        savedPostsKey,
        (oldData: any) => {
          if (!oldData) return oldData;
          // InfiniteQuery 데이터 구조 처리
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, pageIndex: number) => ({
                ...page,
                // 첫 페이지의 count만 증가
                count: pageIndex === 0 ? (page.count || 0) + 1 : page.count,
                results: page.results?.map((post: any) =>
                  post.id === postId ? { ...post, is_saved: true } : post
                ),
              })),
            };
          }
          // 일반 쿼리 데이터 구조 처리
          if (oldData.results) {
            return {
              ...oldData,
              count: (oldData.count || 0) + 1,
              results: oldData.results.map((post: any) =>
                post.id === postId ? { ...post, is_saved: true } : post
              ),
            };
          }
          return oldData;
        }
      );

      // 공유 페이지 세션 캐시도 업데이트 (Optimistic Update)
      queryClient.setQueriesData(
        { queryKey: ['sharePageSession'] },
        (oldData: any) => {
          if (!oldData?.shared_post || oldData.shared_post.id !== postId) return oldData;
          return {
            ...oldData,
            shared_post: {
              ...oldData.shared_post,
              is_saved: true,
              save_count: (oldData.shared_post.save_count || 0) + 1,
            },
          };
        }
      );

      return { previousSavedPosts };
    },
    onSuccess: (_, postId) => {
      // 공유 페이지 세션 캐시 무효화 (실제 데이터로 갱신)
      queryClient.invalidateQueries({ queryKey: ['sharePageSession'] });
      toast.success('게시물을 저장했습니다.');
    },
    onError: (error, postId, context) => {
      // 에러 시 롤백
      updatePostSaveInCache(queryClient, postId, false);
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, is_saved: false };
      });

      // savedPosts 캐시 롤백
      if (context?.previousSavedPosts) {
        queryClient.setQueryData([...userKeys.all, 'savedPosts', 'infinite'], context.previousSavedPosts);
      }

      // 공유 페이지 세션 캐시도 롤백
      queryClient.setQueriesData(
        { queryKey: ['sharePageSession'] },
        (oldData: any) => {
          if (!oldData?.shared_post || oldData.shared_post.id !== postId) return oldData;
          return {
            ...oldData,
            shared_post: {
              ...oldData.shared_post,
              is_saved: false,
              save_count: Math.max((oldData.shared_post.save_count || 0) - 1, 0),
            },
          };
        }
      );

      toast.error(error.message || '저장에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 북마크 취소 mutation
 */
export function useUnsavePost(
  options?: Omit<UseMutationOptions<void, Error, number, BookmarkMutationContext>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number, BookmarkMutationContext>({
    mutationFn: unsavePost,
    onMutate: async (postId) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists() });
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(postId) });
      await queryClient.cancelQueries({ queryKey: [...userKeys.all, 'savedPosts'] });

      // Optimistic Update 적용
      updatePostSaveInCache(queryClient, postId, false);

      // 상세 캐시도 업데이트
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, is_saved: false };
      });

      // savedPosts 캐시에서 해당 포스트의 is_saved 상태를 false로 변경 (Optimistic Update)
      // 롤백을 위해 이전 데이터 저장
      const savedPostsKey = [...userKeys.all, 'savedPosts', 'infinite'];
      const previousSavedPosts = queryClient.getQueryData(savedPostsKey);

      // 정확한 쿼리 키로 캐시 업데이트 (카운트 즉시 반영)
      queryClient.setQueryData(
        savedPostsKey,
        (oldData: any) => {
          if (!oldData) return oldData;
          // InfiniteQuery 데이터 구조 처리
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, pageIndex: number) => ({
                ...page,
                // 첫 페이지의 count만 감소
                count: pageIndex === 0 ? Math.max((page.count || 0) - 1, 0) : page.count,
                results: page.results?.map((post: any) =>
                  post.id === postId ? { ...post, is_saved: false } : post
                ),
              })),
            };
          }
          // 일반 쿼리 데이터 구조 처리
          if (oldData.results) {
            return {
              ...oldData,
              count: Math.max((oldData.count || 0) - 1, 0),
              results: oldData.results.map((post: any) =>
                post.id === postId ? { ...post, is_saved: false } : post
              ),
            };
          }
          return oldData;
        }
      );

      // 공유 페이지 세션 캐시도 업데이트 (Optimistic Update)
      queryClient.setQueriesData(
        { queryKey: ['sharePageSession'] },
        (oldData: any) => {
          if (!oldData?.shared_post || oldData.shared_post.id !== postId) return oldData;
          return {
            ...oldData,
            shared_post: {
              ...oldData.shared_post,
              is_saved: false,
              save_count: Math.max((oldData.shared_post.save_count || 0) - 1, 0),
            },
          };
        }
      );

      return { previousSavedPosts };
    },
    onSuccess: (_, postId) => {
      // 공유 페이지 세션 캐시 무효화 (실제 데이터로 갱신)
      queryClient.invalidateQueries({ queryKey: ['sharePageSession'] });
      toast.success('저장을 취소했습니다.');
    },
    onError: (error, postId, context) => {
      // 에러 시 롤백
      updatePostSaveInCache(queryClient, postId, true);
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, is_saved: true };
      });

      // savedPosts 캐시 롤백
      if (context?.previousSavedPosts) {
        queryClient.setQueryData([...userKeys.all, 'savedPosts', 'infinite'], context.previousSavedPosts);
      }

      // 공유 페이지 세션 캐시도 롤백
      queryClient.setQueriesData(
        { queryKey: ['sharePageSession'] },
        (oldData: any) => {
          if (!oldData?.shared_post || oldData.shared_post.id !== postId) return oldData;
          return {
            ...oldData,
            shared_post: {
              ...oldData.shared_post,
              is_saved: true,
              save_count: (oldData.shared_post.save_count || 0) + 1,
            },
          };
        }
      );

      toast.error(error.message || '저장 취소에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 조회수 증가 mutation
 */
export function useViewPost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: viewPost,
    onSuccess: (_, postId) => {
      // 해당 게시물 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) });
    },
    onError: (error) => {
      // 조회수 증가 실패는 조용히 처리 (토스트 표시 안함)
      console.error('Failed to increment view count:', error);
    },
    ...options,
  });
}

/**
 * 게시물 리포스트 mutation
 */
export function useRepostPost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: repostPost,
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      toast.success('리포스트 되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '리포스트에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 리포스트 취소 mutation
 */
export function useUnrepostPost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: unrepostPost,
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      toast.success('리포스트를 취소했습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '리포스트 취소에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 이미지 업로드 mutation
 */
export function useUploadPostImage(
  options?: Omit<UseMutationOptions<ImageUploadResponse, Error, File>, 'mutationFn'>
) {
  return useMutation<ImageUploadResponse, Error, File>({
    mutationFn: uploadPostImage,
    onSuccess: () => {
      toast.success('이미지가 업로드되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '이미지 업로드에 실패했습니다.');
    },
    ...options,
  });
}
