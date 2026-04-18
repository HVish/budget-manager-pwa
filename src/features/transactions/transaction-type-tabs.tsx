import { cn } from '@/lib/utils';

export type TransactionType = 'income' | 'expense' | 'transfer';

interface Tab {
  value: TransactionType;
  label: string;
}

const tabs: Tab[] = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
];

interface TransactionTypeTabsProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

export function TransactionTypeTabs({ value, onChange }: TransactionTypeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Transaction type"
      className="flex items-center gap-2 px-5 pt-2 pb-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          className={cn(
            'min-h-11 min-w-20 rounded-4xl px-5 text-sm font-medium transition-colors',
            value === tab.value
              ? 'bg-primary text-primary-foreground font-semibold'
              : 'text-muted-foreground ring-border ring-1',
          )}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
