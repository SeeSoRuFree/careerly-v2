'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavItemConfig {
  label: string;
  path?: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

interface AccountButtonConfig {
  name: string;
  email?: string;
  avatar?: string;
  fallback?: string;
  path?: string;
}

interface CTAButtonConfig {
  label: string;
  onClick?: () => void;
  variant?: 'solid' | 'outline' | 'coral';
  icon?: LucideIcon;
}

interface MobileNavSections {
  primary?: NavItemConfig[];
  utilities?: NavItemConfig[];
  account?: AccountButtonConfig;
  ctas?: CTAButtonConfig[];
}

interface MobileNavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activePath?: string;
  sections?: MobileNavSections;
}

export function MobileNavOverlay({
  isOpen,
  onClose,
  activePath,
  sections,
}: MobileNavOverlayProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ESC 키로 닫기
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const overlayContent = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel - 왼쪽에서 열림 */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-[280px] max-w-[80vw] bg-white z-50 shadow-xl transition-transform duration-300 ease-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
          <span className="font-semibold text-slate-900">메뉴</span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex flex-col h-[calc(100%-56px)] overflow-y-auto">
          {/* Account Section (if logged in) */}
          {sections?.account && (
            <div className="p-4 border-b border-slate-100">
              <Link
                href={sections.account.path || '/profile'}
                onClick={onClose}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-semibold shrink-0">
                  {sections.account.avatar ? (
                    <img
                      src={sections.account.avatar}
                      alt={sections.account.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">{sections.account.fallback}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {sections.account.name}
                  </p>
                  {sections.account.email && (
                    <p className="text-sm text-slate-500 truncate">
                      {sections.account.email}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* Primary Navigation */}
          {sections?.primary && sections.primary.length > 0 && (
            <nav className="p-2">
              {sections.primary.map((item, idx) => (
                <MobileNavItem
                  key={idx}
                  {...item}
                  active={activePath === item.path}
                  onClick={onClose}
                />
              ))}
            </nav>
          )}

          {/* Utilities Section */}
          {sections?.utilities && sections.utilities.length > 0 && (
            <nav className="p-2 border-t border-slate-100">
              {sections.utilities.map((item, idx) => (
                <MobileNavItem
                  key={idx}
                  {...item}
                  active={activePath === item.path}
                  onClick={onClose}
                />
              ))}
            </nav>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA Buttons */}
          {sections?.ctas && sections.ctas.length > 0 && (
            <div className="p-4 border-t border-slate-100 space-y-2">
              {sections.ctas.map((cta, idx) => (
                <MobileCTAButton
                  key={idx}
                  {...cta}
                  onClick={() => {
                    cta.onClick?.();
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(overlayContent, document.body);
}

// Mobile Nav Item
interface MobileNavItemProps extends NavItemConfig {
  active?: boolean;
  onClick?: () => void;
}

function MobileNavItem({
  label,
  path,
  icon: Icon,
  badge,
  disabled,
  active,
  onClick,
}: MobileNavItemProps) {
  const content = (
    <>
      {Icon && (
        <Icon
          className={cn(
            'h-5 w-5 shrink-0',
            active ? 'text-slate-900' : 'text-slate-500'
          )}
        />
      )}
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-white">
          {badge}
        </span>
      )}
    </>
  );

  const className = cn(
    'flex items-center gap-3 w-full px-3 py-3 rounded-lg text-left transition-colors',
    active
      ? 'bg-slate-100 text-slate-900 font-medium'
      : 'text-slate-700 hover:bg-slate-50',
    disabled && 'opacity-50 pointer-events-none'
  );

  if (path) {
    return (
      <Link href={path} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}

// Mobile CTA Button
interface MobileCTAButtonProps extends CTAButtonConfig {}

function MobileCTAButton({
  label,
  onClick,
  variant = 'coral',
  icon: Icon,
}: MobileCTAButtonProps) {
  const variantStyles = {
    solid: 'bg-slate-700 text-white hover:bg-slate-800',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    coral: 'bg-coral-500 text-white hover:bg-coral-600',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-medium transition-colors',
        variantStyles[variant]
      )}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{label}</span>
    </button>
  );
}
