import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useFinanceStore } from '@/store/useFinanceStore';
import {
  calculatePortfolioMetrics,
  calculateAssetAllocation,
  calculateSectorAllocation,
  calculateHoldingsDetailed,
  calculateDiversificationRisk,
} from '@/features/investments/utils/investmentCalculations';
import { STOCK_CATALOG } from '@/features/investments/data/stockCatalog';
import { InvestmentsPage } from '@/features/investments/pages/InvestmentsPage';
import { HoldingsPage } from '@/features/investments/pages/HoldingsPage';
import { StockDiscoverPage } from '@/features/investments/pages/StockDiscoverPage';
import { StockDetailPage } from '@/features/investments/pages/StockDetailPage';
import { WatchlistsPage } from '@/features/investments/pages/WatchlistsPage';
import { PortfolioAnalyticsPage } from '@/features/investments/pages/PortfolioAnalyticsPage';

describe('Phase 7A: Investments, Stocks, Watchlists & Analytics', () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
  });

  it('calculates portfolio valuation, cost basis, and unrealized P&L accurately', () => {
    const { holdings, quotes } = useFinanceStore.getState();

    // Default seed has:
    // TCS: 10 shares @ buy ₹3,200 (₹32,000), CMP ₹3,500 (₹35,000) -> Gain +₹3,000
    // INFY: 5 shares @ buy ₹1,400 (₹7,000), CMP ₹1,500 (₹7,500) -> Gain +₹500
    // Total Invested = ₹39,000 (3,900,000 paise)
    // Total Valuation = ₹42,500 (4,250,000 paise)
    // Unrealized Gain = +₹3,500 (350,000 paise)
    // Unrealized Return % = (3,500 / 39,000) * 100 = 8.974%

    const metrics = calculatePortfolioMetrics(holdings, quotes);
    expect(metrics.totalInvestedMinor).toBe(3900000);
    expect(metrics.totalValueMinor).toBe(4250000);
    expect(metrics.unrealizedGainLossMinor).toBe(350000);
    expect(metrics.unrealizedReturnPercent).toBeCloseTo(8.97, 1);
    expect(metrics.holdingsCount).toBe(2);
  });

  it('performs Holdings CRUD operations in the store', () => {
    const store = useFinanceStore.getState();
    const initialCount = store.holdings.length;

    // 1. Add holding
    const newHolding = store.addHolding({
      ticker: 'HDFCBANK',
      companyName: 'HDFC Bank Ltd',
      assetClass: 'equity',
      quantity: 10,
      averageBuyPriceMinor: 170000, // ₹1,700
    });

    const afterAdd = useFinanceStore.getState().holdings;
    expect(afterAdd.length).toBe(initialCount + 1);
    expect(afterAdd.find((h) => h.ticker === 'HDFCBANK')).toBeDefined();

    // 2. Update holding
    store.updateHolding({
      ...newHolding,
      quantity: 20,
    });
    const afterUpdate = useFinanceStore.getState().holdings;
    const updated = afterUpdate.find((h) => h.id === newHolding.id);
    expect(updated?.quantity).toBe(20);

    // 3. Delete holding
    store.deleteHolding(newHolding.id);
    const afterDelete = useFinanceStore.getState().holdings;
    expect(afterDelete.length).toBe(initialCount);
    expect(afterDelete.find((h) => h.id === newHolding.id)).toBeUndefined();
  });

  it('calculates asset and sector allocations correctly', () => {
    const { holdings, quotes } = useFinanceStore.getState();

    const assetAllocation = calculateAssetAllocation(holdings, quotes);
    expect(assetAllocation.length).toBeGreaterThan(0);
    expect(assetAllocation[0].assetClass).toBe('equity');
    expect(assetAllocation[0].percent).toBe(100);

    const sectorAllocation = calculateSectorAllocation(holdings, quotes);
    expect(sectorAllocation.length).toBeGreaterThan(0);
    // TCS and INFY are both Information Technology
    expect(sectorAllocation[0].sector).toBe('Information Technology');
    expect(sectorAllocation[0].percent).toBe(100);
  });

  it('assesses diversification risk and highlights concentration', () => {
    const { holdings, quotes } = useFinanceStore.getState();
    const risk = calculateDiversificationRisk(holdings, quotes);

    // TCS is ₹35,000 out of ₹42,500 = 82.35% of portfolio -> Highly concentrated
    expect(risk.scoreText).toBe('Highly Concentrated');
    expect(risk.topHoldingTicker).toBe('TCS');
    expect(risk.topHoldingWeight).toBeGreaterThan(80);
  });

  it('manages Watchlists (create, add ticker, prevent duplicates, delete)', () => {
    const store = useFinanceStore.getState();

    // 1. Create watchlist
    const wl = store.createWatchlist('Growth Stocks', 'High conviction growth');
    expect(wl.name).toBe('Growth Stocks');
    expect(useFinanceStore.getState().watchlists.some((w) => w.id === wl.id)).toBe(true);

    // 2. Add ticker
    const addedFirst = store.addTickerToWatchlist(wl.id, 'RELIANCE');
    expect(addedFirst).toBe(true);
    expect(useFinanceStore.getState().watchlists.find((w) => w.id === wl.id)?.tickers).toContain('RELIANCE');

    // 3. Prevent duplicate ticker
    const addedDuplicate = store.addTickerToWatchlist(wl.id, 'RELIANCE');
    expect(addedDuplicate).toBe(false);

    // 4. Remove ticker
    store.removeTickerFromWatchlist(wl.id, 'RELIANCE');
    expect(useFinanceStore.getState().watchlists.find((w) => w.id === wl.id)?.tickers).not.toContain('RELIANCE');

    // 5. Delete watchlist - verify holdings are unaffected
    const holdingsCountBefore = useFinanceStore.getState().holdings.length;
    store.deleteWatchlist(wl.id);
    expect(useFinanceStore.getState().watchlists.some((w) => w.id === wl.id)).toBe(false);
    expect(useFinanceStore.getState().holdings.length).toBe(holdingsCountBefore);
  });

  it('renders Investments Overview page with KPIs and actions', () => {
    render(
      <MemoryRouter>
        <InvestmentsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Investment Portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio Value/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Invested/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Unrealized P&L/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Holdings Breakdown/i)).toBeInTheDocument();
    expect(screen.getAllByText('TCS').length).toBeGreaterThan(0);
  });

  it('renders Holdings ledger with full table and add position trigger', () => {
    render(
      <MemoryRouter>
        <HoldingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Portfolio Holdings Ledger/i)).toBeInTheDocument();
    expect(screen.getAllByText('TCS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('INFY').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText(/Search by company or ticker/i)).toBeInTheDocument();
  });

  it('renders Stock Discovery page and allows searching by company name', () => {
    render(
      <MemoryRouter>
        <StockDiscoverPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Stock & Market Discovery/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Search company or ticker/i);

    // Search for Sun Pharma
    fireEvent.change(searchInput, { target: { value: 'Sun Pharma' } });
    expect(screen.getByText('SUNPHARMA')).toBeInTheDocument();
  });

  it('renders Stock Detail page with price and metrics for valid symbol', () => {
    render(
      <MemoryRouter initialEntries={['/app/investments/stocks/TCS']}>
        <Routes>
          <Route path="/app/investments/stocks/:symbol" element={<StockDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('TCS')).toBeInTheDocument();
    expect(screen.getByText('Tata Consultancy Services Ltd')).toBeInTheDocument();
    expect(screen.getByText(/Key Fundamentals/i)).toBeInTheDocument();
    expect(screen.getByText(/Price Progression \(TCS\)/i)).toBeInTheDocument();
  });

  it('renders Stock Detail not-found state for unknown symbol', () => {
    render(
      <MemoryRouter initialEntries={['/app/investments/stocks/UNKNOWN_CO']}>
        <Routes>
          <Route path="/app/investments/stocks/:symbol" element={<StockDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Instrument Not Found/i)).toBeInTheDocument();
  });

  it('renders Portfolio Analytics page with diversification scores', () => {
    render(
      <MemoryRouter>
        <PortfolioAnalyticsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Portfolio Analytics & Risk Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio Diversification Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Sector Exposure Breakdown/i)).toBeInTheDocument();
  });
});
