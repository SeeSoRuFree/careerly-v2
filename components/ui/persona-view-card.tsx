'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Briefcase, MapPin, TrendingUp } from 'lucide-react';

export interface PersonaSkill {
  skillName: string;
  proficiency: string;
}

export interface PersonaData {
  id: number;
  name: string;
  role: string;
  salary: string;
  skills: PersonaSkill[];
  location: string;
  position: string;
  jobTitle: string;
  companyType: string;
  matchReason: string;
  currentProject1: string;
  currentProject2: string;
  yearsOfExperience: number;
}

export interface PersonaViewCardProps extends React.HTMLAttributes<HTMLDivElement> {
  persona: PersonaData;
  onViewDetail?: () => void;
  onEdit?: () => void;
  title?: string;
  description?: string;
}

export const PersonaViewCard = React.forwardRef<HTMLDivElement, PersonaViewCardProps>(
  (
    {
      persona,
      onViewDetail,
      onEdit,
      title = '나의 페르소나',
      description = '현재 설정된 커리어 페르소나입니다.',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card ref={ref} className={cn('p-4', className)} {...props}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-coral-500" />
              {title}
            </h3>
            {description && (
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-3 mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-900">{persona.name}</h4>
            <p className="text-sm text-slate-700 mt-1">{persona.jobTitle}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{persona.yearsOfExperience}년차</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{persona.location}</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <h5 className="text-sm font-semibold text-slate-700">핵심 스킬</h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {persona.skills.map((skill, index) => (
              <Chip
                key={index}
                variant="default"
                size="sm"
              >
                {skill.skillName}
                <span className="ml-1 text-xs text-slate-500">
                  {skill.proficiency}
                </span>
              </Chip>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
          <div className="text-xs">
            <span className="font-medium text-slate-700">희망 연봉:</span>
            <span className="text-slate-600 ml-1">{persona.salary}</span>
          </div>
          <div className="text-xs">
            <span className="font-medium text-slate-700">선호 회사:</span>
            <span className="text-slate-600 ml-1">{persona.companyType}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="solid"
            size="sm"
            onClick={onViewDetail}
            className="flex-1"
          >
            자세히 보기
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              수정
            </Button>
          )}
        </div>
      </Card>
    );
  }
);

PersonaViewCard.displayName = 'PersonaViewCard';
