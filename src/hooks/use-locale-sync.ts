import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/api/hooks/use-profile';
import { getLocaleFromTimezone, setAppLocale } from '@/lib/currency';

/**
 * Syncs the app-wide number formatting locale with the user's profile timezone.
 * Call once near the root of the authenticated tree (e.g. AuthGuard).
 *
 * Pass `enabled: false` while the auth token is not yet available to avoid
 * firing an unauthenticated profile request on first render.
 *
 * When the locale actually changes, invalidates all financial query caches so
 * components re-render with correctly-formatted values.
 */
export function useLocaleSync({ enabled = true }: { enabled?: boolean } = {}) {
  const { data: profile } = useProfile({ enabled });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (profile?.timezone) {
      const locale = getLocaleFromTimezone(profile.timezone);
      const changed = setAppLocale(locale);
      if (changed) {
        // Financial data is already cached but formatted with the old locale.
        // Invalidation forces re-render so formatCurrency picks up the new one.
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['budgets'] });
      }
    }
  }, [profile?.timezone, queryClient]);
}
