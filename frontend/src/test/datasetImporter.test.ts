import { describe, it, expect } from 'vitest';
import {
  parseIBMDatasetCSV,
  parseDollarToInrMinor,
  resolveMccToCategory,
  generateRecordFingerprint,
  mapIBMRecordsToTransactions,
  SEEDED_IBM_TRANSACTION_RECORDS,
} from '../features/family/services/datasetImporter';
import { IBMTransactionRecord } from '../types/family';

describe('IBM Synthetic Credit Card Dataset Importer', () => {
  const sampleCSV = `User,Card,Year,Month,Day,Time,Amount,Use Chip,Merchant Name,Merchant City,Merchant State,Zip,MCC,Errors?
0,0,2023,10,15,08:30,$45.50,Swipe,Trader Joe's,Austin,TX,78701,5411,
0,0,2023,10,15,08:30,$45.50,Swipe,Trader Joe's,Austin,TX,78701,5411,
0,0,2023,10,16,12:15,$12.75,Chip,Chipotle,Austin,TX,78701,5814,
0,0,2023,10,17,19:45,$120.00,Online,Delta Air Lines,Atlanta,GA,30320,4111,
`;

  it('parses CSV records and skips header line', () => {
    const records = parseIBMDatasetCSV(sampleCSV);
    expect(records.length).toBe(4);
    expect(records[0].Amount).toBe('$45.50');
    expect(records[0].MerchantName).toBe("Trader Joe's");
    expect(records[0].MCC).toBe(5411);
  });

  it('correctly maps MCC codes to standard Expenzo category names', () => {
    expect(resolveMccToCategory(5411)).toBe('Groceries');
    expect(resolveMccToCategory(5814)).toBe('Dining');
    expect(resolveMccToCategory(4111)).toBe('Transport');
    expect(resolveMccToCategory(4814)).toBe('Utilities');
    expect(resolveMccToCategory(9999)).toBe('General');
  });

  it('deduplicates identical records using transaction fingerprinting', () => {
    const records = parseIBMDatasetCSV(sampleCSV);
    expect(records.length).toBe(4);

    // Records 0 and 1 are duplicates
    const fp0 = generateRecordFingerprint(records[0]);
    const fp1 = generateRecordFingerprint(records[1]);
    expect(fp0).toBe(fp1);

    const result = mapIBMRecordsToTransactions(records, {
      familyId: 'fam-singh-001',
      defaultAccountId: 'acc-hdfc-savings',
    });

    expect(result.success).toBe(true);
    expect(result.duplicateCount).toBe(1);
    expect(result.transactions.length).toBe(3); // 4 minus 1 duplicate = 3
  });

  it('converts dollar amounts to minor integer paise at deterministic rate (1 USD = 83 INR)', () => {
    // $10.00 * 83 INR/$ = ₹830.00 = 83,000 paise
    const minorPaise = parseDollarToInrMinor('$10.00', 83);
    expect(minorPaise).toBe(83000);

    // Negative dollar amount is normalized positively for expenses
    const negativePaise = parseDollarToInrMinor('-$25.50', 83);
    expect(negativePaise).toBe(211650); // 25.50 * 83 * 100 = 211,650
  });

  it('loads seeded representative IBM synthetic transactions with valid structure', () => {
    expect(SEEDED_IBM_TRANSACTION_RECORDS.length).toBeGreaterThan(0);

    const result = mapIBMRecordsToTransactions(SEEDED_IBM_TRANSACTION_RECORDS, {
      familyId: 'fam-singh-001',
      defaultAccountId: 'acc-hdfc-savings',
    });

    expect(result.success).toBe(true);
    expect(result.transactions.length).toBe(SEEDED_IBM_TRANSACTION_RECORDS.length);

    // Verify all transactions have integer paise amounts, valid categories, and tags
    result.transactions.forEach((tx) => {
      expect(Number.isInteger(tx.amountMinor)).toBe(true);
      expect(tx.amountMinor).toBeGreaterThan(0);
      expect(tx.type).toBe('expense');
      expect(tx.tags).toContain('ibm-dataset');
    });
  });
});
