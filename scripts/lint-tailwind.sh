#!/usr/bin/env bash
# lint-tailwind.sh — Catch non-canonical Tailwind classes that have standard equivalents.
# Usage:
#   pnpm lint:tw                            # via package.json script
#   ./scripts/lint-tailwind.sh              # check all src/**/*.{ts,tsx}
#   ./scripts/lint-tailwind.sh file.tsx      # check specific files
#
# Exit code 0 = clean, 1 = issues found.

set -eo pipefail

TARGET="${1:-src}"
EXIT_CODE=0

# Build a single grep pattern file for speed.
# Format: pattern<TAB>suggestion
RULES_FILE=$(mktemp)
trap 'rm -f "$RULES_FILE"' EXIT

cat > "$RULES_FILE" << 'RULES'
min-h-\[4px\]	min-h-1
min-h-\[8px\]	min-h-2
min-h-\[12px\]	min-h-3
min-h-\[16px\]	min-h-4
min-h-\[20px\]	min-h-5
min-h-\[24px\]	min-h-6
min-h-\[28px\]	min-h-7
min-h-\[32px\]	min-h-8
min-h-\[36px\]	min-h-9
min-h-\[40px\]	min-h-10
min-h-\[44px\]	min-h-11
min-h-\[48px\]	min-h-12
min-w-\[4px\]	min-w-1
min-w-\[8px\]	min-w-2
min-w-\[12px\]	min-w-3
min-w-\[16px\]	min-w-4
min-w-\[20px\]	min-w-5
min-w-\[24px\]	min-w-6
min-w-\[28px\]	min-w-7
min-w-\[32px\]	min-w-8
min-w-\[36px\]	min-w-9
min-w-\[40px\]	min-w-10
min-w-\[44px\]	min-w-11
min-w-\[48px\]	min-w-12
h-\[4px\]	h-1
h-\[8px\]	h-2
h-\[12px\]	h-3
h-\[16px\]	h-4
h-\[20px\]	h-5
h-\[24px\]	h-6
h-\[28px\]	h-7
h-\[32px\]	h-8
h-\[36px\]	h-9
h-\[40px\]	h-10
h-\[44px\]	h-11
h-\[48px\]	h-12
h-\[56px\]	h-14
h-\[64px\]	h-16
h-\[80px\]	h-20
h-\[96px\]	h-24
h-\[120px\]	h-30
h-\[128px\]	h-32
w-\[4px\]	w-1
w-\[8px\]	w-2
w-\[12px\]	w-3
w-\[16px\]	w-4
w-\[20px\]	w-5
w-\[24px\]	w-6
w-\[28px\]	w-7
w-\[32px\]	w-8
w-\[36px\]	w-9
w-\[40px\]	w-10
w-\[44px\]	w-11
w-\[48px\]	w-12
w-\[56px\]	w-14
w-\[64px\]	w-16
w-\[80px\]	w-20
w-\[96px\]	w-24
w-\[128px\]	w-32
max-w-\[240px\]	max-w-60
max-w-\[320px\]	max-w-80
max-w-\[384px\]	max-w-96
# Negative position arbitrary values (e.g., bottom-[-5px] -> -bottom-1.25)
top-\[-1px\]	-top-px
top-\[-2px\]	-top-0.5
top-\[-4px\]	-top-1
top-\[-5px\]	-top-1.25
top-\[-8px\]	-top-2
bottom-\[-1px\]	-bottom-px
bottom-\[-2px\]	-bottom-0.5
bottom-\[-4px\]	-bottom-1
bottom-\[-5px\]	-bottom-1.25
bottom-\[-8px\]	-bottom-2
left-\[-1px\]	-left-px
left-\[-2px\]	-left-0.5
left-\[-4px\]	-left-1
left-\[-5px\]	-left-1.25
left-\[-8px\]	-left-2
right-\[-1px\]	-right-px
right-\[-2px\]	-right-0.5
right-\[-4px\]	-right-1
right-\[-5px\]	-right-1.25
right-\[-8px\]	-right-2
# rem-based arbitrary values with canonical equivalents
translate-x-\[2\.5rem\]	translate-x-10
translate-y-\[2\.5rem\]	translate-y-10
translate-x-\[-2\.5rem\]	-translate-x-10
translate-y-\[-2\.5rem\]	-translate-y-10
gap-\[0\.5rem\]	gap-2
gap-\[1rem\]	gap-4
gap-\[1\.5rem\]	gap-6
whitespace-nowrap	text-nowrap
whitespace-normal	text-wrap
overflow-ellipsis	text-ellipsis
flex-grow-0	grow-0
flex-shrink-0	shrink-0
decoration-clone	box-decoration-clone
decoration-slice	box-decoration-slice
RULES

while IFS=$'\t' read -r pattern suggestion; do
  [ -z "$pattern" ] && continue
  # Use grep -rn for speed; include only ts/tsx files
  MATCHES=$(grep -rnE --include='*.ts' --include='*.tsx' "$pattern" "$TARGET" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    while IFS= read -r match_line; do
      echo "$match_line"
      echo "  -> use '$suggestion'"
      EXIT_CODE=1
    done <<< "$MATCHES"
  fi
done < "$RULES_FILE"

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "No non-canonical Tailwind classes found."
fi

exit $EXIT_CODE
