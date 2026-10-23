import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react';

export function ResetPasswordPage() {
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
          Reset Your Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Backend authentication notice for demonstration environments.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] shadow-sm space-y-4">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Prototype Environment Boundary</span>
          </div>
          <p className="leading-relaxed">
            Live password modification requires authenticated server sessions, cryptographic token verification, and database hash persistence (scheduled for Phase 12 Spring Boot integration).
          </p>
          <p className="leading-relaxed">
            Because this frontend prototype does not collect or permanently store actual passwords, you can sign in directly or launch any demo persona.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/auth/login">
            <Button className="w-full">
              Return to Sign In & Demo Switcher
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

