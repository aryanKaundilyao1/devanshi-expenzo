import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-emerald-950 text-white">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-xs font-semibold text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Start Your Financial Journey Today</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Take Control of Your Financial Future.
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Bring your spending, budgets, goals, and financial insights together in one place. Test our interactive sandbox immediately without real bank synchronization.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link to="/auth/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>

          <Link to="/features" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-emerald-700 text-white hover:bg-emerald-900/60"
            >
              Explore Features
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-emerald-400/80 pt-2">
          Demonstration platform • Free instant access • Zero credit card required
        </p>
      </div>
    </section>
  );
}

