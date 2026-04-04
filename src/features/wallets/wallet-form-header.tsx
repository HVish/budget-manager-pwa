import { PageHeaderBar } from '@/components/layout/page-header-bar';

type WalletFormHeaderProps =
  | { title: string; onClose: () => void; onBack?: never }
  | { title: string; onBack: () => void; onClose?: never };

export function WalletFormHeader({ title, onClose, onBack }: WalletFormHeaderProps) {
  if (onBack) return <PageHeaderBar title={title} onBack={onBack} />;
  return <PageHeaderBar title={title} onClose={onClose} />;
}
