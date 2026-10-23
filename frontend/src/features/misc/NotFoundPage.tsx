import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1220] p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            404
          </h1>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The financial route you requested does not exist or may have moved.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link to="/app/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">
              Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

