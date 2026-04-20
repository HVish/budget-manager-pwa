import { Wallet, ArrowLeft } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  footerLinks: { to: string; label: string }[];
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  footerLinks,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      {/* Nav */}
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <AppLink to="/" className="flex items-center gap-2.5">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <Wallet className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Budget Manager</span>
        </AppLink>
        <AppLink
          to="/"
          className="text-muted-foreground hover:text-foreground flex min-h-11 items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </AppLink>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 pt-8 pb-20">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2 text-sm">Last updated: {lastUpdated}</p>

        <div className="mt-10 space-y-10">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-border/50 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-3xl items-center justify-between px-6 py-6 text-sm">
          <span>&copy; {new Date().getFullYear()} Budget Manager</span>
          <div className="flex gap-4">
            {footerLinks.map((link) => (
              <AppLink
                key={link.to}
                to={link.to}
                className="hover:text-foreground flex min-h-11 items-center transition-colors"
              >
                {link.label}
              </AppLink>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground mt-3 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
