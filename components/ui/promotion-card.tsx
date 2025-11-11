'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { MediaThumb } from '@/components/ui/media-thumb';
import { cn } from '@/lib/utils';
import { ExternalLink, Clock, Tag } from 'lucide-react';

export interface PromotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  imageUrl?: string;
  logoUrl?: string;
  company?: string;
  category?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  href?: string;
  ctaText?: string;
  ctaHref?: string;
  sponsored?: boolean;
  variant?: 'default' | 'banner' | 'compact';
}

export const PromotionCard = React.forwardRef<HTMLDivElement, PromotionCardProps>(
  (
    {
      title,
      description,
      imageUrl,
      logoUrl,
      company,
      category,
      tags = [],
      startDate,
      endDate,
      href,
      ctaText = '자세히 보기',
      ctaHref,
      sponsored = true,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    // Banner variant - horizontal layout with emphasis
    if (variant === 'banner') {
      return (
        <Card
          ref={ref}
          className={cn(
            'p-6 bg-gradient-to-r from-coral-50 to-white border-coral-200',
            className
          )}
          {...props}
        >
          {sponsored && (
            <Badge tone="coral" className="mb-3 text-xs">
              Sponsored
            </Badge>
          )}

          <div className="flex gap-6 items-center">
            {/* Image/Logo */}
            {(imageUrl || logoUrl) && (
              <div className="shrink-0">
                {imageUrl ? (
                  <div className="w-32 h-32 rounded-lg overflow-hidden">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                  </div>
                ) : logoUrl ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-2">
                    <img src={logoUrl} alt={company || title} className="w-full h-full object-contain" />
                  </div>
                ) : null}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {category && (
                <Badge tone="slate" className="mb-2 text-xs">
                  {category}
                </Badge>
              )}

              {href ? (
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  <Link href={href} variant="subtle" className="hover:text-coral-500">
                    {title}
                  </Link>
                </h3>
              ) : (
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {title}
                </h3>
              )}

              {company && (
                <p className="text-sm text-slate-600 mb-2 font-medium">{company}</p>
              )}

              <p className="text-sm text-slate-700 mb-4 line-clamp-2">{description}</p>

              {/* Tags and CTA */}
              <div className="flex items-center justify-between gap-4">
                {tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} tone="slate" variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  variant="coral"
                  size="sm"
                  asChild
                  className="shrink-0"
                >
                  <a href={ctaHref || href} target="_blank" rel="noopener noreferrer">
                    {ctaText}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Date Range */}
          {(startDate || endDate) && (
            <div className="mt-4 pt-4 border-t border-coral-100 flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {startDate && endDate
                  ? `${startDate} ~ ${endDate}`
                  : startDate || endDate}
              </span>
            </div>
          )}
        </Card>
      );
    }

    // Compact variant - minimal layout
    if (variant === 'compact') {
      return (
        <Card
          ref={ref}
          className={cn(
            'p-4 hover:border-coral-300 transition-all duration-200',
            className
          )}
          {...props}
        >
          <div className="flex items-start gap-3">
            {logoUrl && (
              <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-1">
                <img src={logoUrl} alt={company || title} className="w-full h-full object-contain" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                {href ? (
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                  <Link href={href} variant="subtle" className="hover:text-coral-500">
                    {title}
                  </Link>
                </h4>
              ) : (
                <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {title}
                </h4>
              )}
                {sponsored && (
                  <Badge tone="coral" className="text-xs shrink-0">
                    AD
                  </Badge>
                )}
              </div>

              {company && (
                <p className="text-xs text-slate-600 mb-2">{company}</p>
              )}

              <p className="text-xs text-slate-600 line-clamp-2 mb-2">{description}</p>

              <Button variant="ghost" size="sm" className="h-7 text-xs px-2" asChild>
                <a href={ctaHref || href} target="_blank" rel="noopener noreferrer">
                  {ctaText}
                </a>
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    // Default variant - vertical card layout
    return (
      <Card
        ref={ref}
        className={cn(
          'overflow-hidden hover:border-coral-300 transition-all duration-200',
          className
        )}
        {...props}
      >
        {/* Image */}
        {imageUrl && (
          <div className="relative">
            <MediaThumb
              src={imageUrl}
              alt={title}
              ratio="16:9"
            />
            {sponsored && (
              <div className="absolute top-3 right-3">
                <Badge tone="coral" className="text-xs">
                  Sponsored
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          {/* Category and Company */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {category && (
              <Badge tone="slate" className="text-xs">
                {category}
              </Badge>
            )}
            {company && !category && (
              <span className="text-xs font-medium text-slate-600">{company}</span>
            )}
          </div>

          {/* Logo + Title */}
          <div className="flex items-start gap-3 mb-3">
            {logoUrl && (
              <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-1">
                <img src={logoUrl} alt={company || title} className="w-full h-full object-contain" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {href ? (
                <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-2">
                  <Link href={href} variant="subtle" className="hover:text-coral-500">
                    {title}
                  </Link>
                </h3>
              ) : (
                <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-2">
                  {title}
                </h3>
              )}
              {company && category && (
                <p className="text-xs text-slate-600">{company}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-700 line-clamp-3 mb-4">{description}</p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              {tags.slice(0, 4).map((tag, idx) => (
                <Badge key={idx} tone="slate" variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Date Range */}
          {(startDate || endDate) && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {startDate && endDate
                  ? `${startDate} ~ ${endDate}`
                  : startDate || endDate}
              </span>
            </div>
          )}

          {/* CTA Button */}
          <Button
            variant="coral"
            size="sm"
            className="w-full"
            asChild
          >
            <a href={ctaHref || href} target="_blank" rel="noopener noreferrer">
              {ctaText}
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </Card>
    );
  }
);

PromotionCard.displayName = 'PromotionCard';
