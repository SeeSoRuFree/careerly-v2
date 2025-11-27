'use client';

import { useQuery } from '@tanstack/react-query';
import { JobData, JobWidgetConfig } from './types';
import { WidgetDataHook } from '../../core/types';

// Mock 데이터 (실제 API 연동 전)
const mockJobData: JobData[] = [
  {
    id: '1',
    title: 'Frontend Engineer',
    company: '토스',
    location: '서울 강남구',
    salary: '6,000 ~ 10,000만원',
    tags: ['React', 'TypeScript', '3년↑'],
    postedAt: '2시간 전',
    deadline: 'D-7',
  },
  {
    id: '2',
    title: 'Backend Developer',
    company: '카카오',
    location: '경기 판교',
    salary: '5,500 ~ 9,000만원',
    tags: ['Java', 'Spring', 'AWS'],
    postedAt: '5시간 전',
    deadline: 'D-14',
  },
  {
    id: '3',
    title: 'ML Engineer',
    company: '네이버',
    location: '경기 판교',
    salary: '7,000 ~ 12,000만원',
    tags: ['Python', 'PyTorch', 'MLOps'],
    postedAt: '1일 전',
  },
];

async function fetchJobData(config?: JobWidgetConfig): Promise<JobData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  // TODO: 실제 API 연동
  // return await getDailyJobs({ page_size: config?.limit || 5 });

  return mockJobData;
}

export function useJobData(config?: JobWidgetConfig): WidgetDataHook<JobData[]> {
  const query = useQuery({
    queryKey: ['widget', 'jobs', config],
    queryFn: () => fetchJobData(config),
    staleTime: 5 * 60 * 1000, // 5분
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
