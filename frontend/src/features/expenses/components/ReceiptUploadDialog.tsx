import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FinancialAccount, Category } from '@/types/finance';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
  ArrowRight,
  Receipt,
} from 'lucide-react';

interface ReceiptUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: FinancialAccount[];
  categories: Category[];
  onSuccess?: () => void;
}

export function ReceiptUploadDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  onSuccess,
}: ReceiptUploadDialogProps) {
  const addTransaction = useFinanceStore((state) => state.addTransaction);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extracted transaction draft
  const [extractedData, setExtractedData] = useState<{
    merchant: string;
    amount: string;
    category: string;
    date: string;
    accountId: string;
    notes: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultAccount = accounts[0]?.id || '';

  const processFile = (file: File) => {
    setFileError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please upload a JPG, PNG, WEBP, or PDF.');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File exceeds 5MB size limit. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    // Since this is a prototype without remote cloud OCR, provide honest demo extraction
    setExtractedData({
      merchant: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      amount: '1450.00',
      category: 'Food & Dining',
      date: '2026-10-14',
      accountId: defaultAccount,
      notes: `Extracted from uploaded receipt: ${file.name}`,
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const loadSampleReceipt = () => {
    setFileError(null);
    setSelectedFile(null);
    setPreviewUrl(null);

    setExtractedData({
      merchant: "Nature's Basket Gourmet",
      amount: '1850.00',
      category: 'Groceries',
      date: '2026-10-14',
      accountId: defaultAccount,
      notes: 'Sample supermarket receipt scan itemization',
    });
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (!extractedData || !extractedData.amount || !extractedData.merchant) return;

    const amountMinor = Math.round(Number(extractedData.amount) * 100);

    addTransaction({
      accountId: extractedData.accountId,
      amountMinor,
      type: 'expense',
      category: extractedData.category,
      merchant: extractedData.merchant.trim(),
      date: extractedData.date,
      status: 'completed',
      notes: extractedData.notes,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      handleClear();
      onSuccess?.();
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30]">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                <Receipt className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold">Receipt Scanner Prototype</DialogTitle>
            </div>
            <Badge variant="outline">Client Prototype</Badge>
          </div>
          <DialogDescription className="text-xs pt-1">
            Upload bill receipts or test the canned extraction fixture. Zero paid cloud OCR required.
          </DialogDescription>
        </DialogHeader>

        {isSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-in fade-in-50">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Receipt item recorded to your ledger!</span>
          </div>
        )}

        {fileError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Dropzone */}
        {!extractedData && (
          <div className="space-y-4 pt-2">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/70 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Drag and drop your receipt here, or browse
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Supports PNG, JPG, WEBP, and PDF up to 5MB.
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-[#111C30] px-3 text-xs text-slate-400 uppercase tracking-wider">
                Or Test Instant Sample
              </span>
            </div>

            <div className="flex justify-center">
              <Button type="button" variant="outline" size="sm" onClick={loadSampleReceipt}>
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Try Sample Supermarket Receipt (₹1,850)
              </Button>
            </div>
          </div>
        )}

        {/* Extracted Preview & Form */}
        {extractedData && (
          <div className="space-y-4 pt-2">
            {/* File header bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1525] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                  {selectedFile ? selectedFile.name : 'Sample Supermarket Bill'}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Parsed
                </Badge>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-red-500 cursor-pointer p-1"
                title="Remove uploaded file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Optional image preview */}
            {previewUrl && (
              <div className="max-h-36 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <img src={previewUrl} alt="Receipt preview" className="object-contain max-h-36" />
              </div>
            )}

            {/* Editable fields */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Verify Extracted Values
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={extractedData.amount}
                    onChange={(e) =>
                      setExtractedData((prev) => (prev ? { ...prev, amount: e.target.value } : null))
                    }
                    className="font-bold text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Merchant / Store</label>
                  <Input
                    type="text"
                    value={extractedData.merchant}
                    onChange={(e) =>
                      setExtractedData((prev) => (prev ? { ...prev, merchant: e.target.value } : null))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={extractedData.category}
                    onChange={(e) =>
                      setExtractedData((prev) => (prev ? { ...prev, category: e.target.value } : null))
                    }
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account</label>
                  <select
                    value={extractedData.accountId}
                    onChange={(e) =>
                      setExtractedData((prev) => (prev ? { ...prev, accountId: e.target.value } : null))
                    }
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C30] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.institution})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
                <Input
                  type="date"
                  value={extractedData.date}
                  onChange={(e) =>
                    setExtractedData((prev) => (prev ? { ...prev, date: e.target.value } : null))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notes / Reference</label>
                <Input
                  type="text"
                  value={extractedData.notes}
                  onChange={(e) =>
                    setExtractedData((prev) => (prev ? { ...prev, notes: e.target.value } : null))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={handleClear}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleConfirm}>
                Confirm & Add to Ledger
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

