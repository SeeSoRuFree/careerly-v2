import * as React from 'react';
import NextLink from 'next/link';
import { ExternalLink } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const linkVariants = cva(
  'inline-flex items-center gap-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 rounded-sm cursor-pointer',
  {
    variants: {
      variant: {
        default: 'text-slate-700 hover:text-slate-800 underline underline-offset-4',
        subtle: 'text-slate-600 hover:text-slate-800 hover:underline underline-offset-4',
        nav: 'text-slate-600 hover:text-slate-800 font-medium',
        coral: 'text-coral-500 hover:text-coral-600 underline-offset-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href?: string;
  external?: boolean;
  prefetch?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, href, external = false, prefetch, children, ...props }, ref) => {
    // If href is undefined, render as span
    if (!href) {
      return (
        <span className={cn(linkVariants({ variant, className }))} ref={ref as any} {...props}>
          {children}
        </span>
      );
    }

    const isExternal = external || href.startsWith('http');

    if (isExternal) {
      return (
        <a
          className={cn(linkVariants({ variant, className }))}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          ref={ref}
          {...props}
        >
          {children}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }

    return (
      <NextLink
        className={cn(linkVariants({ variant, className }))}
        href={href}
        prefetch={prefetch}
        ref={ref}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);
Link.displayName = 'Link';

export { Link, linkVariants };
