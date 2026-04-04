/** Shared className for tall form inputs (h-14, rounded-xl).
 *  The data-[size=default] override is needed for SelectTrigger which has
 *  data-[size=default]:h-8 in its base classes with higher CSS specificity. */
export const inputClassName =
  'h-14 data-[size=default]:h-14 rounded-xl px-4 text-base dark:bg-card border-input' as const;
