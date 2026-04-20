import { useAuth0 } from '@auth0/auth0-react';
import { Wallet, PieChart, ArrowRightLeft, Shield, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AppLink } from '@/components/ui/app-link';

export default function LandingPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="bg-background text-foreground min-h-dvh">
      {/* Nav */}
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl">
            <Wallet className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Budget Manager</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="min-h-11" onClick={() => loginWithRedirect()}>
            Log in
          </Button>
          <Button
            className="min-h-11"
            onClick={() =>
              loginWithRedirect({
                authorizationParams: { screen_hint: 'signup' },
              })
            }
          >
            Sign up
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20 text-center md:pt-24 md:pb-28">
        <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl md:leading-tight">
          Your finances,
          <br />
          <span className="text-primary">beautifully organized.</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-lg">
          Track expenses, manage wallets, set budgets — all in one privacy-first app that works on
          every device.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            className="h-11 rounded-xl px-6 text-base"
            onClick={() =>
              loginWithRedirect({
                authorizationParams: { screen_hint: 'signup' },
              })
            }
          >
            Get started free
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl px-6 text-base"
            onClick={() => loginWithRedirect()}
          >
            Log in
          </Button>
        </div>
      </section>

      {/* Desktop screenshot */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="bg-card/60 ring-border/60 relative overflow-hidden rounded-2xl ring-1">
          <img
            src="/landing/desktop-dashboard.png"
            alt="Budget Manager desktop dashboard"
            className="w-full"
            loading="lazy"
          />
          {/* Gradient fade to obscure bottom details */}
          <div className="from-background/0 via-background/70 to-background pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b" />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        <h2 className="text-center text-2xl font-bold md:text-3xl">
          Everything you need to stay on top of your money
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Wallet className="h-5 w-5" />}
            title="Multiple Wallets"
            description="Organize your money across bank accounts, savings, cash, and investments — all in one place."
          />
          <FeatureCard
            icon={<ArrowRightLeft className="h-5 w-5" />}
            title="Transaction Tracking"
            description="Log income and expenses with categories, search, and filters to understand your spending."
          />
          <FeatureCard
            icon={<PieChart className="h-5 w-5" />}
            title="Budget Goals"
            description="Set monthly budgets per category and track progress with visual indicators."
          />
          <FeatureCard
            icon={<Smartphone className="h-5 w-5" />}
            title="Mobile First"
            description="Designed for phones with bottom navigation, gestures, and installable as a PWA."
          />
          <FeatureCard
            icon={<Monitor className="h-5 w-5" />}
            title="Desktop Ready"
            description="Full sidebar layout on larger screens — the same app, optimized for your device."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Privacy First"
            description="Your data is encrypted and stored securely. No ads, no tracking, no selling your data."
          />
        </div>
      </section>

      {/* Mobile screenshots */}
      <section className="mx-auto max-w-5xl px-6 pt-8 pb-24">
        <h2 className="text-center text-2xl font-bold md:text-3xl">
          Designed for mobile. Ready for desktop.
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-center">
          Install it as a PWA on your phone for a native app experience.
        </p>
        <div className="mt-12 flex items-end justify-center gap-4 md:gap-8">
          <PhoneMockup src="/landing/mobile-dashboard.png" alt="Dashboard on mobile" />
          <PhoneMockup
            src="/landing/mobile-budgets.png"
            alt="Budgets on mobile"
            className="hidden sm:block"
          />
          <PhoneMockup
            src="/landing/mobile-wallets.png"
            alt="Wallets on mobile"
            className="hidden md:block"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-card/50 border-border/50 border-t">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground mt-3">Free to use. No credit card required.</p>
          <Button
            className="mt-6 h-11 rounded-xl px-6 text-base"
            onClick={() =>
              loginWithRedirect({
                authorizationParams: { screen_hint: 'signup' },
              })
            }
          >
            Create your account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border/50 border-t">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <p className="text-muted-foreground/60 mb-4 text-xs leading-relaxed">
            Budget Manager is a personal finance tracking tool, not a financial advisor. It does not
            provide financial, investment, or tax advice. You are solely responsible for your
            financial decisions.
          </p>
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>&copy; {new Date().getFullYear()} Budget Manager</span>
            <div className="flex gap-4">
              <AppLink
                to="/terms"
                className="hover:text-foreground flex min-h-11 items-center transition-colors"
              >
                Terms
              </AppLink>
              <AppLink
                to="/privacy"
                className="hover:text-foreground flex min-h-11 items-center transition-colors"
              >
                Privacy
              </AppLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card ring-border/50 rounded-2xl p-5 ring-1">
      <div className="bg-accent-soft text-accent-soft-foreground flex h-10 w-10 items-center justify-center rounded-xl">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function PhoneMockup({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div
      className={cn(
        'border-foreground/10 relative w-48 overflow-hidden rounded-3xl border-4 shadow-2xl md:w-56',
        className,
      )}
    >
      <img src={src} alt={alt} className="w-full" loading="lazy" />
      {/* Gradient overlay to obscure financial details */}
      <div className="to-background/60 pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent" />
    </div>
  );
}
