'use client';

import { useState, useCallback, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolver: ((value: boolean) => void) | null;
}

const initialState: ConfirmState = {
  open: false,
  title: '',
  description: '',
  confirmText: 'Onayla',
  cancelText: 'İptal',
  variant: 'default',
  resolver: null,
};

/**
 * Promise-based confirmation dialog hook.
 * Replaces browser confirm() with a custom AlertDialog.
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   const ok = await confirm({ title: 'Emin misiniz?', description: 'Bu işlem geri alınamaz.' });
 *   if (!ok) return;
 *
 *   // In JSX:
 *   <ConfirmDialog />
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(initialState);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        ...options,
        open: true,
        confirmText: options.confirmText || 'Onayla',
        cancelText: options.cancelText || 'İptal',
        variant: options.variant || 'default',
        resolver: null, // not needed in state, kept via ref
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    setState(prev => ({ ...prev, open: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    setState(prev => ({ ...prev, open: false }));
  }, []);

  const ConfirmDialogComponent = (
    <AlertDialog open={state.open} onOpenChange={(open) => { if (!open) handleCancel(); }}>
      <AlertDialogContent className="bg-zinc-900 border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className={state.variant === 'destructive' ? 'text-red-400' : 'text-white'}>
            {state.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/50">
            {state.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleCancel}
            className="bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
          >
            {state.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              state.variant === 'destructive'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white text-black hover:bg-white/90'
            }
          >
            {state.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}
