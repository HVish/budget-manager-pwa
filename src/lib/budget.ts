export function getProgressColor(pct: number): string {
  if (pct >= 90) return 'bg-destructive';
  if (pct >= 75) return 'bg-warning';
  return 'bg-primary';
}
