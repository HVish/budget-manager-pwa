import type { ReactNode } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLayout } from './layout-context';
import { cn } from '@/lib/utils';

type LeadingAction =
  | {
      /** Shows a back arrow — use for drill-down navigation */ onBack: () => void;
      onClose?: never;
    }
  | { onBack?: never; /** Shows an X — use for modal/full-screen forms */ onClose: () => void }
  | { onBack?: never; onClose?: never };

type PageHeaderBarProps = LeadingAction & {
  title: string;
  /** Trailing action buttons (edit, delete, etc.) rendered at size-5 */
  children?: ReactNode;
  className?: string;
};

/**
 * Full-width header bar for detail and form pages.
 *
 * Layout-aware:
 * - Compact (mobile): shows back/close buttons, safe-area-inset-top padding
 * - Expanded (desktop): hides back/close (sidebar provides navigation), simple padding
 */
export function PageHeaderBar({ title, onBack, onClose, children, className }: PageHeaderBarProps) {
  const { variant, safeAreaHandled } = useLayout();
  const isCompact = variant === 'compact';

  return (
    <header
      className={cn(
        'flex min-h-14 items-center gap-2 px-4',
        safeAreaHandled ? 'pt-4' : 'pt-[max(env(safe-area-inset-top),16px)]',
        className,
      )}
    >
      {/* Back/close buttons only on compact (mobile) — desktop uses sidebar navigation */}
      {isCompact && onBack && (
        <Button
          variant="ghost"
          size="icon-lg"
          className="min-h-11 min-w-11 p-2"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft />
        </Button>
      )}
      {isCompact && onClose && (
        <Button
          variant="ghost"
          size="icon-lg"
          className="min-h-11 min-w-11 p-2"
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </Button>
      )}
      <h1 className="text-foreground flex-1 text-2xl font-bold">{title}</h1>
      {children}
    </header>
  );
}
