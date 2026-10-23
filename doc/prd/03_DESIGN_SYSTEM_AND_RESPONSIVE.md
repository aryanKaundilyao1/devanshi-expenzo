# Design system, layout and Stitch handoff

## Tokens
Brand primary `#16A34A`; light background `#F8FAFC`; light surface `#FFFFFF`; dark background `#0B1220`; dark surface `#111C30`; text `#0F172A`; muted `#64748B`; borders `#E2E8F0`; warning `#F59E0B`; danger `#DC2626`; info `#3B82F6`. Ensure WCAG AA contrast; not every brand shade is valid for small text on white. Green and red must be accompanied by signs/labels.

## Typography / spacing
Inter system fallback. Tabular numeric font features for money. 4px spacing scale (4,8,12,16,24,32,48,64). H1 28-36px app / 40-64px hero; body 14-16px; avoid tiny finance labels. Card radius 16px; modal 16px; restrained shadows; consistent focus ring. All amounts display ₹ and Indian grouping (`₹1,25,400`), negative values as `−₹500`.

## Breakpoints and page frames
Mobile <640px one-column stacked charts, sticky primary action when useful, scrollable tables via card/row transformation; tablet 640–1023px two-column possible; desktop >=1024px sidebar 240px expanded / 72px collapsed; app content max width ~1440px with 24px gutters. Marketing max content ~1200px. Charts min 240px height and helpful accessible tabular summaries.

## Shared components
Button, IconButton, Link, Card, MetricCard, Currency, Badge, Tabs, Dialog, Drawer, ConfirmDialog, Select, Search, DateRange, Table, ChartCard, EmptyState, ErrorState, LoadingSkeleton, Toast, InsightCard, AccountCard, TransactionRow, GoalCard, HoldingRow, Tooltip, Pagination.

## Appearance
Light default, dark + system choices; persist preferences. Animations 150-250ms; obey reduced motion. Keyboard focus clearly visible, all dialogs have accessible titles, ESC closes cancelable dialogs and focus returns to trigger.

## Stitch policy
Design only reference screens (Home, Dashboard, Expenses, Assistant) first, then banking/investments. Stitch exports are visual reference, refactor into React shared components; no duplicated raw markup. Brand mark and logos must not falsely claim bank affiliation.
