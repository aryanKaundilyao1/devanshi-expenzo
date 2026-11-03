/**
 * EXPENZO — Seat Utilization Progress Bar Component
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Users, UserPlus, Sparkles, AlertTriangle } from 'lucide-react';
import { calculateSeatUtilization } from '@/domain/calculations/seatOptimizer';
import { Link } from 'react-router-dom';

interface SeatProgressBarProps {
  planId: string;
  activeMembersCount: number;
  pendingInvitationsCount: number;
  onOpenInviteModal?: () => void;
  showCardWrapper?: boolean;
}

export function SeatProgressBar({
  planId,
  activeMembersCount,
  pendingInvitationsCount,
  onOpenInviteModal,
  showCardWrapper = true,
}: SeatProgressBarProps) {
  const summary = calculateSeatUtilization({
    planId,
    activeMembersCount,
    pendingInvitationsCount,
  });

  const percent = Math.min(100, summary.utilizationPercentage);
  const isFull = !summary.hasAvailableSeat;
  const isHigh = percent >= 75 && !isFull;

  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Seat Allocation ({summary.plan.name} Tier)
              </h4>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                {summary.plan.name}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {summary.occupiedSeats} of {summary.maxSeats} active & reserved seats occupied
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {summary.hasAvailableSeat && onOpenInviteModal && (
            <Button size="sm" onClick={onOpenInviteModal} className="h-8 text-xs gap-1.5 shadow-xs">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Invite Member</span>
            </Button>
          )}
          <Link to="/app/family/plans">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Seat Plans</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {/* Active Members Portion */}
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
            style={{ width: `${(summary.activeMembersCount / summary.maxSeats) * 100}%` }}
            title={`Active Members: ${summary.activeMembersCount}`}
          />
          {/* Pending Invitations Portion (Reserved) */}
          <div
            className="h-full bg-amber-400 dark:bg-amber-500 border-l border-white dark:border-slate-900 transition-all duration-500"
            style={{ width: `${(summary.pendingInvitationsCount / summary.maxSeats) * 100}%` }}
            title={`Pending Invitations: ${summary.pendingInvitationsCount} (Seats Reserved)`}
          />
        </div>

        {/* Legend & Seat Count */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-0.5 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              <span>Active Members ({summary.activeMembersCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Pending Reserved ({summary.pendingInvitationsCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700" />
              <span>Available ({summary.availableSeats})</span>
            </span>
          </div>

          <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
            {percent}% capacity
          </span>
        </div>
      </div>

      {isFull && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>100% Seat Capacity Reached:</strong> All {summary.maxSeats} seats are occupied or reserved. Upgrade to Family Plus to invite more members.
            </span>
          </div>
          <Link to="/app/family/plans" className="shrink-0">
            <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5">
              Upgrade Tier
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  if (!showCardWrapper) return content;

  return (
    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
      {content}
    </Card>
  );
}

