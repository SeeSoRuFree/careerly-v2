'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

export interface SubscriptionPlanCardProps {
  /**
   * Plan name (e.g., "Free", "Pro", "Enterprise")
   */
  planName: string;
  /**
   * Plan description
   */
  description: string;
  /**
   * List of features included in the plan
   */
  features?: string[];
  /**
   * Whether this is a premium/paid plan
   */
  isPremium?: boolean;
  /**
   * Callback when upgrade button is clicked
   */
  onUpgrade?: () => void;
  /**
   * Custom upgrade button label
   */
  upgradeLabel?: string;
  /**
   * Optional className
   */
  className?: string;
}

/**
 * SubscriptionPlanCard
 *
 * 현재 플랜 확인 + 업그레이드 CTA
 *
 * @example
 * ```tsx
 * <SubscriptionPlanCard
 *   planName="Pro"
 *   description="모든 프리미엄 기능 이용 가능"
 *   features={['무제한 검색', 'AI 분석', '우선 지원']}
 *   isPremium
 *   onUpgrade={() => console.log('Upgrade')}
 * />
 * ```
 */
export function SubscriptionPlanCard({
  planName,
  description,
  features = [],
  isPremium = false,
  onUpgrade,
  upgradeLabel = '업그레이드',
  className,
}: SubscriptionPlanCardProps) {
  return (
    <Card className={cn('', className)} elevation="md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isPremium && <Sparkles className="h-5 w-5 text-coral-500" />}
            {planName}
          </CardTitle>
          <Badge variant={isPremium ? 'default' : 'secondary'}>
            {isPremium ? '프리미엄' : '무료'}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {features.length > 0 && (
        <CardContent>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      )}

      {onUpgrade && (
        <CardFooter>
          <Button
            variant={isPremium ? 'outline' : 'coral'}
            onClick={onUpgrade}
            className="w-full"
          >
            {upgradeLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
