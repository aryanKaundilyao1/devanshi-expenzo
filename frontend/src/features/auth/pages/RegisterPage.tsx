import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/useAuthStore';
import { Eye, EyeOff, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the demonstration Terms and Privacy Policy' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const { registerLocalProfile, signUpWithSupabase } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as any,
    },
  });

  const passwordValue = watch('password', '');

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', percent: 0, color: 'bg-slate-200' };
    if (pwd.length < 6) return { label: 'Too short', percent: 25, color: 'bg-red-500' };
    const hasNumbers = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    if (pwd.length >= 8 && hasNumbers && hasSpecial) {
      return { label: 'Strong', percent: 100, color: 'bg-emerald-500' };
    }
    if (pwd.length >= 6 && (hasNumbers || hasSpecial)) {
      return { label: 'Medium', percent: 65, color: 'bg-amber-500' };
    }
    return { label: 'Weak', percent: 40, color: 'bg-amber-400' };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError(null);
    const res = await signUpWithSupabase(data.email, data.password, data.name);
    if (!res.success && res.error) {
      setRegisterError(res.error);
      return;
    }
    registerLocalProfile(data.name, data.email);
    navigate('/onboarding');
  };

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-3 w-3" />
          <span>New Prototype Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create Your Free Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure your local financial preferences. No real passwords are stored on external servers.
        </p>
      </div>

      {/* Registration Card */}
      <Card className="p-6 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] shadow-sm space-y-4">
        {registerError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <span>{registerError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Aryan Sharma"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="aryan.sharma@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password with Strength Indicator */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
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

            {passwordValue && (
              <div className="pt-1 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Strength: {strength.label}</span>
                  <span>{strength.percent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                className={`flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          {/* Terms Acknowledgement */}
          <div className="pt-1 space-y-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 leading-snug">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                {...register('acceptTerms')}
              />
              <span>
                I acknowledge this is a prototype sandbox and accept the{' '}
                <Link to="/terms" target="_blank" className="text-emerald-600 dark:text-emerald-400 font-semibold underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className="text-emerald-600 dark:text-emerald-400 font-semibold underline">
                  Privacy Policy
                </Link>.
              </span>
            </label>
            {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>}
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create Profile & Start Onboarding
          </Button>
        </form>

        <div className="pt-3 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
          <span>Already have a demo session? </span>
          <Link to="/auth/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Sign In Here
          </Link>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Local Browser Storage • No unverified certifications or remote telemetry</span>
      </div>
    </div>
  );
}

