/**
 * EXPENZO — Family Members & Seat Management Page
 * Milestone: CSCR2600 PBL-1
 * Academic Author: Devanshi Singh
 */

import React, { useState } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { SeatProgressBar } from '../components/SeatProgressBar';
import { MemberCard } from '../components/MemberCard';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Clock,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function FamilyMembersPage() {
  const {
    activeFamilyId,
    families,
    inviteMember,
    revokeInvitation,
    removeMember,
  } = useFamilyStore();

  const currentFamily = families.find((f) => f.id === activeFamilyId) || families[0];
  const members = currentFamily?.members || [];
  const invitations = currentFamily?.invitations || [];

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [inviteStatus, setInviteStatus] = useState<{ success: boolean; message: string } | null>(null);

  const activeMembersCount = members.filter((m) => m.status === 'active').length;
  const pendingInvitations = invitations.filter((i) => i.status === 'pending');
  const pendingInvitationsCount = pendingInvitations.length;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const res = inviteMember(currentFamily.id, inviteEmail, inviteRole);
    if (res.success) {
      setInviteStatus({
        success: true,
        message: `Invitation successfully sent to ${inviteEmail}. Seat reserved in current plan.`,
      });
      setInviteEmail('');
    } else {
      setInviteStatus({
        success: false,
        message: res.error || 'Failed to send invitation.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/app/family"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Family Overview</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Members & Seat Allocation
          </h1>
          <p className="text-xs text-slate-500">
            Manage household collaborators, issue invitations, and track seat quotas.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setInviteStatus(null);
            setInviteModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs text-xs"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Invite New Member</span>
        </Button>
      </div>

      {/* Seat Utilization Progress Bar */}
      <SeatProgressBar
        planId={currentFamily?.planId || 'family'}
        activeMembersCount={activeMembersCount}
        pendingInvitationsCount={pendingInvitationsCount}
        onOpenInviteModal={() => {
          setInviteStatus(null);
          setInviteModalOpen(true);
        }}
      />

      {/* Active Members Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Active Members ({activeMembersCount})</span>
            <Badge variant="outline" className="text-[10px]">
              Enrolled
            </Badge>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isCurrentUserOwner={true}
              currentUserId="user-devanshi-01"
              onRemoveMember={(id) => removeMember(currentFamily.id, id)}
            />
          ))}
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Pending Invitations ({pendingInvitations.length})</span>
            <Badge variant="secondary" className="text-[10px] text-amber-600 dark:text-amber-400">
              Reserving Seats
            </Badge>
          </h3>
          <span className="text-[11px] text-slate-400">
            Pending invitations strictly hold seats to prevent over-subscription.
          </span>
        </div>

        {pendingInvitations.length === 0 ? (
          <Card className="p-6 text-center border-dashed border-slate-200 dark:border-slate-800 bg-transparent">
            <Mail className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No pending invitations</p>
            <p className="text-[11px] text-slate-400">All available plan seats can be assigned immediately.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingInvitations.map((inv) => (
              <Card
                key={inv.id}
                className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {inv.email}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Role: <span className="capitalize">{inv.role}</span> • Expires in 7 days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px] bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Seat Reserved
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeInvitation(inv.id)}
                    className="h-7 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1 px-2"
                  >
                    <XCircle className="h-3 w-3" />
                    <span>Revoke</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Invite Family Collaborator</DialogTitle>
                <DialogDescription className="text-xs">
                  Invited members will occupy 1 active seat upon sending.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSendInvite} className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <Input
                type="email"
                required
                placeholder="family.member@domain.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Workspace Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInviteRole('member')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    inviteRole === 'member'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] text-slate-600'
                  }`}
                >
                  <span className="block font-bold">Standard Member</span>
                  <span className="text-[10px] text-slate-500 font-normal">View shared expenses & goals</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInviteRole('admin')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    inviteRole === 'admin'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] text-slate-600'
                  }`}
                >
                  <span className="block font-bold">Workspace Admin</span>
                  <span className="text-[10px] text-slate-500 font-normal">Manage shared budgets & invites</span>
                </button>
              </div>
            </div>

            {inviteStatus && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  inviteStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
                }`}
              >
                {inviteStatus.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                )}
                <span>{inviteStatus.message}</span>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
                Close
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

