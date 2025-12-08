'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { UserPlus } from 'lucide-react';

export interface AuthorInfo {
  name: string;
  jobTitle?: string;
  avatarUrl?: string;
  userId?: string;
}

export interface AuthorProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  author: AuthorInfo;
  createdAt: string;
}

const AuthorProfileCard = React.forwardRef<HTMLDivElement, AuthorProfileCardProps>(
  ({ author, createdAt, className, ...props }, ref) => {
    const initials = author.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between gap-4', className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-slate-900">{author.name}</h3>
            {author.jobTitle && (
              <p className="text-sm text-slate-600">{author.jobTitle}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">
              {formatRelativeTime(createdAt)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700"
        >
          <UserPlus className="h-4 w-4" />
          팔로우
        </Button>
      </div>
    );
  }
);

AuthorProfileCard.displayName = 'AuthorProfileCard';

export { AuthorProfileCard };
