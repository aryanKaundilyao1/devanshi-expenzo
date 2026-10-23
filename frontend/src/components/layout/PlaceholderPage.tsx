import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ExternalLink, Sparkles, Layers } from 'lucide-react';

export interface PlaceholderPageProps {
  title: string;
  description: string;
  phase: string;
  parentRoute?: { title: string; path: string };
  highlights?: string[];
}

export function PlaceholderPage({
  title,
  description,
  phase,
  parentRoute,
  highlights = [],
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
      {/* Header with Phase Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="info">
              <Sparkles className="h-3 w-3 mr-1" />
              {phase}
            </Badge>
            <span className="text-xs text-slate-400">Route Registered & Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {description}
          </p>
        </div>

        {parentRoute && (
          <Link to={parentRoute.path}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to {parentRoute.title}
            </Button>
          </Link>
        )}
      </div>

      {/* Prototype Status Card */}
      <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-500" />
            <CardTitle>Architecture & Layout Complete</CardTitle>
          </div>
          <CardDescription>
            This page layout, navigation contracts, and underlying state contracts are successfully initialized for Phase 1.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Planned Features for this Screen:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/app/dashboard">
              <Button size="sm">Go to Dashboard</Button>
            </Link>
            <Link to="/dev/ui-preview">
              <Button variant="secondary" size="sm">
                View UI Components
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

