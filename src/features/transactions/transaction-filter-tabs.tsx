import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { TRANSACTION_FILTER_TABS } from './transaction-filter-config';
import type { TransactionFilterTab } from './transaction-filter-config';

type ScrollEdge = 'none' | 'start' | 'end' | 'both';

const maskStyle: Record<ScrollEdge, React.CSSProperties> = {
  none: {},
  start: {
    maskImage: 'linear-gradient(to right, transparent, black 24px)',
  },
  end: {
    maskImage: 'linear-gradient(to left, transparent, black 24px)',
  },
  both: {
    maskImage:
      'linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)',
  },
};

interface TransactionFilterTabsProps {
  activeTab: TransactionFilterTab;
  onTabChange: (tab: TransactionFilterTab) => void;
}

export function TransactionFilterTabs({ activeTab, onTabChange }: TransactionFilterTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState<ScrollEdge>('none');

  const updateEdge = useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const threshold = 2;
    const canScrollLeft = scrollLeft > threshold;
    const canScrollRight = scrollLeft + clientWidth < scrollWidth - threshold;

    if (canScrollLeft && canScrollRight) setEdge('both');
    else if (canScrollRight) setEdge('end');
    else if (canScrollLeft) setEdge('start');
    else setEdge('none');
  }, []);

  // Detect initial overflow once the list mounts
  const setListRef = useCallback(
    (node: HTMLDivElement | null) => {
      (listRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (node) updateEdge();
    },
    [updateEdge],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    let nextIndex: number | undefined;

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== undefined) {
      e.preventDefault();
      tabs[nextIndex].focus();
      onTabChange(TRANSACTION_FILTER_TABS[nextIndex].id);
    }
  }

  return (
    <nav aria-label="Transaction type filter" className="pb-3">
      <div
        ref={setListRef}
        role="tablist"
        onScroll={updateEdge}
        style={maskStyle[edge]}
        className="scrollbar-none flex gap-2 overflow-x-auto pr-2 pl-4"
      >
        {TRANSACTION_FILTER_TABS.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'min-h-11 shrink-0 rounded-4xl px-4 py-1.5 text-sm font-medium text-nowrap transition-colors duration-150',
              'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
        {/* Spacer so the last tab can scroll fully into view */}
        <div className="w-2 shrink-0" aria-hidden="true" />
      </div>
    </nav>
  );
}
