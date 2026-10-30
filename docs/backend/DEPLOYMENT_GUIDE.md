# EXPENZO — Production Deployment Guide ($0 Free Tier)

This guide walks you through deploying EXPENZO with a live PostgreSQL database, Supabase Auth, and Vercel hosting for **$0 cost**.

---

## 1. Create Supabase Project (Database & Backend) — $0 Free Tier

1. Sign up or log in at **[https://supabase.com](https://supabase.com)**.
2. Click **"New Project"**.
   - **Name:** `expenzo-production`
   - **Database Password:** (Generate a strong password and save it)
   - **Region:** Select closest to your users (e.g., South Asia - Mumbai `ap-south-1`).
3. Once provisioned, go to **SQL Editor** on the left menu.
4. Open the migration files in this repository:
   - Copy the SQL from [`supabase/migrations/20261030000000_initial_schema.sql`](file:///Users/aryankaundilya/Desktop/Expenzo/supabase/migrations/20261030000000_initial_schema.sql) $\rightarrow$ Paste and click **Run**.
   - Copy the SQL from [`supabase/migrations/20261030000001_rls_policies.sql`](file:///Users/aryankaundilya/Desktop/Expenzo/supabase/migrations/20261030000001_rls_policies.sql) $\rightarrow$ Paste and click **Run**.
   - Copy the SQL from [`supabase/migrations/20261030000002_atomic_financial_rpcs.sql`](file:///Users/aryankaundilya/Desktop/Expenzo/supabase/migrations/20261030000002_atomic_financial_rpcs.sql) $\rightarrow$ Paste and click **Run**.
5. Go to **Project Settings** $\rightarrow$ **API**:
   - Copy your **Project URL** (`https://<project-id>.supabase.co`).
   - Copy your **anon / public key** (`eyJhbGciOi...`).

---

## 2. Deploy Frontend to Vercel — $0 Free Tier

1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat(backend): complete Supabase backend integration"
   git push origin main
   ```
2. In your **[Vercel Dashboard](https://vercel.com)**:
   - Go to your `devanshi-expenzo` project $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**.
   - Add the following variables:
     - `VITE_SUPABASE_URL`: `https://<your-project-id>.supabase.co`
     - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOi...` (your Supabase anon key)
     - `VITE_BACKEND_MODE`: `auto`
3. Under **Settings** $\rightarrow$ **General**:
   - **Root Directory**: `frontend` (or leave default if using root `package.json`).
4. Go to **Deployments** $\rightarrow$ click `...` $\rightarrow$ **Redeploy**.

Your live URL `https://devanshi-expenzo.vercel.app` is now completely database-backed, persistent, and multi-user secure!

