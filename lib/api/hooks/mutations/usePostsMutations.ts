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
    },
    onSuccess: () => {
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
    },
    onSuccess: () => {
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

/**
 * 게시물 북마크 mutation
 */
export function useSavePost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: savePost,
    onMutate: async (postId) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists() });
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(postId) });

      // Optimistic Update 적용
      updatePostSaveInCache(queryClient, postId, true);

      // 상세 캐시도 업데이트
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, is_saved: true };
      });
    },
    onSuccess: () => {
      toast.success('게시물을 저장했습니다.');
    },
    onError: (error, postId) => {
      // 에러 시 롤백
      updatePostSaveInCache(queryClient, postId, false);
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, is_saved: false };
      });
      toast.error(error.message || '저장에 실패했습니다.');
    },
    ...options,
  });
}

/**
 * 게시물 북마크 취소 mutation
 */
export function useUnsavePost(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: unsavePost,
    onMutate: async (postId) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: postsKeys.lists() });
      await queryClient.cancelQueries({ queryKey: postsKeys.detail(postId) });

      // Optimistic Update 적용
      updatePostSaveInCache(queryClient, postId, false);

      // 상세 캐시도 업데이트
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, is_saved: false };
      });
    },
    onSuccess: () => {
      toast.success('저장을 취소했습니다.');
    },
    onError: (error, postId) => {
      // 에러 시 롤백
      updatePostSaveInCache(queryClient, postId, true);
      queryClient.setQueryData(postsKeys.detail(postId), (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, is_saved: true };
      });
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
