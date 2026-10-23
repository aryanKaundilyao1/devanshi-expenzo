import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, ArrowRight, ShieldCheck, ChevronDown, CheckCircle, TrendingUp, Wallet } from 'lucide-react';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';

export function HeroSection() {
  const scrollToPreview = () => {
    const el = document.getElementById('interactive-preview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Your Intelligent Financial Companion</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              All Your Money. <br />
              <span className="text-emerald-600 dark:text-emerald-500">One Smarter Place.</span>
            </h1>

            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Track expenses, manage your financial accounts, explore investments, and understand your money with intelligent insights — all from one unified platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link to="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-md shadow-emerald-900/15">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={scrollToPreview}
                className="w-full sm:w-auto"
              >
                Explore the Platform
                <ChevronDown className="h-4 w-4 ml-1.5" />
              </Button>
            </div>

            {/* Trust Notice */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Zero bank connection mandatory — track expenses manually</span>
              </div>
              <div className="hidden sm:block text-slate-300 dark:text-slate-700">•</div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>100% Client-side demo sandbox</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Snapshot */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111C30]/95 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-md relative z-10 space-y-5">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">
                    E
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Financial Snapshot
                    </h3>
                    <p className="text-[11px] text-slate-400">As of Oct 15, 2026</p>
                  </div>
                </div>
                <Badge variant="success">Demonstration Live</Badge>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Total Cash</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                    <CurrencyDisplay minor={7720000} />
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    across 3 accounts
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                    <span>Investments</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                    <CurrencyDisplay minor={4250000} />
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    +8.97% overall gain
                  </span>
                </div>
              </div>

              {/* Sample Mini Chart Bar */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">October Cash Flow</span>
                  <span className="font-semibold text-emerald-600">+₹33,200 Surplus</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-[64%]" title="Saved Income" />
                  <div className="bg-amber-500 h-full w-[36%]" title="Spent Outflow" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Inflow: ₹52,000</span>
                  <span>Outflow: ₹18,800</span>
                </div>
              </div>

              {/* Mini AI Insight Bubble */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  <strong className="font-semibold">Insight:</strong> Savings rate is currently 63.8% — high surplus enables your MacBook savings goal milestone on time.
                </p>
              </div>
            </div>

            {/* Background accent ring */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 -z-10 blur-xl opacity-75" />
          </div>
        </div>
      </div>
    </section>
  );
}

