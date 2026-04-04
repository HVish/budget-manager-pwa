import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { FILTER_TABS } from './wallet-filter-config';
import type { FilterTab } from './wallet-filter-config';

interface WalletFilterTabsProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

export function WalletFilterTabs({ activeTab, onTabChange }: WalletFilterTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

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
      onTabChange(FILTER_TABS[nextIndex].id);
    }
  }

  return (
    <nav aria-label="Wallet type filter" className="pb-4">
      <div ref={listRef} role="tablist" className="scrollbar-none flex gap-3 overflow-x-auto px-4">
        {FILTER_TABS.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'shrink-0 rounded-xl px-4 py-2 text-sm text-nowrap transition-colors duration-150',
              'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:bg-card font-medium',
            )}
          >
            {tab.label}
          </button>
        ))}
        {/* Spacer to prevent last tab from being clipped by scroll edge */}
        <div className="w-px shrink-0" aria-hidden="true" />
      </div>
    </nav>
  );
}
