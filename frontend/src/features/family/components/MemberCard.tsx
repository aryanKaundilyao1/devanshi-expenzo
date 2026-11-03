/**
 * EXPENZO — Family Member Card Component
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FamilyMember } from '@/types/family';
import { Crown, Shield, User, MoreVertical, Trash2, Calendar, Wallet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

interface MemberCardProps {
  member: FamilyMember;
  isCurrentUserOwner: boolean;
  currentUserId: string;
  onRemoveMember?: (memberUserId: string) => void;
}

export function MemberCard({
  member,
  isCurrentUserOwner,
  currentUserId,
  onRemoveMember,
}: MemberCardProps) {
  const isOwner = member.role === 'owner';
  const isSelf = member.userId === currentUserId;

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const formattedIncome = member.knownMonthlyIncomeMinor
    ? `₹${(member.knownMonthlyIncomeMinor / 100).toLocaleString('en-IN')}`
    : 'Not disclosed';

  const formattedBudget = member.allocatedBudgetMinor
    ? `₹${(member.allocatedBudgetMinor / 100).toLocaleString('en-IN')}`
    : 'Flexible';

  const joinDate = new Date(member.joinedAt).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="space-y-4">
        {/* Top Header: Avatar, Name & Role Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{member.name}</h4>
                {isSelf && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-slate-500">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                {member.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isOwner ? (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 text-[10px] gap-1 font-semibold">
                <Crown className="h-3 w-3" />
                <span>Owner</span>
              </Badge>
            ) : member.role === 'admin' ? (
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 text-[10px] gap-1 font-semibold">
                <Shield className="h-3 w-3" />
                <span>Admin</span>
              </Badge>
            ) : (
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] gap-1">
                <User className="h-3 w-3" />
                <span>Member</span>
              </Badge>
            )}

            {isCurrentUserOwner && !isOwner && onRemoveMember && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem
                    onClick={() => onRemoveMember(member.userId)}
                    className="text-rose-600 dark:text-rose-400 focus:text-rose-600 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove Member</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Member Financial Snapshot Details */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Wallet className="h-3 w-3 text-emerald-500" />
              <span>Known Income</span>
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formattedIncome}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-medium">Monthly Budget</span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formattedBudget}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Joined {joinDate}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active Seat
        </span>
      </div>
    </Card>
  );
}
