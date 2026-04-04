# Budget Manager PWA — Design System

Use this document as the source of truth for the app's visual language.
Import it into Google Stitch or any AI design tool to generate screens that match the existing app.

---

## Identity

- **App name**: Budget Manager
- **Platform**: Mobile-first PWA (expanding to desktop)
- **Theme**: Dark mode default, teal-green financial dashboard
- **Personality**: Clean, data-dense, trustworthy — a tool you check daily

---

## Typography

| Role           | Font                       | Weight | Size |
| -------------- | -------------------------- | ------ | ---- |
| Body           | Geist Variable, sans-serif | 400    | 14px |
| Label          | Geist Variable, sans-serif | 500    | 12px |
| Card title     | Geist Variable, sans-serif | 600    | 16px |
| Section header | Geist Variable, sans-serif | 600    | 16px |
| Page title     | Geist Variable, sans-serif | 700    | 24px |
| Large amount   | Geist Variable, sans-serif | 700    | 30px |
| Stat value     | Geist Variable, sans-serif | 700    | 18px |
| Heading font   | Same as body (--font-sans) | —      | —    |

All text uses the same font family. Weight and size create the hierarchy.

---

## Color Tokens

All colors use the **oklch** color space for perceptual uniformity.

### Dark Mode (default)

| Token                      | Value                         | Usage                                     |
| -------------------------- | ----------------------------- | ----------------------------------------- |
| `--background`             | `oklch(0.22 0.029 176)`       | Page background — dark teal               |
| `--foreground`             | `oklch(1 0 0)`                | Primary text — white                      |
| `--card`                   | `oklch(0.33 0.044 174)`       | Card surface — elevated teal              |
| `--card-foreground`        | `oklch(1 0 0)`                | Card text                                 |
| `--primary`                | `oklch(0.876 0.23 152)`       | Primary accent — bright green             |
| `--primary-foreground`     | `oklch(0.22 0.029 176)`       | Text on primary                           |
| `--secondary`              | `oklch(0.41 0.05 169)`        | Secondary surface                         |
| `--secondary-foreground`   | `oklch(1 0 0)`                | Text on secondary                         |
| `--muted`                  | `oklch(0.41 0.05 169)`        | Muted surface (same as secondary)         |
| `--muted-foreground`       | `oklch(0.714 0.019 261)`      | Subdued text — cool gray                  |
| `--accent`                 | `oklch(0.41 0.05 169)`        | Accent surface                            |
| `--accent-foreground`      | `oklch(1 0 0)`                | Text on accent                            |
| `--destructive`            | `oklch(0.679 0.21 25)`        | Error/danger — warm red                   |
| `--border`                 | `oklch(0.41 0.05 169)`        | Borders — solid teal                      |
| `--input`                  | `oklch(0.41 0.05 169)`        | Input borders — matches border            |
| `--ring`                   | `oklch(0.876 0.23 152)`       | Focus rings — matches primary             |
| `--income`                 | `oklch(0.876 0.23 152)`       | Income amounts — bright green             |
| `--expense`                | `oklch(0.679 0.21 25)`        | Expense amounts — warm red/orange         |
| `--surface-elevated`       | `oklch(0.33 0.044 174)`       | Elevated surface — matches card           |
| `--accent-soft`            | `oklch(0.876 0.23 152 / 15%)` | Soft accent background                    |
| `--accent-soft-foreground` | `oklch(0.876 0.23 152)`       | Text on soft accent                       |
| `--wallet-card`            | `oklch(0.272 0.038 178)`      | Wallet card surface — between bg and card |

### Chart Colors (dark mode)

| Token       | Value                   | Description     |
| ----------- | ----------------------- | --------------- |
| `--chart-1` | `oklch(0.876 0.23 152)` | Brightest green |
| `--chart-2` | `oklch(0.7 0.18 158)`   | Medium green    |
| `--chart-3` | `oklch(0.55 0.13 164)`  | Dark green      |
| `--chart-4` | `oklch(0.4 0.08 169)`   | Darker green    |
| `--chart-5` | `oklch(0.28 0.04 174)`  | Darkest green   |

### Light Mode

| Token                  | Value                       |
| ---------------------- | --------------------------- |
| `--background`         | `oklch(1 0 0)`              |
| `--foreground`         | `oklch(0.145 0 0)`          |
| `--card`               | `oklch(1 0 0)`              |
| `--primary`            | `oklch(0.205 0 0)`          |
| `--primary-foreground` | `oklch(0.985 0 0)`          |
| `--secondary`          | `oklch(0.97 0 0)`           |
| `--muted`              | `oklch(0.97 0 0)`           |
| `--muted-foreground`   | `oklch(0.556 0 0)`          |
| `--destructive`        | `oklch(0.577 0.245 27.325)` |
| `--income`             | `oklch(0.55 0.17 142)`      |
| `--expense`            | `oklch(0.55 0.22 25)`       |
| `--surface-elevated`   | `oklch(0.97 0 0)`           |
| `--accent-soft`        | `oklch(0.205 0 0 / 8%)`     |

### Color Design Intent

- Hue 174-176 (teal) is the signature hue for backgrounds, cards, and secondary surfaces
- Hue 152 (green) is the accent/primary hue — brighter and more saturated than backgrounds
- Hue 261 (cool gray) for muted foreground text — provides contrast against teal backgrounds
- Hue 25 (red/orange) for expenses and destructive actions
- Dark mode uses solid colored borders matching the secondary/muted surface tone

---

## Spacing & Layout

| Concept              | Value  | Usage                                    |
| -------------------- | ------ | ---------------------------------------- |
| Base unit            | 4px    | All spacing is a multiple of 4px         |
| Page padding         | 16px   | Horizontal padding on all pages (`px-4`) |
| Form padding         | 20px   | Horizontal padding inside forms (`px-5`) |
| Section gap          | 16px   | Vertical space between content sections  |
| Card padding         | 16px   | Default card internal padding (`p-4`)    |
| Card padding (small) | 12px   | Compact card variant (`p-3`)             |
| Card gap             | 16px   | Gap between card children                |
| Component gap        | 6–12px | Internal spacing in small components     |
| Bottom nav height    | ~64px  | Fixed bottom nav + safe area             |
| Content bottom pad   | 96px   | Clears bottom nav (`pb-24`)              |

### Border Radius

| Token          | Value              | Pixels |
| -------------- | ------------------ | ------ |
| `--radius`     | `0.625rem` (base)  | 10px   |
| `--radius-sm`  | `calc(base × 0.6)` | 6px    |
| `--radius-md`  | `calc(base × 0.8)` | 8px    |
| `--radius-lg`  | `base`             | 10px   |
| `--radius-xl`  | `calc(base × 1.4)` | 14px   |
| `--radius-2xl` | `calc(base × 1.8)` | 18px   |
| `--radius-3xl` | `calc(base × 2.2)` | 22px   |
| `--radius-4xl` | `calc(base × 2.6)` | 26px   |

Cards use `rounded-2xl` (18px). Buttons and inputs use `rounded-lg` (10px). Primary action buttons use `rounded-xl` (14px). Badges use `rounded-4xl` (full pill). Bottom sheets round the top corners.

---

## Component Patterns

### Buttons

| Variant       | Background      | Text                     | Border     |
| ------------- | --------------- | ------------------------ | ---------- |
| `default`     | `--primary`     | `--primary-foreground`   | none       |
| `outline`     | `--card` (dark) | `--accent-foreground`    | `--border` |
| `secondary`   | `--secondary`   | `--secondary-foreground` | none       |
| `ghost`       | transparent     | `--accent-foreground`    | none       |
| `destructive` | `--destructive` | white                    | none       |

**Sizes**: xs (24px), sm (28px), default (32px), lg (36px). Primary action buttons are 56px (`h-14`) with `rounded-xl`.

**Interaction**: `translate-y-px` on active press for tactile feedback. `opacity-50` when disabled. 3px focus ring at 50% opacity.

### Cards

- Background: `--card` with `ring-1 ring-border` (subtle border)
- Corner radius: `rounded-2xl`
- Shadow: `shadow-sm`
- Padding: 16px (default), 12px (small variant)
- Interactive cards: `active:scale-[0.98]` with cursor-pointer
- Sub-components: Header (with optional action), Title, Description, Content, Footer
- Footer: `bg-muted/50` with top border, used for secondary info

### Inputs

- Height: 32px (default), 56px (form inputs with `h-14 rounded-xl`)
- Background: `--card` (dark mode — visible elevated surface)
- Border: `--input`, changes to `--ring` on focus
- Focus: 3px ring with `ring-ring/50`
- Error state: `border-destructive` with `ring-destructive/20`

### Bottom Sheets

- Slide up from bottom, max height `85dvh`
- Top corners rounded, drag handle at top center
- Overlay: `bg-black/10 backdrop-blur-xs`
- Safe area bottom padding via `env(safe-area-inset-bottom)`
- Content scrolls independently within the sheet

### Badges

- Pill-shaped (`rounded-4xl`), height 20px
- Variants match button variants
- Used for wallet types, categories, and status indicators

### Horizontal Scroll Affordance

- Scrollable rows (e.g. filter tabs) use a CSS `mask-image` gradient fade (24px wide) on whichever edge has overflow
- Mask state: `none` (all content fits), `end` (more to the right), `start` (more to the left), `both`
- Asymmetric padding (`pl-4 pr-2`) so the last item clips naturally, reinforcing the scroll signal
- Hidden scrollbar via `scrollbar-none` (cross-browser: `scrollbar-width: none` + `::-webkit-scrollbar`)

---

## Iconography

- **Library**: Lucide React
- **Default size**: 20×20 (`h-5 w-5`)
- **Icon containers**: Circular backgrounds, 40×40 (`size-10`) for feature icons
- **Navigation icons**: 20×20 in bottom nav
- **Category colors**: Each transaction category has a dedicated background color (green for income, red for food, blue for transport, etc.)

### Key Icons

| Context          | Icon              |
| ---------------- | ----------------- |
| Dashboard        | `LayoutDashboard` |
| Wallets          | `WalletCards`     |
| Transactions     | `ArrowLeftRight`  |
| Budgets          | `PiggyBank`       |
| Add new          | `Plus`            |
| Edit             | `Pencil`          |
| Settings         | `Settings`        |
| Close            | `X`               |
| Checking account | `Landmark`        |
| Savings          | `PiggyBank`       |
| Cash             | `Banknote`        |
| Credit card      | `CreditCard`      |
| Investment       | `TrendingUp`      |

---

## Page Layouts

### Mobile (current, 375–430px)

```
┌─────────────────────────────┐
│ safe-area-inset-top (16px+) │
├─────────────────────────────┤
│ Avatar  Greeting   Settings │  ← PageHeader row 1
│ Page Title    Month ▾       │  ← PageHeader row 2
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐    │
│  │  Net Worth Card     │    │  ← Full-width card
│  └─────────────────────┘    │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │ Income   │ │ Spent    │  │  ← 2-column grid
│  └──────────┘ └──────────┘  │
│                             │
│  ┌─────────────────────┐    │
│  │  Budget Progress    │    │  ← Full-width card
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    ���
│  │  Recent Transactions│    │  ← Card with list
│  └─────────────────────┘    │
│                             │
│         (pb-24 spacer)      │
├─────────────────────────────┤
│ 🏠  📊  │ ＋ │  💳  🐷  │  ← Bottom Nav + FAB
│ safe-area-inset-bottom      │
└─────────────────────────────┘
```

### Key Layout Rules

1. **Safe area insets** on top and bottom for notch/home-indicator devices
2. **Bottom nav** is fixed, blurred background (`backdrop-blur`), 95% opacity
3. **FAB** floats above bottom nav center, 56×56, primary color, ring-2 shadow
4. **Stat cards** use 2-column grid with 12px gap
5. **Sections** stack vertically with 16px gap
6. **Full-screen forms** fill `h-dvh` with scrollable content area
7. **Content padding** is 16px horizontal, always

### Desktop (planned, 1024px+)

Not yet implemented. Design goals:

- Sidebar navigation replacing bottom nav
- Multi-column content area (2–3 columns)
- Cards expand horizontally rather than stacking
- Net worth as a hero section
- Stat cards, budget, and transactions in a responsive grid

---

## Animations & Transitions

### View Transitions

| Type            | Old page                | New page             | Duration |
| --------------- | ----------------------- | -------------------- | -------- |
| Tab switch      | Fade out                | Fade in (50ms delay) | 150ms    |
| Push (navigate) | Slide left 30% + fade   | Slide in from right  | 300ms    |
| Pop (back)      | Slide right 100% + fade | Slide in from left   | 300ms    |
| Modal present   | Scale down to 94%       | Slide up from bottom | 350ms    |
| Modal dismiss   | Slide down              | Scale up from 94%    | 300ms    |
| Fade (fallback) | Shrink + fade out       | Fade in              | 200ms    |

### Easing Functions

| Name           | Value                            | Usage             |
| -------------- | -------------------------------- | ----------------- |
| Slide ease     | `cubic-bezier(0.32, 0.72, 0, 1)` | Page slides       |
| Modal in ease  | `cubic-bezier(0.16, 1, 0.3, 1)`  | Sheet/modal open  |
| Modal out ease | `cubic-bezier(0.32, 0, 0.67, 0)` | Sheet/modal close |

Reduced motion: all transitions collapse to a 100ms fade.

### Micro-interactions

- Button press: `translate-y-px` (1px downward)
- Interactive card tap: `scale(0.98)` briefly
- Loading spinner: `Loader2` icon with `animate-spin`

---

## Semantic Financial Patterns

### Currency Display

- **Full format**: Symbol + amount with decimals → `₹5,000.00`
- **Compact format**: Symbol + amount without decimals → `₹1,24,500`
- **Internal storage**: Signed int64 minor units (negative = debit, positive = credit)
- **Income**: Displayed in `text-income` (green)
- **Expense**: Displayed in `text-expense` (red/orange) or `text-foreground` (neutral)
- **Negative balances**: Use `text-expense` color

### Budget Progress

- Progress bar: 6px height, rounded-full
- Under 75%: `bg-primary` (green)
- 75–90%: `bg-yellow-500` (warning)
- Over 90%: `bg-destructive` (danger)

### Wallet Cards

- Grouped by type (checking, savings, cash, investment, credit)
- Group headers: Uppercase, 12px, medium weight, muted color, wide letter-spacing
- Each wallet shows: icon circle (40×40) + name + balance + sparkline
- Sparkline: Small inline chart showing balance trend

---

## Empty & Loading States

### Loading

- Skeleton placeholders matching content layout dimensions
- Cards show gray pulsing rectangles (`animate-pulse`)
- Skeletons use `bg-muted` color

### Empty States

- Centered layout with large muted icon (48×48)
- "No [items] yet" message in muted text
- Optional action button below

### Error States

- Centered message with retry button
- `text-destructive` for error text

---

## Accessibility

- **Touch targets**: Minimum 44×44px (`min-h-11 min-w-11`)
- **Focus indicators**: 3px ring, `ring-ring/50`
- **Color contrast**: All text meets WCAG AA against its background
- **Semantic HTML**: `<nav>`, `<section>`, `<header>`, `<main>`
- **ARIA**: Labels on interactive elements, `role="spinbutton"` for numeric inputs, `role="alert"` for error messages, `aria-live` for status updates
- **Screen readers**: `sr-only` class for icon-only buttons
- **Reduced motion**: All animations collapse to simple fades
