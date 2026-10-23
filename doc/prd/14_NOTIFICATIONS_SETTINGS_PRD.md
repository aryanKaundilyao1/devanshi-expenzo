# Notification center and settings PRD

## `/app/notifications`
Tabs All/Unread/Budget/Bills/Investments/System. Bell counter reflects unread count. Clicking row marks read and navigates to `linkRoute` if valid; **Mark all read** updates state; **Delete** confirm; empty state appropriate. Budget/recurring notifications derived from rule events and deduplicated by entity+threshold+period; dismissed alerts do not prevent later distinct events.

## Settings routes
- `/app/settings/profile`: name, persona, experience; **Save** updates profile; persona switch warns dataset reset.
- `/app/settings/appearance`: Light/Dark/System; text size Normal/Large; **Apply** updates theme immediately and persists.
- `/app/settings/financial`: INR only; demo as-of date displayed read-only; default date range/starting dashboard preferences; unsupported currencies labeled future.
- `/app/settings/security`: show honest demo notice 'No real login, password storage or account security in prototype'; backend features unavailable, no fake MFA toggles.
- `/app/settings/connections`: demo accounts list; **View Account** -> banking account; **Connect Real Account** -> informational modal unavailable. No financial credentials.
- `/app/settings/privacy`: what localStorage contains; **Download Demo Data** -> JSON with fictional data; **Reset Demo Data** -> typed confirmation or strong confirm, restores persona seed; **Clear Demo Chat History** -> confirm.
- `/app/settings/notifications`: toggle budget/bill/portfolio/system alerts for future generated local notifications; **Save** persists. Settings affect new alert creation and display behavior.

## Shared actions
Avatar menu **Profile** -> profile; **Appearance** -> appearance; **Reset Demo** -> privacy reset confirm; **Log Out** -> demo logout confirm. Header bell -> notifications. Persist user preferences separately from dataset so reset behavior is documented.

## Acceptance
Theme survives refresh; reset restores exact seed; notification count accurate; deleted chat history never reappears after refresh; disabled security/connection controls do not imply real protection.
