import type { ComponentProps, ComponentType, SVGProps } from 'react';
import { Button } from '@/components/ui/button';
import { useLayout } from '@/components/layout/layout-context';
import { cn } from '@/lib/utils';

interface ActionButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'variant' | 'size' | 'children'
> {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
}

/**
 * Layout-aware action button.
 * - Compact (mobile): ghost icon-only button with 44px touch target
 * - Expanded (desktop): outline button with icon + text label
 */
export function ActionButton({ icon: Icon, label, className, ...props }: ActionButtonProps) {
  const { variant } = useLayout();
  const isExpanded = variant === 'expanded';

  return (
    <Button
      variant={isExpanded ? 'outline' : 'ghost'}
      size={isExpanded ? 'sm' : 'icon'}
      className={cn('min-h-11 min-w-11', className)}
      aria-label={isExpanded ? undefined : label}
      {...props}
    >
      <Icon className={isExpanded ? 'h-4 w-4' : 'h-5 w-5'} />
      {isExpanded && label}
    </Button>
  );
}
