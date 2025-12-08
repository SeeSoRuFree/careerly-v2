/**
 * 프로필 관련 뮤테이션 훅
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateMyProfile,
  uploadProfileImage,
  addCareer,
  updateCareer,
  deleteCareer,
  addEducation,
  updateEducation,
  deleteEducation,
  replaceProfileSkills,
} from '../../services/profile.service';
import type {
  ReplaceSkillsRequest,
  ReplaceSkillsResponse,
} from '../../services/profile.service';
import { profileKeys } from '../queries/useProfile';
import type {
  ProfileDetail,
  ProfileUpdateRequest,
  ProfileImageUploadResponse,
  CareerRequest,
  EducationRequest,
  Career,
  Education,
} from '../../types/profile.types';
import { toast } from 'sonner';

/**
 * 프로필 업데이트 훅
 */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation<ProfileDetail, Error, ProfileUpdateRequest>({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      // 모든 프로필 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 프로필 이미지 업로드 훅
 */
export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation<ProfileImageUploadResponse, Error, File>({
    mutationFn: uploadProfileImage,
    onSuccess: () => {
      // 모든 프로필 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      toast.success('프로필 이미지가 변경되었습니다.');
    },
    onError: (error) => {
      toast.error(error.message || '이미지 업로드에 실패했습니다.');
    },
  });
}

/**
 * 경력 추가 훅
 */
export function useAddCareer() {
  const queryClient = useQueryClient();

  return useMutation<Career, Error, CareerRequest>({
    mutationFn: addCareer,
    onSuccess: () => {
      // 모든 프로필 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 경력 수정 훅
 */
export function useUpdateCareer() {
  const queryClient = useQueryClient();

  return useMutation<Career, Error, { careerId: number; data: CareerRequest }>({
    mutationFn: ({ careerId, data }) => updateCareer(careerId, data),
    onSuccess: () => {
      // 모든 프로필 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 경력 삭제 훅
 */
export function useDeleteCareer() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteCareer,
    onSuccess: () => {
      // 모든 프로필 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 학력 추가 훅
 */
export function useAddEducation() {
  const queryClient = useQueryClient();

  return useMutation<Education, Error, EducationRequest>({
    mutationFn: addEducation,
    onSuccess: () => {
      // 모든 프로필 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 학력 수정 훅
 */
export function useUpdateEducation() {
  const queryClient = useQueryClient();

  return useMutation<Education, Error, { educationId: number; data: EducationRequest }>({
    mutationFn: ({ educationId, data }) => updateEducation(educationId, data),
    onSuccess: () => {
      // 모든 프로필 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 학력 삭제 훅
 */
export function useDeleteEducation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteEducation,
    onSuccess: () => {
      // 모든 프로필 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 스킬 일괄 교체 훅
 */
export function useReplaceProfileSkills() {
  const queryClient = useQueryClient();

  return useMutation<ReplaceSkillsResponse, Error, ReplaceSkillsRequest>({
    mutationFn: replaceProfileSkills,
    onSuccess: () => {
      // 모든 프로필 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
