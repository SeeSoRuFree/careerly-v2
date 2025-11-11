'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

export interface AccountProfileHeaderProps {
  /**
   * Avatar image URL
   */
  avatarUrl?: string;
  /**
   * Display name
   */
  displayName: string;
  /**
   * Username or user ID
   */
  username: string;
  /**
   * Callback when change avatar is clicked
   */
  onChangeAvatar?: () => void;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * AccountProfileHeader
 *
 * 사용자 아바타 + 이름 + 아이디 표시
 *
 * @example
 * ```tsx
 * <AccountProfileHeader
 *   avatarUrl="/avatar.jpg"
 *   displayName="홍길동"
 *   username="@honggildong"
 *   onChangeAvatar={() => console.log('Change avatar')}
 * />
 * ```
 */
export function AccountProfileHeader({
  avatarUrl,
  displayName,
  username,
  onChangeAvatar,
  className,
}: AccountProfileHeaderProps) {
  // Generate fallback initials from display name
  const fallback = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('flex items-start gap-6', className)}>
      {/* Avatar Section */}
      <div className="relative group">
        <Avatar className="h-24 w-24">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
          <AvatarFallback className="text-xl font-semibold">
            {fallback}
          </AvatarFallback>
        </Avatar>

        {onChangeAvatar && (
          <button
            onClick={onChangeAvatar}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Change avatar"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
        )}
      </div>

      {/* User Info Section */}
      <div className="flex-1 pt-2">
        <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
        <p className="text-sm text-slate-600 mt-1">{username}</p>

        {onChangeAvatar && (
          <Button
            variant="outline"
            size="sm"
            onClick={onChangeAvatar}
            className="mt-4"
          >
            <Camera className="h-4 w-4 mr-2" />
            프로필 사진 변경
          </Button>
        )}
      </div>
    </div>
  );
}
