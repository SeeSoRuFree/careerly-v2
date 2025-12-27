'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: 'default' | 'warning' | 'error';
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmText = '확인',
  variant = 'default',
}: AlertDialogProps) {
  const IconComponent = variant === 'warning' || variant === 'error' ? AlertTriangle : Info;
  const iconColor = variant === 'error' ? 'text-red-500' : variant === 'warning' ? 'text-amber-500' : 'text-blue-500';

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 z-[9999] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={(e) => e.stopPropagation()}
        />
        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-[9999] w-full max-w-sm translate-x-[-50%] translate-y-[-50%]',
            'bg-white rounded-lg shadow-xl p-6',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-slate-100 transition-colors"
              aria-label="닫기"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </Dialog.Close>

          {/* Content */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <IconComponent className={cn('h-5 w-5 mt-0.5 shrink-0', iconColor)} />
              <div className="space-y-2">
                <Dialog.Title className="text-lg font-semibold text-slate-900">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-600">
                  {description}
                </Dialog.Description>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-6">
            <Button
              variant="coral"
              size="sm"
              onClick={onClose}
            >
              {confirmText}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 z-[9999] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={(e) => e.stopPropagation()}
        />
        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-[9999] w-full max-w-sm translate-x-[-50%] translate-y-[-50%]',
            'bg-white rounded-lg shadow-xl p-6',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-slate-100 transition-colors"
              aria-label="닫기"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </Dialog.Close>

          {/* Content */}
          <div className="space-y-4">
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-slate-600">
              {description}
            </Dialog.Description>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'destructive' : 'coral'}
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : confirmText}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
