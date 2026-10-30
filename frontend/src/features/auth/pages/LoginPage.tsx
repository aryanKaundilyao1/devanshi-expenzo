import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PersonaSelectorDialog } from '../components/PersonaSelectorDialog';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().default(true),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextRoute = searchParams.get('next') ? decodeURIComponent(searchParams.get('next')!) : '/app/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [personaDialogOpen, setPersonaDialogOpen] = useState(false);
  const [simulatedNotice, setSimulatedNotice] = useState<string | null>(null);

  const { loginSimulated, signInWithSupabase, onboardingCompleted } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSimulatedNotice(null);

    const res = await signInWithSupabase(data.email, data.password);
    if (!res.success && res.error) {
      setSimulatedNotice(res.error);
      return;
    }

    loginSimulated(data.email);

    if (onboardingCompleted) {
      navigate(nextRoute);
    } else {
      navigate('/onboarding');
    }
  };

  const autofillDemoCredentials = () => {
    setValue('email', 'aryan.sharma@example.com');
    setValue('password', 'demo-password-123');
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-3 w-3" />
          <span>Interactive Prototype Gateway</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to EXPENZO
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Sign in to your simulated account or launch an instant persona session.
        </p>
      </div>

      {/* Quick Persona Launch Banner */}
      <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Fast Track: Continue with Demo Persona</span>
          </div>
          <Badge variant="success">Recommended</Badge>
        </div>
        <p className="text-xs text-emerald-950/80 dark:text-emerald-300 leading-relaxed">
          Skip manual login and explore pre-populated portfolios, bank accounts, and budgets tailored to your role.
        </p>
        <Button
          type="button"
          onClick={() => setPersonaDialogOpen(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
          size="sm"
        >
          Select Persona & Enter App
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        <span className="flex-shrink mx-4 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
          Or Enter Demo Credentials
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
      </div>

      {/* Login Form */}
      <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] shadow-sm space-y-4">
        {simulatedNotice && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{simulatedNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. aryan.sharma@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                className={`flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 ${
                  errors.password ? 'border-red-500' : ''
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                {...register('remember')}
              />
              <span>Remember demo session on this browser</span>
            </label>

            <button
              type="button"
              onClick={autofillDemoCredentials}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Autofill demo
            </button>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign In to Demo Session
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <span>Don&apos;t have an account? </span>
          <Link to="/auth/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Create Free Account
          </Link>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Demonstration Mode • Passwords are not permanently stored or checked remotely</span>
      </div>

      {/* Persona Dialog */}
      <PersonaSelectorDialog
        open={personaDialogOpen}
        onOpenChange={setPersonaDialogOpen}
        nextRoute={nextRoute}
      />
    </div>
  );
}

