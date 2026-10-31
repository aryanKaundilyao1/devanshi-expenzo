import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const { resetPasswordForEmail } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setResetError(null);
    const res = await resetPasswordForEmail(data.email);
    if (!res.success && res.error) {
      setResetError(res.error);
      return;
    }
    setSubmittedEmail(data.email);
  };

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
          Recover Your Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Simulated password reset flow for demonstration environments.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] shadow-sm space-y-4">
        {resetError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <span>{resetError}</span>
          </div>
        )}
        {submittedEmail ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in-50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Request Validated Locally
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Password recovery requested for <strong>{submittedEmail}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 text-left space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Prototype Environment Notice:</span>
              </p>
              <p>
                Email dispatch services are not connected in this client-side prototype. In production, an encrypted, time-limited reset link would be transmitted to this inbox.
              </p>
            </div>

            <Link to="/auth/login">
              <Button className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="e.g. aryan.sharma@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Send Simulated Recovery Link
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

