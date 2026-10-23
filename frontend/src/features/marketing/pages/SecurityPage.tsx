import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  FileText,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export function SecurityPage() {
  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="success">Trust & System Architecture</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Security & Privacy Architecture
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          How EXPENZO isolates financial data, prevents unauthorized credential access, and enforces mathematical transparency across every module.
        </p>
      </div>

      {/* Main Security Pillars */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Our Planned Security Foundations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-3">
            <div className="flex items-center gap-2.5">
              <Lock className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Zero Credential Storing
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We never collect or store banking passwords, NetBanking PINs, or card CVVs. Future bank synchronization will utilize authorized, read-only consent protocols governed by official regulatory frameworks.
            </p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-3">
            <div className="flex items-center gap-2.5">
              <EyeOff className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Data Minimization
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We do not sell transaction feeds to data brokers or advertising exchanges. Your financial history is stored solely to provide personal accounting summaries, budget alerts, and savings goals.
            </p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-3">
            <div className="flex items-center gap-2.5">
              <Server className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Client-Side Sandbox Isolation
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In this prototype phase, all financial records and transactions exist strictly within your local browser storage. No financial telemetry leaves your machine or contacts third-party analytics servers.
            </p>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] space-y-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Offline AI Processing
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Our AI insights and conversational assistant execute deterministically in the client runtime without sending transaction payloads to third-party generative LLMs or hosted cloud services.
            </p>
          </Card>
        </div>
      </div>

      {/* Prototype Limitations Disclosure */}
      <Card className="p-8 border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-4">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <span>Honest Prototype Boundaries & Compliance Notice</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          EXPENZO is currently in early prototype preview. We do not claim SOC2, ISO 27001, or RBI Account Aggregator certifications that have not yet been formally audited. Do not enter real-world bank credentials, live passwords, or private bank account numbers into this demonstration interface.
        </p>
        <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Link to="/privacy" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            <span>Read Complete Privacy Policy</span>
          </Link>
          <Link to="/terms" className="hover:underline flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            <span>Read Terms of Service</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}

