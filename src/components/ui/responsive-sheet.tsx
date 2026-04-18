import type { ReactNode } from 'react';
import { useIsDesktop } from '@/hooks/use-breakpoint';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog';

interface ResponsiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  /** Accessible label for the overlay — used as aria-label on Dialog, ignored by Sheet */
  title: string;
}

/**
 * Renders a bottom Sheet on mobile/tablet and a centered Dialog on desktop.
 * Children receive the same content area in both modes.
 */
export function ResponsiveSheet({ open, onOpenChange, children, title }: ResponsiveSheetProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent
            showCloseButton={false}
            className="flex max-h-[85dvh] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl p-0"
            aria-label={title}
          >
            {children}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex max-h-[85dvh] flex-col gap-0 rounded-t-2xl p-0"
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}
