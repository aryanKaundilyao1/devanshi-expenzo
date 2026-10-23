# Demo authentication and onboarding PRD

## Session model
This is **not real authentication**. `demoSession` stores chosen persona, entered display name optionally, onboarding status. Do not store password or email as proof of identity. Show 'Demo Mode' in app chrome and login flow.

## `/auth/login`
Email field (optional for demo persona route), password form only as visual prototype. **Enter Demo** opens persona chooser; Student/Professional/Family/Investor/Senior -> confirmation of dataset selection -> establish local demo session -> if onboarding done `/app/dashboard`, else `/onboarding`. **Sign In** when no backend -> show 'Real login unavailable; continue in demo' and Enter Demo CTA, not fake login success. Forgot Password -> `/auth/forgot-password`; Create Account -> `/auth/register`.

## `/auth/register`
Name, email, password, confirm password, terms checkbox with validation and password visibility toggle. **Create Account** -> 'Prototype only — account not created' screen with **Continue as Demo** -> `/onboarding`, retain only display preferences/name, not credentials. Terms -> `/terms`; privacy -> `/privacy`; Login -> `/auth/login`.

## Password / email screens
Forgot/reset/verify pages show appropriate fields and validated previews; action triggers message 'Email service not connected in prototype', offers demo return. No invented email sending or verification tokens.

## `/onboarding` steps
1 Welcome and optional display name; 2 Persona & experience level; 3 goals (save, track expenses, invest, manage bills), multi-select; 4 layout (Simple/Standard/Detailed), language English, currency INR; 5 review -> **Finish Setup** saves preferences and enters dashboard. Back preserves inputs; Skip uses default Professional; progress indicator, dismiss/back rules.

## Demo session exit
Avatar > Logout -> confirm -> clear demo session, preserve or reset demo financial data based on separate setting; redirect `/auth/login`. Protected routes redirect unauthenticated demo visitors to `/auth/login?next=<encodedRoute>`; after demo login honor safe internal next route only.
