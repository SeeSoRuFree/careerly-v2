'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ============================================================================
// SidebarRail - Main Container
// ============================================================================

const sidebarRailVariants = cva(
  'flex flex-col bg-white transition-all duration-300 ease-in-out w-20 z-50',
  {
    variants: {
      variant: {
        default: 'border-r border-slate-200',
        floating: 'shadow-lg rounded-lg m-4',
        inset: 'bg-slate-50 border-r border-slate-200',
      },
      fixed: {
        true: 'fixed left-0 top-0 h-screen',
        false: 'h-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      fixed: false,
    },
  }
);

export interface SidebarRailProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarRailVariants> {
  activePath?: string;
  sections?: SidebarSections;
}

export interface SidebarSections {
  primary?: NavItemConfig[];
  utilities?: NavItemConfig[];
  account?: AccountButtonConfig;
  ctas?: CTAButtonConfig[];
}

export interface NavItemConfig {
  label: string;
  path?: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  subItems?: SubNavItemConfig[];
}

export interface SubNavItemConfig {
  label: string;
  path?: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface AccountButtonConfig {
  name: string;
  email?: string;
  avatar?: string;
  fallback?: string;
  path?: string;
}

export interface CTAButtonConfig {
  label: string;
  onClick?: () => void;
  variant?: 'solid' | 'outline' | 'coral';
  icon?: LucideIcon;
}

const SidebarRail = React.forwardRef<HTMLDivElement, SidebarRailProps>(
  (
    {
      className,
      variant,
      fixed,
      activePath,
      sections,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(sidebarRailVariants({ variant, fixed, className }))}
        {...props}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-center h-[64px] border-b border-slate-200">
          <img
            src="/images/img_symbol-careerly.png"
            alt="Careerly"
            className="h-8 w-auto"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
          {sections ? (
            <>
              {/* Top Spacer to push primary nav to center-top */}
              <div className="h-16"></div>

              {/* Primary Navigation */}
              {sections.primary && sections.primary.length > 0 && (
                <SidebarSection className="pt-0">
                  {sections.primary.map((item, idx) => (
                    <NavItemButton
                      key={idx}
                      {...item}
                      active={activePath === item.path}
                    />
                  ))}
                </SidebarSection>
              )}

              {/* Spacer to push utilities to bottom */}
              <div className="flex-1"></div>

              {/* Utilities Section - Bottom aligned */}
              {sections.utilities && sections.utilities.length > 0 && (
                <SidebarSection>
                  {sections.utilities.map((item, idx) => (
                    <NavItemButton
                      key={idx}
                      {...item}
                      active={activePath === item.path}
                    />
                  ))}
                </SidebarSection>
              )}

              {/* CTAs Section */}
              {sections.ctas && sections.ctas.length > 0 && (
                <SidebarSection>
                  {sections.ctas.map((cta, idx) => (
                    <CTAButton key={idx} {...cta} />
                  ))}
                </SidebarSection>
              )}
            </>
          ) : (
            children
          )}
        </div>

        {/* Footer with Account */}
        {sections?.account && (
          <div className="border-t border-slate-200 p-2">
            <AccountButton {...sections.account} />
          </div>
        )}
      </div>
    );
  }
);
SidebarRail.displayName = 'SidebarRail';

// ============================================================================
// SidebarSection - Section Wrapper
// ============================================================================

interface SidebarSectionProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarSection = ({ children, className }: SidebarSectionProps) => {
  return (
    <div className={cn("py-2", className)}>
      <div className="space-y-1 px-2">{children}</div>
    </div>
  );
};

// ============================================================================
// NavItemButton - Navigation Item with Sub-menu Support
// ============================================================================

const navItemButtonVariants = cva(
  'flex items-center justify-center w-full p-4 rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer group relative',
  {
    variants: {
      active: {
        true: 'bg-slate-700 text-white',
        false: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface NavItemButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    NavItemConfig {
  active?: boolean;
  asChild?: boolean;
}

const NavItemButton = React.forwardRef<HTMLButtonElement, NavItemButtonProps>(
  (
    {
      className,
      label,
      path,
      icon: Icon,
      badge,
      subItems,
      active = false,
      disabled = false,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [buttonRect, setButtonRect] = React.useState<DOMRect | null>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);

    const hasSubItems = subItems && subItems.length > 0;

    // Update button position once on mount and when opened
    React.useEffect(() => {
      if (buttonRef.current && !buttonRect) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    }, [buttonRect]);

    // Close menu when clicking outside
    React.useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          menuRef.current &&
          !menuRef.current.contains(target) &&
          buttonRef.current &&
          !buttonRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const buttonContent = (
      <>
        {Icon && <Icon className="h-6 w-6 shrink-0" />}
        {badge && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </>
    );

    return (
      <div
        className="relative"
        ref={menuRef}
      >
        {hasSubItems ? (
          <button
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref && 'current' in ref) {
                (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
              }
              buttonRef.current = node;
            }}
            className={cn(navItemButtonVariants({ active, className }))}
            disabled={disabled}
            title={label}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
              props.onClick?.(e as any);
            }}
            {...props}
          >
            {buttonContent}
          </button>
        ) : path ? (
          <Link
            href={path}
            className={cn(navItemButtonVariants({ active, className }))}
            title={label}
            onClick={() => {
              // Link will handle navigation
            }}
          >
            {buttonContent}
          </Link>
        ) : (
          <button
            className={cn(navItemButtonVariants({ active, className }))}
            title={label}
            disabled={disabled}
          >
            {buttonContent}
          </button>
        )}

        {/* Sub-menu Popover - Rendered via Portal */}
        {hasSubItems && buttonRect && typeof document !== 'undefined' && createPortal(
          <div
            ref={menuRef}
            className={cn(
              "fixed min-w-[200px] h-screen top-0 bg-white z-[40]",
              "transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "shadow-[4px_0_24px_-4px_rgba(0,0,0,0.08)]",
              isOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
            )}
            style={{
              left: `${buttonRect.right}px`,
            }}
          >
            {/* Match header height - same as logo container */}
            <div className="flex items-center h-[64px] px-6 border-b border-slate-200">
              <div className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                {label}
              </div>
            </div>
            <div className="p-4 space-y-1">
              {subItems?.map((subItem, idx) => (
                subItem.path ? (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors flex items-center justify-between",
                      subItem.disabled && "pointer-events-none opacity-50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{subItem.label}</span>
                    {subItem.badge && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-white">
                        {subItem.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    key={idx}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors flex items-center justify-between",
                      subItem.disabled && "pointer-events-none opacity-50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{subItem.label}</span>
                    {subItem.badge && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-white">
                        {subItem.badge}
                      </span>
                    )}
                  </button>
                )
              ))}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }
);
NavItemButton.displayName = 'NavItemButton';

// ============================================================================
// AccountButton - User Account Section (Always Collapsed)
// ============================================================================

const accountButtonVariants = cva(
  'flex items-center justify-center w-full p-2 rounded-md transition-all duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer'
);

export interface AccountButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof AccountButtonConfig>,
    AccountButtonConfig {
  asChild?: boolean;
}

const AccountButton = React.forwardRef<HTMLButtonElement, AccountButtonProps>(
  (
    {
      className,
      name,
      email,
      avatar,
      fallback = 'U',
      path,
      asChild = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const avatarContent = (
      <div className="h-10 w-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold shrink-0">
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-sm">{fallback}</span>
        )}
      </div>
    );

    if (path) {
      return (
        <Link
          href={path}
          className={cn(accountButtonVariants({ className }))}
          title={name}
        >
          {avatarContent}
        </Link>
      );
    }

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(accountButtonVariants({ className }))}
        title={name}
        onClick={onClick}
        {...props}
      >
        {avatarContent}
      </Comp>
    );
  }
);
AccountButton.displayName = 'AccountButton';

// ============================================================================
// CTAButton - Call-to-Action Button (Always Collapsed)
// ============================================================================

const ctaButtonVariants = cva(
  'flex items-center justify-center w-full p-3 rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 cursor-pointer',
  {
    variants: {
      variant: {
        solid: 'bg-slate-700 text-white hover:bg-slate-800',
        outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        coral: 'bg-coral-500 text-white hover:bg-coral-600',
      },
    },
    defaultVariants: {
      variant: 'coral',
    },
  }
);

export interface CTAButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | keyof CTAButtonConfig>,
    CTAButtonConfig {
  asChild?: boolean;
}

const CTAButton = React.forwardRef<HTMLButtonElement, CTAButtonProps>(
  (
    {
      className,
      label,
      icon: Icon,
      variant = 'coral',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(ctaButtonVariants({ variant, className }))}
        title={label}
        {...props}
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
      </Comp>
    );
  }
);
CTAButton.displayName = 'CTAButton';

// ============================================================================
// Exports
// ============================================================================

export {
  SidebarRail,
  NavItemButton,
  AccountButton,
  CTAButton,
  SidebarSection,
  sidebarRailVariants,
  navItemButtonVariants,
  accountButtonVariants,
  ctaButtonVariants,
};
