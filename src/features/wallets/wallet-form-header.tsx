import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletFormHeaderProps {
  title: string;
  onClose: () => void;
}

export function WalletFormHeader({ title, onClose }: WalletFormHeaderProps) {
  return (
    <header className="flex min-h-14 items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),16px)]">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Close"
        className="shrink-0 p-2"
      >
        <X className="h-6 w-6" />
      </Button>
      <h1 className="text-foreground text-2xl font-bold">{title}</h1>
    </header>
  );
}
