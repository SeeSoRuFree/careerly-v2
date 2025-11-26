/**
 * 프로필 관련 뮤테이션 훅
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateMyProfile,
  addCareer,
  updateCareer,
  deleteCareer,
  addEducation,
  updateEducation,
  deleteEducation,
} from '../../services/profile.service';
import { profileKeys } from '../queries/useProfile';
import type {
  ProfileDetail,
  ProfileUpdateRequest,
  CareerRequest,
  EducationRequest,
} from '../../types/profile.types';

/**
 * 프로필 업데이트 훅
 */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation<ProfileDetail, Error, ProfileUpdateRequest>({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 경력 추가 훅
 */
export function useAddCareer() {
  const queryClient = useQueryClient();

  return useMutation<ProfileDetail, Error, CareerRequest>({
    mutationFn: addCareer,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 경력 수정 훅
 */
export function useUpdateCareer() {
  const queryClient = useQueryClient();

  return useMutation<ProfileDetail, Error, { careerId: number; data: CareerRequest }>({
    mutationFn: ({ careerId, data }) => updateCareer(careerId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me(), data);
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
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

/**
 * 학력 추가 훅
 */
export function useAddEducation() {
  const queryClient = useQueryClient();

  return useMutation<ProfileDetail, Error, EducationRequest>({
    mutationFn: addEducation,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

/**
 * 학력 수정 훅
 */
export function useUpdateEducation() {
  const queryClient = useQueryClient();

  return useMutation<ProfileDetail, Error, { educationId: number; data: EducationRequest }>({
    mutationFn: ({ educationId, data }) => updateEducation(educationId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me(), data);
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
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}
