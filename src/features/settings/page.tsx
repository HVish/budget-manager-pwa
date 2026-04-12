import { useState } from 'react';
import { Check, ChevronRight, Coins, Moon, Tag, X } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import { PageHeaderBar } from '@/components/layout/page-header-bar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { useProfile, useUpdateProfile } from '@/api/hooks/use-profile';
import { useThemeStore } from '@/stores/theme-store';
import { CURRENCY_OPTIONS } from '@/lib/currency';
import { useAppNavigate } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import type { Currency } from '@/api/types';

export default function SettingsPage() {
  const navigate = useAppNavigate();
  const { user, logout } = useAuth0();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const { theme, toggleTheme } = useThemeStore();
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const isDark = theme === 'dark';
  const displayName = user?.name ?? user?.email ?? 'User';
  const initials = (user?.name ?? user?.email ?? '?')[0]?.toUpperCase() ?? '?';
  const showImage = !!user?.picture && !imgFailed;

  function handleCurrencySelect(code: Currency) {
    setCurrencySheetOpen(false);
    if (code === profile?.currency) return;
    updateProfile.mutate(
      { currency: code },
      {
        onSuccess: () => {
          toast.success(`Currency updated to ${code}`);
        },
        onError: () => {
          toast.error('Failed to update currency');
        },
      },
    );
  }

  function handleSignOut() {
    logout({ logoutParams: { returnTo: `${window.location.origin}/login` } });
  }

  function handleDeleteAccount() {
    toast.info('Account deletion is not yet available. Contact support.');
  }

  return (
    <div className="bg-background min-h-dvh pb-[max(env(safe-area-inset-bottom),24px)]">
      <PageHeaderBar title="Settings" onBack={() => navigate(-1)} />

      {isError ? (
        <div className="flex flex-col items-center justify-center gap-2 px-4 pt-20 text-center">
          <p className="text-destructive text-sm">Failed to load profile</p>
          <Button variant="link" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <main className="px-4 pt-4">
          {/* Profile Card */}
          {isLoading ? (
            <Card className="py-0">
              <CardContent className="flex items-center gap-4 px-4 py-5">
                <Skeleton className="size-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3.5 w-48" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="py-0">
              <CardContent className="flex items-center gap-4 px-4 py-5">
                <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full">
                  {showImage ? (
                    <img
                      src={user!.picture}
                      alt={displayName}
                      className="aspect-square size-full rounded-full object-cover"
                      onError={() => setImgFailed(true)}
                    />
                  ) : (
                    <span className="bg-primary text-primary-foreground flex size-full items-center justify-center rounded-full text-xl font-bold">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-base font-semibold">{displayName}</p>
                  {user?.email && (
                    <p className="text-muted-foreground mt-0.5 truncate text-sm">{user.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* General Section */}
          {isLoading ? (
            <div className="pt-6">
              <Skeleton className="mb-2 ml-1 h-3 w-16" />
              <Card className="gap-0 py-0">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <Skeleton className="size-10 rounded-xl" />
                    <Skeleton className="h-4 w-28 flex-1" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <Skeleton className="size-10 rounded-xl" />
                    <Skeleton className="h-4 w-24 flex-1" />
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <Skeleton className="size-10 rounded-xl" />
                    <Skeleton className="h-4 w-24 flex-1" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <section aria-label="General settings" className="pt-6">
              <h2 className="text-primary mb-2 px-1 text-xs font-semibold tracking-wider uppercase">
                General
              </h2>
              <Card className="gap-0 py-0">
                <CardContent className="p-0">
                  <button
                    className="active:bg-accent/50 focus-visible:ring-ring/50 flex min-h-11 w-full items-center gap-3 rounded-t-2xl px-4 py-3.5 transition-colors outline-none focus-visible:ring-3"
                    onClick={() => setCurrencySheetOpen(true)}
                    disabled={updateProfile.isPending}
                    aria-label={`Default Currency, currently ${profile?.currency ?? 'not set'}`}
                  >
                    <div className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <Coins className="text-primary size-5" />
                    </div>
                    <span className="text-foreground flex-1 text-left text-sm font-medium">
                      Default Currency
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground text-sm">
                        {profile?.currency ?? '—'}
                      </span>
                      <ChevronRight className="text-muted-foreground size-4" />
                    </div>
                  </button>

                  <Separator />

                  <div className="flex min-h-11 items-center gap-3 px-4 py-3.5">
                    <div className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <Moon className="text-primary size-5" />
                    </div>
                    <span className="text-foreground flex-1 text-sm font-medium">Dark Theme</span>
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      aria-label="Toggle dark theme"
                    />
                  </div>

                  <Separator />

                  <button
                    className="active:bg-accent/50 focus-visible:ring-ring/50 flex min-h-11 w-full items-center gap-3 rounded-b-2xl px-4 py-3.5 transition-colors outline-none focus-visible:ring-3"
                    onClick={() => navigate('/categories')}
                    aria-label="Manage categories"
                  >
                    <div className="bg-secondary flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <Tag className="text-primary size-5" />
                    </div>
                    <span className="text-foreground flex-1 text-left text-sm font-medium">
                      Categories
                    </span>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </button>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Account Section */}
          {isLoading ? (
            <div className="pt-6">
              <Skeleton className="mb-2 ml-1 h-3 w-16" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ) : (
            <section aria-label="Account settings" className="pt-6">
              <h2 className="text-primary mb-2 px-1 text-xs font-semibold tracking-wider uppercase">
                Account
              </h2>
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl text-sm font-medium"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </section>
          )}

          {!isLoading && (
            <>
              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="h-11 w-full rounded-xl text-sm font-medium"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </div>

              <p className="text-muted-foreground/50 pt-8 pb-4 text-center text-xs">
                v{__APP_VERSION__}
              </p>
            </>
          )}
        </main>
      )}

      {/* Currency bottom sheet */}
      <Sheet open={currencySheetOpen} onOpenChange={setCurrencySheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex max-h-[60dvh] flex-col gap-0 rounded-t-2xl p-0"
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <SheetTitle className="text-base font-semibold">Default Currency</SheetTitle>
            <SheetDescription className="sr-only">
              Choose your default currency for the budget manager
            </SheetDescription>
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="min-h-11 min-w-11"
                  aria-label="Close"
                />
              }
            >
              <X className="h-4 w-4" />
            </SheetClose>
          </div>

          <Separator />

          <div className="flex-1 space-y-1 overflow-y-auto p-2 pb-[env(safe-area-inset-bottom)]">
            {CURRENCY_OPTIONS.map((option) => {
              const isSelected = profile?.currency === option.code;
              return (
                <button
                  key={option.code}
                  onClick={() => handleCurrencySelect(option.code)}
                  aria-label={`${option.code}, ${option.name}`}
                  aria-current={isSelected ? 'true' : undefined}
                  className={cn(
                    'active:bg-accent/50 focus-visible:ring-ring/50 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors outline-none focus-visible:ring-3',
                    isSelected ? 'bg-accent-soft' : 'hover:bg-accent/20',
                  )}
                >
                  <span
                    className={cn(
                      'flex-1 text-left text-sm font-medium',
                      isSelected ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {option.code}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {option.symbol} — {option.name}
                  </span>
                  {isSelected && <Check className="text-primary size-4" />}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
