import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  ArrowLeft,
  Building2,
  Edit2,
  Trash2,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { BankingBeneficiary } from '@/types/finance';
import { BeneficiaryModal } from '@/features/banking/components/BeneficiaryModal';
import { DeleteConfirmationDialog } from '@/features/expenses/components/DeleteConfirmationDialog';

export function BeneficiariesPage() {
  const { beneficiaries, deleteBeneficiary } = useFinanceStore();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [beneficiaryToEdit, setBeneficiaryToEdit] = useState<BankingBeneficiary | null>(null);

  // Deletion modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<BankingBeneficiary | null>(null);

  const filteredBeneficiaries = useMemo(() => {
    return (beneficiaries || []).filter((b) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.bankName.toLowerCase().includes(q) ||
        (b.nickname && b.nickname.toLowerCase().includes(q)) ||
        b.accountNumberMasked.toLowerCase().includes(q)
      );
    });
  }, [beneficiaries, search]);

  const handleEdit = (b: BankingBeneficiary) => {
    setBeneficiaryToEdit(b);
    setModalOpen(true);
  };

  const handleDeletePrompt = (b: BankingBeneficiary) => {
    setBeneficiaryToDelete(b);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (beneficiaryToDelete) {
      deleteBeneficiary(beneficiaryToDelete.id);
      setDeleteDialogOpen(false);
      setBeneficiaryToDelete(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/app/banking"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Banking
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Beneficiaries
            </h1>
            <Badge variant="outline" className="text-xs">
              {(beneficiaries || []).length} Saved
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Directory of external payees, utility providers, and family contacts.
          </p>
        </div>

        <Button
          onClick={() => {
            setBeneficiaryToEdit(null);
            setModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Beneficiary
        </Button>
      </div>

      {/* Safety Notice */}
      <Card className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong>Demonstration Payee Directory:</strong>
          <p>
            External wire transfers and NEFT/IMPS rails are disabled in this prototype. To move funds, use <em>Internal Transfers</em> between your owned accounts.
          </p>
        </div>
      </Card>

      {/* Search Toolbar */}
      <Card className="p-4 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, nickname, or bank..."
            className="pl-9"
          />
        </div>
      </Card>

      {/* Beneficiaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeneficiaries.map((b) => (
          <Card
            key={b.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {b.name}
                  </h4>
                  <p className="text-xs text-slate-500">{b.bankName}</p>
                </div>
              </div>
              {b.nickname && (
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                  {b.nickname}
                </Badge>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Account Ref:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{b.accountNumberMasked}</span>
              </div>
              {b.notes && (
                <div className="text-slate-500 pt-1 text-[11px] italic">
                  &ldquo;{b.notes}&rdquo;
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">
                Added {b.createdAt ? b.createdAt.split('T')[0] : 'Demo'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(b)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit Beneficiary"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePrompt(b)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete Beneficiary"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBeneficiaries.length === 0 && (
        <Card className="p-8 text-center rounded-2xl bg-white dark:bg-[#111C30] border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No beneficiaries found
          </p>
          <p className="text-xs text-slate-500">
            Add demo payees or landlords to keep your banking address book organized.
          </p>
        </Card>
      )}

      {/* Beneficiary Modal */}
      <BeneficiaryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        beneficiaryToEdit={beneficiaryToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Beneficiary"
        description={`Are you sure you want to remove ${beneficiaryToDelete?.name} from your demo payee directory?`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

