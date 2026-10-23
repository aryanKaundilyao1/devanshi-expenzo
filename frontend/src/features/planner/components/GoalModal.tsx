import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SavingsGoal } from '@/types/finance';
import { calculateMonthsRemaining, calculateRequiredMonthlyContribution } from '@/features/planner/utils/plannerCalculations';
import { formatINR } from '@/domain/money/formatters';
import { X, AlertCircle, Target } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const { upsertGoal } = useFinanceStore();

  const [title, setTitle] = useState('');
  const [targetAmountRupees, setTargetAmountRupees] = useState('60000');
  const [currentAmountRupees, setCurrentAmountRupees] = useState('12000');
  const [targetDate, setTargetDate] = useState('2027-10-15');
  const [category, setCategory] = useState<SavingsGoal['category']>('gadget');
  const [priority, setPriority] = useState<SavingsGoal['priority']>('medium');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setTargetAmountRupees((goalToEdit.targetAmountMinor / 100).toString());
      setCurrentAmountRupees((goalToEdit.currentAmountMinor / 100).toString());
      setTargetDate(goalToEdit.targetDate);
      setCategory(goalToEdit.category);
      setPriority(goalToEdit.priority || 'medium');
      setNotes(goalToEdit.notes || '');
    } else {
      setTitle('');
      setTargetAmountRupees('50000');
      setCurrentAmountRupees('5000');
      setTargetDate('2027-12-31');
      setCategory('emergency');
      setPriority('medium');
      setNotes('');
    }
    setError(null);
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const targetMinor = Math.round((parseFloat(targetAmountRupees) || 0) * 100);
  const currentMinor = Math.round((parseFloat(currentAmountRupees) || 0) * 100);
  const monthsRemaining = calculateMonthsRemaining(targetDate);
  const recommendedMonthlyMinor = calculateRequiredMonthlyContribution(targetMinor, currentMinor, monthsRemaining);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required.');
      return;
    }
    if (targetMinor <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }
    if (currentMinor < 0) {
      setError('Current saved amount cannot be negative.');
      return;
    }
    if (!targetDate) {
      setError('Target date is required.');
      return;
    }

    const id = goalToEdit ? goalToEdit.id : `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    upsertGoal({
      id,
      title: title.trim(),
      targetAmountMinor: targetMinor,
      currentAmountMinor: currentMinor,
      targetDate,
      category,
      priority,
      monthlyContributionTargetMinor: recommendedMonthlyMinor,
      notes: notes.trim(),
      contributions: goalToEdit?.contributions || [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {goalToEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro M4, Emergency Fund 6M, Japan Trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Amount (₹)
              </label>
              <input
                type="number"
                min="100"
                step="any"
                value={targetAmountRupees}
                onChange={(e) => setTargetAmountRupees(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Already Saved (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={currentAmountRupees}
                onChange={(e) => setCurrentAmountRupees(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="emergency">Emergency Fund</option>
                <option value="gadget">Tech & Gadgets</option>
                <option value="vacation">Travel & Vacation</option>
                <option value="education">Education & Courses</option>
                <option value="vehicle">Vehicle / Automobile</option>
                <option value="retirement">Retirement Nest Egg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Recommended Monthly
              </label>
              <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                {formatINR(recommendedMonthlyMinor)} / mo
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Milestone Notes (Optional)
            </label>
            <textarea
              placeholder="e.g. Save ₹5,000 monthly from freelance bonus to upgrade developer workstation."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors"
            >
              {goalToEdit ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

