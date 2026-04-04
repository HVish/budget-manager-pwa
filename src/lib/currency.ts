const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  if (!formatterCache.has(currency)) {
    formatterCache.set(
      currency,
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      })
    );
  }
  return formatterCache.get(currency)!;
}

/** Format minor units (cents/paise) to display string. e.g. -500000, "INR" → "-₹5,000.00" */
export function formatCurrency(amountInMinorUnits: number, currency: string): string {
  return getFormatter(currency).format(amountInMinorUnits / 100);
}

/** Format without currency symbol, for inputs. e.g. 500000 → "5000.00" */
export function formatAmount(amountInMinorUnits: number): string {
  return (amountInMinorUnits / 100).toFixed(2);
}

/** Parse display amount to minor units. e.g. "5000.00" → 500000 */
export function parseAmount(displayAmount: string): number {
  return Math.round(parseFloat(displayAmount) * 100);
}