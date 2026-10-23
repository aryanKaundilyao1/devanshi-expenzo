import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Lock, EyeOff, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export function SecuritySection() {
  const trustPoints = [
    {
      title: 'Data Minimization',
      icon: EyeOff,
      description:
        'We only process records necessary for your personal accounting. No advertising telemetry, tracking beacons, or cross-site data broker sharing.',
    },
    {
      title: 'Zero Bank Credential Collection',
      icon: Lock,
      description:
        'EXPENZO will never prompt for your net banking passwords, MPINs, or ATM PINs. We rely strictly on verified user data entry and future read-only account aggregators.',
    },
    {
      title: 'Financial Data Separation',
      icon: Shield,
      description:
        'Transfers and balances are computed on independent normalized accounts. In our current prototype, all data resides strictly inside your browser sandbox.',
    },
    {
      title: 'Explainable Transparent AI',
      icon: FileText,
      description:
        'Our financial intelligence operates via transparent formulas and deterministic rule sets. No fabricated guarantees or opaque black-box recommendations.',
    },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Trust, Isolation & Privacy
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Security Built on Principles, Not Buzzwords
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Financial technology demands institutional responsibility. Here is how EXPENZO is architected to protect your privacy and personal autonomy.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustPoints.map((tp) => {
          const Icon = tp.icon;
          return (
            <Card
              key={tp.title}
              className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tp.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {tp.description}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified Contract</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <Link to="/security">
          <Button variant="outline">
            Learn About Our Security Architecture
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

