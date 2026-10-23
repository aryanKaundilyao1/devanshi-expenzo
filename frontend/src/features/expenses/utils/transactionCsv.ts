import { Transaction, FinancialAccount } from '@/types/finance';

/**
 * Sanitizes cell values to prevent spreadsheet formula injection attacks (=, +, -, @)
 */
function sanitizeCsvValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  let str = String(val).trim();

  // Guard against CSV formula execution in Excel/Sheets
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

export function exportTransactionsToCsv(
  transactions: Transaction[],
  accounts: FinancialAccount[],
  exportDate = '2026-10-15'
): void {
  const accountMap = new Map<string, string>();
  accounts.forEach((acc) => {
    accountMap.set(acc.id, `${acc.name} (${acc.institution})`);
  });

  const headers = [
    'Transaction ID',
    'Date',
    'Type',
    'Description / Merchant',
    'Category',
    'Account',
    'Amount (INR)',
    'Status',
    'Notes',
  ];

  const rows = transactions.map((tx) => {
    const accName = accountMap.get(tx.accountId) || tx.accountId;
    const formattedAmount = (tx.amountMinor / 100).toFixed(2);

    return [
      sanitizeCsvValue(tx.id),
      sanitizeCsvValue(tx.date),
      sanitizeCsvValue(tx.type.toUpperCase()),
      sanitizeCsvValue(tx.merchant),
      sanitizeCsvValue(tx.category),
      sanitizeCsvValue(accName),
      sanitizeCsvValue(formattedAmount),
      sanitizeCsvValue(tx.status.toUpperCase()),
      sanitizeCsvValue(tx.notes || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(blob) : 'mock-blob-url';

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `expenzo_transactions_export_${exportDate}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}
