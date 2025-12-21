import { DiscoverContentCardProps } from '@/components/ui/discover-content-card';

// Metadata types for different content types
export interface JobMetadata {
  averageSalary?: string;
  openPositions?: number;
  employeeSatisfaction?: number; // 0-100
  hiringTrend?: number; // -10 ~ +10 (%)
  companySize?: string;
  industry?: string;
  foundedYear?: number;
  companyName?: string;
  companyLogo?: string;
}

export interface BlogMetadata {
  totalPosts?: number;
  averageViews?: number;
  postFrequency?: string;
  popularityRank?: number;
  techStack?: string[];
}

export interface BookMetadata {
  publisher?: string;
  rating?: number;
  reviewCount?: number;
  pages?: number;
  publishDate?: string;
  isbn?: string;
}

export interface CourseMetadata {
  students?: number;
  rating?: number;
  completionRate?: number;
  duration?: string;
  level?: string;
}

export interface JobRoleMetadata {
  roleName: string;
  marketDemand: number;
  salaryRange: {
    min: number;
    max: number;
    average: number;
  };
  experienceDistribution: {
    junior: number;
    mid: number;
    senior: number;
  };
  requiredSkills: Array<{
    name: string;
    importance: number;
  }>;
  demandTrend: number[];
  growthRate: number;
  competitionLevel: 'low' | 'medium' | 'high';
}

export type ContentMetadata = JobMetadata | BlogMetadata | BookMetadata | CourseMetadata;

// Extended type for detailed view
export interface DiscoverContentDetail extends Omit<DiscoverContentCardProps, 'relatedContent' | 'contentId'> {
  contentId: string | number;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  readTime?: string;
  fullContent?: string;
  relatedContent?: DiscoverContentCardProps[];
  metadata?: ContentMetadata;
  jobRoleMetadata?: JobRoleMetadata;
}

// 회사 등록 폼 URL
export const COMPANY_REGISTRATION_FORM_URL = 'https://publyco.notion.site/1523c8c5199580a39cb9d854a7dbd767';
