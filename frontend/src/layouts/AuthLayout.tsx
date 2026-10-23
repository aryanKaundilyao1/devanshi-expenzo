import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-slate-100">
      {/* Left Panel: Fintech Brand & Visual Highlight */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#080E1A] text-white p-12 flex-col justify-between border-r border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <Link to="/" className="flex items-center gap-2.5 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-xl shadow-md">
            E
          </div>
          <span className="font-extrabold text-xl tracking-tight">EXPENZO</span>
        </Link>

        {/* Mid Hero Value Proposition */}
        <div className="my-auto max-w-lg z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Unified Financial Intelligence</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Your entire financial world in one intelligent platform.
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Expense tracking, multi-account banking management, stock market portfolio discovery, and explainable AI insights — unified seamlessly.
          </p>

          <div className="space-y-3 pt-2">
            {[
              'Single canonical ledger for accurate zero-error accounting',
              'Deterministic offline AI financial assistant & diagnostic cards',
              'Tailored experiences for students, professionals, investors & families',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Quick Demo Preview Card */}
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Demonstration Balance</p>
                <p className="text-sm font-bold tabular-nums">₹77,200 Liquid Cash</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/50">
              Demo Active
            </span>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400 z-10">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Interactive Prototype Sandbox. Zero real financial data collected.</span>
        </div>
      </div>

      {/* Right Panel: Auth Container */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-lg">
              E
            </div>
            <span className="font-extrabold text-lg tracking-tight">EXPENZO</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

