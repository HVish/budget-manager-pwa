import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletFormHeaderProps {
  title: string;
  onClose: () => void;
}

export function WalletFormHeader({ title, onClose }: WalletFormHeaderProps) {
  return (
    <header className="relative flex min-h-14 items-center px-6 pt-[max(env(safe-area-inset-top),16px)]">
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="shrink-0">
        <X className="h-6 w-6" />
      </Button>
      <h1 className="text-foreground absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
        {title}
      </h1>
    </header>
  );
}
