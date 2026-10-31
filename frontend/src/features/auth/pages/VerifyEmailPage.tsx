import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, CheckCircle2, ShieldCheck, MailCheck } from 'lucide-react';

export function VerifyEmailPage() {
  const { isAuthenticated } = useAuthStore();
  const [verifiedOnline, setVerifiedOnline] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setVerifiedOnline(true);
        }
      });
    }
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="space-y-2 text-center lg:text-left">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Email Verification Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Client-side prototype status notice.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] shadow-sm text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {verifiedOnline ? 'Email Successfully Verified' : 'Simulated Verification Active'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {verifiedOnline
              ? 'Your email address has been authenticated with Supabase. Your private financial database workspace is active and ready.'
              : 'In accordance with our prototype design rules, no external verification emails are dispatched. Your local demonstration session is pre-verified.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/app/dashboard">
            <Button>
              Open App Dashboard
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline">
              Return to Login
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

