/**
 * EXPENZO — Workspace Switcher Component
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import React from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { User, Users, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface WorkspaceSwitcherProps {
  className?: string;
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ className, collapsed = false }: WorkspaceSwitcherProps) {
  const {
    activeWorkspaceMode,
    activeFamilyId,
    families,
    switchWorkspaceMode,
  } = useFamilyStore();

  const currentFamily = families.find((f) => f.id === activeFamilyId) || families[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border outline-none',
            'bg-white dark:bg-[#111C30] hover:bg-slate-50 dark:hover:bg-slate-800/60',
            activeWorkspaceMode === 'family'
              ? 'border-indigo-300 dark:border-indigo-700/80 shadow-xs'
              : 'border-slate-200 dark:border-slate-800',
            className
          )}
          title="Switch between Personal and Family Workspace"
        >
          <div
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs',
              activeWorkspaceMode === 'family'
                ? 'bg-indigo-600 text-white'
                : 'bg-emerald-600 text-white'
            )}
          >
            {activeWorkspaceMode === 'family' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {activeWorkspaceMode === 'family' ? currentFamily?.name || 'Family Workspace' : 'Personal Workspace'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                {activeWorkspaceMode === 'family'
                  ? `${currentFamily?.members.length || 0} Members • ${currentFamily?.planId.toUpperCase()} Plan`
                  : 'Private Single-User Ledger'}
              </span>
            </div>
          )}

          {!collapsed && <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-auto" />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64 p-1.5 shadow-xl">
        <DropdownMenuLabel className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
          Select Active Workspace
        </DropdownMenuLabel>

        {/* Personal Workspace Option */}
        <DropdownMenuItem
          onClick={() => switchWorkspaceMode('personal')}
          className="flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <User className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">Personal Workspace</p>
              <p className="text-[10px] text-slate-500">Private financial accounts & ledger</p>
            </div>
          </div>
          {activeWorkspaceMode === 'personal' && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        {/* Family Workspaces */}
        <DropdownMenuLabel className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
          Family Workspaces
        </DropdownMenuLabel>

        {families.map((fam) => {
          const isSelected = activeWorkspaceMode === 'family' && activeFamilyId === fam.id;
          return (
            <DropdownMenuItem
              key={fam.id}
              onClick={() => switchWorkspaceMode('family', fam.id)}
              className="flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{fam.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {fam.members.length} members • Plan: {fam.planId}
                  </p>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0 ml-2" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

