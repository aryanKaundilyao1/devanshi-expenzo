import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env as any).Supabse_url ||
  (import.meta.env as any).supabase_url ||
  (import.meta.env as any).SUPABASE_URL;

const rawAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta.env as any).supabase_anon_key ||
  (import.meta.env as any).SUPABASE_ANON_KEY;

const supabaseUrl = (typeof rawUrl === 'string' ? rawUrl.trim() : undefined);
const supabaseAnonKey = (typeof rawAnonKey === 'string' ? rawAnonKey.trim() : undefined);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('placeholder')
);

export function getSupabaseConfigStatus(): {
  isConfigured: boolean;
  missingKeys: string[];
  message: string;
} {
  const missing: string[] = [];
  if (!supabaseUrl || !supabaseUrl.startsWith('https://') || supabaseUrl.includes('placeholder')) {
    missing.push('VITE_SUPABASE_URL');
  }
  if (!supabaseAnonKey || supabaseAnonKey.length <= 20) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }

  return {
    isConfigured: isSupabaseConfigured,
    missingKeys: missing,
    message: isSupabaseConfigured
      ? 'Supabase client is configured and ready.'
      : `Missing Supabase configuration: ${missing.join(', ')}. Set these environment variables in your Vercel Dashboard or .env file.`,
  };
}

if (!isSupabaseConfigured) {
  if (import.meta.env.PROD) {
    console.error(
      '[EXPENZO Production Configuration Notice] Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set in this deployment. Demo and offline features remain active, but live cloud database persistence requires valid Supabase environment variables in Vercel.'
    );
  } else {
    console.info(
      '[EXPENZO Dev] Running with local/mock fallback. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect to live Supabase.'
    );
  }
}

// Fallback dummy URL and anon key for compile/test environments when real credentials are not yet injected
const effectiveUrl = isSupabaseConfigured ? supabaseUrl! : 'https://expenzo-local.supabase.co';
const effectiveAnonKey = isSupabaseConfigured
  ? supabaseAnonKey!
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_local_compilation';

export const supabase: SupabaseClient = createClient(effectiveUrl, effectiveAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'expenzo-supabase-auth',
  },
});
