import { InvestmentHolding, StockQuote } from '@/types/finance';

export interface PortfolioMetrics {
  totalValueMinor: number;
  totalInvestedMinor: number;
  unrealizedGainLossMinor: number;
  unrealizedReturnPercent: number;
  dayChangeMinor: number;
  dayChangePercent: number;
  holdingsCount: number;
}

export interface DetailedHolding extends InvestmentHolding {
  currentPriceMinor: number;
  currentValueMinor: number;
  investedValueMinor: number;
  unrealizedGainMinor: number;
  returnPercent: number;
  dayChangeMinor: number;
  dayChangePercent: number;
  portfolioWeightPercent: number;
  sector: string;
  exchange: 'NSE' | 'BSE';
}

export interface AssetAllocationItem {
  assetClass: string;
  label: string;
  valueMinor: number;
  percent: number;
  color: string;
}

export interface SectorAllocationItem {
  sector: string;
  valueMinor: number;
  percent: number;
}

export interface DiversificationAssessment {
  scoreText: 'Well Diversified' | 'Moderately Concentrated' | 'Highly Concentrated' | 'Empty';
  scoreBadgeClass: string;
  topHoldingTicker: string | null;
  topHoldingWeight: number;
  topSectorName: string | null;
  topSectorWeight: number;
  observation: string;
}

const ASSET_CLASS_LABELS: Record<string, { label: string; color: string }> = {
  equity: { label: 'Equity / Stocks', color: '#10B981' },
  mutual_fund: { label: 'Mutual Funds', color: '#3B82F6' },
  etf: { label: 'Index ETFs', color: '#8B5CF6' },
  gold: { label: 'Digital Gold / SGB', color: '#F59E0B' },
  bond: { label: 'Government Bonds', color: '#EC4899' },
};

export function calculatePortfolioMetrics(
  holdings: InvestmentHolding[],
  quotes: Record<string, StockQuote>
): PortfolioMetrics {
  if (!holdings || holdings.length === 0) {
    return {
      totalValueMinor: 0,
      totalInvestedMinor: 0,
      unrealizedGainLossMinor: 0,
      unrealizedReturnPercent: 0,
      dayChangeMinor: 0,
      dayChangePercent: 0,
      holdingsCount: 0,
    };
  }

  let totalValueMinor = 0;
  let totalInvestedMinor = 0;
  let dayChangeMinor = 0;

  for (const h of holdings) {
    const quote = quotes[h.ticker];
    const currentPrice = quote ? quote.currentPriceMinor : h.averageBuyPriceMinor;
    const dayChange = quote ? quote.dayChangeMinor : 0;

    totalValueMinor += h.quantity * currentPrice;
    totalInvestedMinor += h.quantity * h.averageBuyPriceMinor;
    dayChangeMinor += h.quantity * dayChange;
  }

  const unrealizedGainLossMinor = totalValueMinor - totalInvestedMinor;
  const unrealizedReturnPercent =
    totalInvestedMinor > 0 ? (unrealizedGainLossMinor / totalInvestedMinor) * 100 : 0;

  const previousDayTotal = totalValueMinor - dayChangeMinor;
  const dayChangePercent =
    previousDayTotal > 0 ? (dayChangeMinor / previousDayTotal) * 100 : 0;

  return {
    totalValueMinor,
    totalInvestedMinor,
    unrealizedGainLossMinor,
    unrealizedReturnPercent,
    dayChangeMinor,
    dayChangePercent,
    holdingsCount: holdings.length,
  };
}

export function calculateHoldingsDetailed(
  holdings: InvestmentHolding[],
  quotes: Record<string, StockQuote>
): DetailedHolding[] {
  const metrics = calculatePortfolioMetrics(holdings, quotes);
  const totalVal = metrics.totalValueMinor;

  return holdings.map((h) => {
    const quote = quotes[h.ticker];
    const currentPriceMinor = quote ? quote.currentPriceMinor : h.averageBuyPriceMinor;
    const investedValueMinor = h.quantity * h.averageBuyPriceMinor;
    const currentValueMinor = h.quantity * currentPriceMinor;
    const unrealizedGainMinor = currentValueMinor - investedValueMinor;
    const returnPercent =
      investedValueMinor > 0 ? (unrealizedGainMinor / investedValueMinor) * 100 : 0;
    const dayChangeMinor = quote ? h.quantity * quote.dayChangeMinor : 0;
    const dayChangePercent = quote ? quote.dayChangePercent : 0;
    const portfolioWeightPercent = totalVal > 0 ? (currentValueMinor / totalVal) * 100 : 0;

    return {
      ...h,
      currentPriceMinor,
      currentValueMinor,
      investedValueMinor,
      unrealizedGainMinor,
      returnPercent,
      dayChangeMinor,
      dayChangePercent,
      portfolioWeightPercent,
      sector: quote?.sector || 'Diversified',
      exchange: quote?.exchange || 'NSE',
    };
  });
}

export function calculateAssetAllocation(
  holdings: InvestmentHolding[],
  quotes: Record<string, StockQuote>
): AssetAllocationItem[] {
  const detailed = calculateHoldingsDetailed(holdings, quotes);
  const totalVal = detailed.reduce((sum, h) => sum + h.currentValueMinor, 0);

  if (totalVal === 0) return [];

  const map = new Map<string, number>();
  for (const h of detailed) {
    const key = h.assetClass || 'equity';
    map.set(key, (map.get(key) || 0) + h.currentValueMinor);
  }

  return Array.from(map.entries()).map(([assetClass, valueMinor]) => {
    const meta = ASSET_CLASS_LABELS[assetClass] || { label: assetClass, color: '#64748B' };
    return {
      assetClass,
      label: meta.label,
      valueMinor,
      percent: (valueMinor / totalVal) * 100,
      color: meta.color,
    };
  });
}

export function calculateSectorAllocation(
  holdings: InvestmentHolding[],
  quotes: Record<string, StockQuote>
): SectorAllocationItem[] {
  const detailed = calculateHoldingsDetailed(holdings, quotes);
  const totalVal = detailed.reduce((sum, h) => sum + h.currentValueMinor, 0);

  if (totalVal === 0) return [];

  const map = new Map<string, number>();
  for (const h of detailed) {
    const key = h.sector || 'Uncategorized';
    map.set(key, (map.get(key) || 0) + h.currentValueMinor);
  }

  return Array.from(map.entries())
    .map(([sector, valueMinor]) => ({
      sector,
      valueMinor,
      percent: (valueMinor / totalVal) * 100,
    }))
    .sort((a, b) => b.valueMinor - a.valueMinor);
}

export function calculateDiversificationRisk(
  holdings: InvestmentHolding[],
  quotes: Record<string, StockQuote>
): DiversificationAssessment {
  if (!holdings || holdings.length === 0) {
    return {
      scoreText: 'Empty',
      scoreBadgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      topHoldingTicker: null,
      topHoldingWeight: 0,
      topSectorName: null,
      topSectorWeight: 0,
      observation: 'No investment positions currently tracked. Add holdings to analyze portfolio risk.',
    };
  }

  const detailed = calculateHoldingsDetailed(holdings, quotes);
  const sectors = calculateSectorAllocation(holdings, quotes);

  // Sort by currentValueMinor descending
  const sortedHoldings = [...detailed].sort((a, b) => b.currentValueMinor - a.currentValueMinor);
  const topHolding = sortedHoldings[0];
  const topSector = sectors[0];

  const topHoldingWeight = topHolding ? topHolding.portfolioWeightPercent : 0;
  const topSectorWeight = topSector ? topSector.percent : 0;

  if (topHoldingWeight > 50 || topSectorWeight > 65) {
    return {
      scoreText: 'Highly Concentrated',
      scoreBadgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
      topHoldingTicker: topHolding?.ticker || null,
      topHoldingWeight,
      topSectorName: topSector?.sector || null,
      topSectorWeight,
      observation: `High concentration risk: ${topHolding?.ticker || 'Single stock'} constitutes ${topHoldingWeight.toFixed(1)}% of your equity portfolio. Consider diversifying across other sectors to mitigate single-stock volatility.`,
    };
  }

  if (topHoldingWeight > 30 || topSectorWeight > 45) {
    return {
      scoreText: 'Moderately Concentrated',
      scoreBadgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400',
      topHoldingTicker: topHolding?.ticker || null,
      topHoldingWeight,
      topSectorName: topSector?.sector || null,
      topSectorWeight,
      observation: `Moderate concentration in ${topSector?.sector || 'leading sector'} (${topSectorWeight.toFixed(1)}%). Consider balancing with defensive sectors or index funds.`,
    };
  }

  return {
    scoreText: 'Well Diversified',
    scoreBadgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
    topHoldingTicker: topHolding?.ticker || null,
    topHoldingWeight,
    topSectorName: topSector?.sector || null,
    topSectorWeight,
    observation: `Healthy portfolio diversification. No individual position exceeds 30% of total capital.`,
  };
}

