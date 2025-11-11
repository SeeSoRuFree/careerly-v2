'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Mail, MessageCircle } from 'lucide-react';

export interface SupportContactSectionProps {
  /**
   * Callback when contact support is clicked
   */
  onContactSupport?: () => void;
  /**
   * Optional help center link
   */
  helpCenterLink?: string;
  /**
   * Optional support email
   */
  supportEmail?: string;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * SupportContactSection
 *
 * 지원 / 문의 버튼 표시
 *
 * @example
 * ```tsx
 * <SupportContactSection
 *   onContactSupport={() => console.log('Contact support')}
 *   helpCenterLink="https://help.careerly.com"
 *   supportEmail="support@careerly.com"
 * />
 * ```
 */
export function SupportContactSection({
  onContactSupport,
  helpCenterLink,
  supportEmail,
  className,
}: SupportContactSectionProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-slate-100">
            <HelpCircle className="h-6 w-6 text-slate-700" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">도움이 필요하신가요?</h3>
            <p className="text-sm text-slate-600 mb-4">
              문제가 있거나 질문이 있으시면 언제든지 문의해주세요.
            </p>

            <div className="flex flex-wrap gap-2">
              {onContactSupport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onContactSupport}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  지원 문의
                </Button>
              )}

              {helpCenterLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a href={helpCenterLink} target="_blank" rel="noopener noreferrer">
                    <HelpCircle className="h-4 w-4" />
                    도움말 센터
                  </a>
                </Button>
              )}

              {supportEmail && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a href={`mailto:${supportEmail}`}>
                    <Mail className="h-4 w-4" />
                    이메일 문의
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
