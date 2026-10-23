import { StockQuote } from '@/types/finance';

function generateHistory(basePriceMinor: number, volatility: number = 0.02) {
  // Generate deterministic dates from 2025-10-15 to 2026-10-15
  const dates = [
    '2025-10-15', '2025-11-15', '2025-12-15',
    '2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15',
    '2026-05-15', '2026-06-15', '2026-07-15', '2026-08-15', '2026-09-15',
    // Recent 1 month points
    '2026-09-20', '2026-09-25', '2026-09-30',
    // Recent 2 weeks
    '2026-10-01', '2026-10-03', '2026-10-05', '2026-10-08',
    '2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15'
  ];

  let current = Math.round(basePriceMinor * 0.88);
  return dates.map((date, idx) => {
    // Deterministic pseudo-random drift
    const factor = 1 + (Math.sin(idx * 1.7) * volatility) + (idx / dates.length) * 0.12;
    const priceMinor = idx === dates.length - 1 ? basePriceMinor : Math.round(current * factor);
    return { date, priceMinor };
  });
}

export const STOCK_CATALOG: Record<string, StockQuote> = {
  TCS: {
    ticker: 'TCS',
    companyName: 'Tata Consultancy Services Ltd',
    exchange: 'NSE',
    currentPriceMinor: 350000, // ₹3,500.00
    dayChangeMinor: 4500, // +₹45.00
    dayChangePercent: 1.3,
    marketCap: '₹12.8 Lakh Cr',
    peRatio: 28.4,
    week52HighMinor: 420000,
    week52LowMinor: 310000,
    sector: 'Information Technology',
    companyOverview:
      'Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai. It is a part of the Tata Group and operates in 150 locations across 46 countries.',
    historicalPrices: generateHistory(350000, 0.015),
  },
  INFY: {
    ticker: 'INFY',
    companyName: 'Infosys Ltd',
    exchange: 'NSE',
    currentPriceMinor: 150000, // ₹1,500.00
    dayChangeMinor: -1200, // -₹12.00
    dayChangePercent: -0.79,
    marketCap: '₹6.2 Lakh Cr',
    peRatio: 24.1,
    week52HighMinor: 195000,
    week52LowMinor: 138000,
    sector: 'Information Technology',
    companyOverview:
      'Infosys Limited is an Indian multinational information technology company providing business consulting, information technology and outsourcing services based in Bengaluru.',
    historicalPrices: generateHistory(150000, 0.02),
  },
  WIPRO: {
    ticker: 'WIPRO',
    companyName: 'Wipro Limited',
    exchange: 'NSE',
    currentPriceMinor: 48500, // ₹485.00
    dayChangeMinor: 650, // +₹6.50
    dayChangePercent: 1.36,
    marketCap: '₹2.5 Lakh Cr',
    peRatio: 21.2,
    week52HighMinor: 58000,
    week52LowMinor: 42000,
    sector: 'Information Technology',
    companyOverview:
      'Wipro Limited is a leading technology services and consulting company focused on building innovative solutions that address clients’ most complex digital transformation needs.',
    historicalPrices: generateHistory(48500, 0.018),
  },
  HDFCBANK: {
    ticker: 'HDFCBANK',
    companyName: 'HDFC Bank Ltd',
    exchange: 'NSE',
    currentPriceMinor: 172000, // ₹1,720.00
    dayChangeMinor: 1800, // +₹18.00
    dayChangePercent: 1.05,
    marketCap: '₹13.1 Lakh Cr',
    peRatio: 19.5,
    week52HighMinor: 180000,
    week52LowMinor: 142000,
    sector: 'Financial Services',
    companyOverview:
      'HDFC Bank Limited is India’s largest private sector bank by assets and world’s tenth largest bank by market capitalization as of 2024, offering retail and corporate banking.',
    historicalPrices: generateHistory(172000, 0.012),
  },
  ICICIBANK: {
    ticker: 'ICICIBANK',
    companyName: 'ICICI Bank Ltd',
    exchange: 'NSE',
    currentPriceMinor: 124500, // ₹1,245.00
    dayChangeMinor: 850, // +₹8.50
    dayChangePercent: 0.69,
    marketCap: '₹8.7 Lakh Cr',
    peRatio: 18.2,
    week52HighMinor: 132000,
    week52LowMinor: 98000,
    sector: 'Financial Services',
    companyOverview:
      'ICICI Bank is a premier Indian multinational financial services company offering a wide range of banking products and financial services through diverse delivery channels.',
    historicalPrices: generateHistory(124500, 0.014),
  },
  SBIN: {
    ticker: 'SBIN',
    companyName: 'State Bank of India',
    exchange: 'NSE',
    currentPriceMinor: 81000, // ₹810.00
    dayChangeMinor: -600, // -₹6.00
    dayChangePercent: -0.74,
    marketCap: '₹7.2 Lakh Cr',
    peRatio: 11.4,
    week52HighMinor: 91200,
    week52LowMinor: 58000,
    sector: 'Financial Services',
    companyOverview:
      'State Bank of India is an Indian multinational public sector bank and financial services statutory body headquartered in Mumbai. It is the 48th largest bank in the world by total assets.',
    historicalPrices: generateHistory(81000, 0.022),
  },
  TATAMOTORS: {
    ticker: 'TATAMOTORS',
    companyName: 'Tata Motors Ltd',
    exchange: 'NSE',
    currentPriceMinor: 92000, // ₹920.00
    dayChangeMinor: 1400, // +₹14.00
    dayChangePercent: 1.55,
    marketCap: '₹3.4 Lakh Cr',
    peRatio: 16.8,
    week52HighMinor: 117900,
    week52LowMinor: 62000,
    sector: 'Automotive',
    companyOverview:
      'Tata Motors Group is a global automobile manufacturer of cars, utility vehicles, pick-ups, trucks and buses, including luxury brands Jaguar and Land Rover.',
    historicalPrices: generateHistory(92000, 0.025),
  },
  MARUTI: {
    ticker: 'MARUTI',
    companyName: 'Maruti Suzuki India Ltd',
    exchange: 'NSE',
    currentPriceMinor: 1260000, // ₹12,600.00
    dayChangeMinor: -4500, // -₹45.00
    dayChangePercent: -0.36,
    marketCap: '₹3.9 Lakh Cr',
    peRatio: 28.9,
    week52HighMinor: 1368000,
    week52LowMinor: 975000,
    sector: 'Automotive',
    companyOverview:
      'Maruti Suzuki India Limited is an Indian subsidiary of Japanese automotive manufacturer Suzuki Motor Corporation, holding the market leadership in India’s passenger car segment.',
    historicalPrices: generateHistory(1260000, 0.016),
  },
  SUNPHARMA: {
    ticker: 'SUNPHARMA',
    companyName: 'Sun Pharmaceutical Industries Ltd',
    exchange: 'NSE',
    currentPriceMinor: 184000, // ₹1,840.00
    dayChangeMinor: 2200, // +₹22.00
    dayChangePercent: 1.21,
    marketCap: '₹4.4 Lakh Cr',
    peRatio: 36.1,
    week52HighMinor: 196000,
    week52LowMinor: 110000,
    sector: 'Healthcare',
    companyOverview:
      'Sun Pharmaceutical Industries is India’s largest pharmaceutical company and fourth largest specialty generic pharmaceutical company in the world, serving 100+ countries.',
    historicalPrices: generateHistory(184000, 0.015),
  },
  CIPLA: {
    ticker: 'CIPLA',
    companyName: 'Cipla Ltd',
    exchange: 'NSE',
    currentPriceMinor: 154000, // ₹1,540.00
    dayChangeMinor: 750, // +₹7.50
    dayChangePercent: 0.49,
    marketCap: '₹1.2 Lakh Cr',
    peRatio: 27.5,
    week52HighMinor: 170000,
    week52LowMinor: 114000,
    sector: 'Healthcare',
    companyOverview:
      'Cipla Limited is an Indian multinational pharmaceutical and biotechnology company headquartered in Mumbai, dedicated to accessible and affordable patient care.',
    historicalPrices: generateHistory(154000, 0.017),
  },
  HINDUNILVR: {
    ticker: 'HINDUNILVR',
    companyName: 'Hindustan Unilever Ltd',
    exchange: 'NSE',
    currentPriceMinor: 265000, // ₹2,650.00
    dayChangeMinor: -1100, // -₹11.00
    dayChangePercent: -0.41,
    marketCap: '₹6.2 Lakh Cr',
    peRatio: 58.4,
    week52HighMinor: 303000,
    week52LowMinor: 217000,
    sector: 'Consumer Goods',
    companyOverview:
      'Hindustan Unilever Limited is India’s largest fast-moving consumer goods company with a 90-year heritage in India, touching 9 out of 10 households.',
    historicalPrices: generateHistory(265000, 0.011),
  },
  ITC: {
    ticker: 'ITC',
    companyName: 'ITC Limited',
    exchange: 'NSE',
    currentPriceMinor: 49000, // ₹490.00
    dayChangeMinor: 300, // +₹3.00
    dayChangePercent: 0.62,
    marketCap: '₹6.1 Lakh Cr',
    peRatio: 29.8,
    week52HighMinor: 52800,
    week52LowMinor: 39900,
    sector: 'Consumer Goods',
    companyOverview:
      'ITC is one of India’s foremost private sector companies with diversified businesses spanning FMCG, Hotels, Paperboards & Packaging, Agri Business and Information Technology.',
    historicalPrices: generateHistory(49000, 0.012),
  },
  RELIANCE: {
    ticker: 'RELIANCE',
    companyName: 'Reliance Industries Ltd',
    exchange: 'BSE',
    currentPriceMinor: 298000, // ₹2,980.00
    dayChangeMinor: 3200, // +₹32.00
    dayChangePercent: 1.08,
    marketCap: '₹20.1 Lakh Cr',
    peRatio: 26.3,
    week52HighMinor: 321700,
    week52LowMinor: 222000,
    sector: 'Energy & Conglomerate',
    companyOverview:
      'Reliance Industries Limited is an Indian multinational conglomerate company, headquartered in Mumbai. Its businesses comprise energy, petrochemicals, natural gas, retail, telecommunications, and digital services.',
    historicalPrices: generateHistory(298000, 0.015),
  },
  LT: {
    ticker: 'LT',
    companyName: 'Larsen & Toubro Ltd',
    exchange: 'NSE',
    currentPriceMinor: 362000, // ₹3,620.00
    dayChangeMinor: -2100, // -₹21.00
    dayChangePercent: -0.58,
    marketCap: '₹4.9 Lakh Cr',
    peRatio: 33.2,
    week52HighMinor: 394000,
    week52LowMinor: 288000,
    sector: 'Infrastructure & Capital Goods',
    companyOverview:
      'Larsen & Toubro is an Indian multinational conglomerate involved in EPC projects, hi-tech manufacturing and services, operating over 50 countries.',
    historicalPrices: generateHistory(362000, 0.018),
  },
  TITAN: {
    ticker: 'TITAN',
    companyName: 'Titan Company Ltd',
    exchange: 'NSE',
    currentPriceMinor: 345000, // ₹3,450.00
    dayChangeMinor: 2500, // +₹25.00
    dayChangePercent: 0.73,
    marketCap: '₹3.1 Lakh Cr',
    peRatio: 82.5,
    week52HighMinor: 388600,
    week52LowMinor: 305000,
    sector: 'Consumer Goods',
    companyOverview:
      'Titan Company Limited is an Indian luxury fashion company that mainly manufactures fashion accessories such as jewellery, watches and eyewear, part of the Tata Group.',
    historicalPrices: generateHistory(345000, 0.019),
  },
};

