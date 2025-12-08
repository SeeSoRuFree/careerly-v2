'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';

export interface CTACardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  ctaText?: string;
  features?: string[];
}

const CTACard = React.forwardRef<HTMLDivElement, CTACardProps>(
  (
    {
      title = '나만의 질문하기',
      description = 'AI가 커리어 고민을 해결해드립니다',
      ctaText = '지금 질문하기',
      features = [
        '실시간 AI 답변',
        '신뢰할 수 있는 출처',
        '무제한 질문',
      ],
      className,
      ...props
    },
    ref
  ) => {
    const router = useRouter();

    const handleCTA = () => {
      router.push('/');
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 p-8 shadow-lg',
          className
        )}
        {...props}
      >
        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-6 w-6 text-white" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-teal-50">{description}</p>
          </div>

          {/* Features */}
          {features && features.length > 0 && (
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-white">
                  <Check className="h-5 w-5 text-teal-200 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* CTA Button */}
          <Button
            onClick={handleCTA}
            variant="solid"
            size="md"
            className="w-full bg-white text-teal-600 hover:bg-teal-50 font-semibold shadow-md"
          >
            {ctaText}
          </Button>
        </div>

        {/* Decorative gradient blobs */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-teal-700/30 rounded-full blur-3xl" />
      </div>
    );
  }
);

CTACard.displayName = 'CTACard';

export { CTACard };
