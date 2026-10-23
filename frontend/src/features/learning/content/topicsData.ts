import { LearningTopic } from '@/types/finance';

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    slug: 'personal-budgeting',
    title: 'Personal Budgeting & The 50/30/20 Rule',
    category: 'budgeting',
    level: 'Beginner',
    readingTimeMinutes: 5,
    summary:
      'Learn how to structure your monthly salary into Needs, Wants, and Savings using the proven 50/30/20 framework.',
    keyTakeaways: [
      'Allocate 50% of net post-tax income to non-negotiable living essentials (rent, groceries, utilities).',
      'Cap discretionary lifestyle spending (dining out, entertainment, shopping) at 30%.',
      'Direct at least 20% toward automated savings, debt clearance, and investments before spending.',
    ],
    contentSections: [
      {
        heading: 'Why Every Professional Needs a Cashflow System',
        body: 'Budgeting is not about deprivation; it is about intentional allocation. Without a deliberate budget, discretionary expenses unconsciously expand to match your total earnings (Parkinson’s Law). A structured cashflow system guarantees that your future self is funded first before monthly bills deplete your liquidity.',
        example:
          'If your monthly in-hand salary is ₹60,000, the 50/30/20 framework designates ₹30,000 for rent and essentials, ₹18,000 for dining and hobbies, and ₹12,000 for emergency savings and mutual fund SIPs.',
      },
      {
        heading: 'The Three Buckets Explained',
        body: '1. Needs (50%): Expenses required for survival and baseline obligations: house rent, basic groceries, electricity bills, term insurance, and minimum debt payments.\n2. Wants (30%): Upgrades and lifestyle conveniences: weekend dining, Netflix subscriptions, apparel, and vacations.\n3. Savings & Investments (20%): Wealth-building capital: emergency fund buffer, index fund SIPs, PPF, and NPS contributions.',
      },
      {
        heading: 'Common Budgeting Traps',
        body: 'Treating lifestyle upgrades as essentials is the most common cause of budget overruns. For example, buying a new luxury phone on zero-cost EMI adds fixed contractual debt that crowds out your 20% investment bucket.',
      },
    ],
    glossary: [
      { term: 'Net Income', definition: 'Take-home pay after tax deductions (TDS) and provident fund contributions.' },
      { term: 'Zero-Based Budgeting', definition: 'An accounting approach where every single rupee is assigned a job (Expenses + Savings = Income).' },
      { term: 'Discretionary Outflow', definition: 'Expenses that can be eliminated or postponed without harming physical well-being.' },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Under the 50/30/20 rule, what percentage of monthly income should ideally be directed to savings and investments?',
        options: [
          { id: 'a', text: '10%', isCorrect: false, explanation: '10% is below the recommended benchmark for long-term financial security.' },
          { id: 'b', text: '20%', isCorrect: true, explanation: 'Correct! At least 20% should be automatically earmarked for emergency reserves and investments.' },
          { id: 'c', text: '50%', isCorrect: false, explanation: '50% is allocated for essential living needs.' },
          { id: 'd', text: '30%', isCorrect: false, explanation: '30% is allocated to discretionary lifestyle wants.' },
        ],
      },
      {
        id: 'q2',
        question: 'Which of the following is classified as a "Need" under baseline budgeting rules?',
        options: [
          { id: 'a', text: 'Fine-dining weekend dinners', isCorrect: false, explanation: 'Dining out is a discretionary lifestyle want.' },
          { id: 'b', text: 'Apartment rent and basic utilities', isCorrect: true, explanation: 'Correct! Rent and essential utilities are necessary living obligations.' },
          { id: 'c', text: 'Streaming video subscriptions', isCorrect: false, explanation: 'Streaming media is an entertainment want.' },
          { id: 'd', text: 'Annual international leisure travel', isCorrect: false, explanation: 'Vacations belong in the lifestyle wants bucket.' },
        ],
      },
    ],
  },
  {
    slug: 'emergency-funds',
    title: 'Emergency Funds & Liquidity Buffers',
    category: 'savings',
    level: 'Beginner',
    readingTimeMinutes: 6,
    summary:
      'Why keeping 3 to 6 months of non-negotiable living expenses in safe, liquid instruments protects you from financial ruin.',
    keyTakeaways: [
      'An emergency fund protects your investments from forced liquidation during job loss or health crises.',
      'Target 3 to 6 months of mandatory living expenses, or 6 to 12 months for single-income households.',
      'Never invest your emergency fund in volatile stocks or lock it in long-term illiquid assets.',
    ],
    contentSections: [
      {
        heading: 'The Safety Net Principle',
        body: 'Unexpected life disruptions—such as sudden medical emergencies, vehicle repairs, or job transitions—will happen. Without cash liquidity, individuals are forced to either borrow at high interest rates (credit cards, personal loans) or panic-sell equities during market crashes. An emergency fund is financial insurance, not an investment intended to maximize returns.',
        example:
          'If your monthly essential expenses are ₹30,000, your target emergency fund is between ₹90,000 (3 months) and ₹1,80,000 (6 months).',
      },
      {
        heading: 'Where to Park Your Emergency Fund',
        body: 'Safety and instant liquidity trump returns. Ideal instruments include:\n• High-yield bank savings accounts with sweep-in FD facilities.\n• Liquid mutual funds investing in ultra-short overnight government treasury bills.\n• High-rated bank fixed deposits with zero or low premature withdrawal penalties.',
      },
    ],
    glossary: [
      { term: 'Liquidity', definition: 'The ease and speed with which an asset can be converted into ready cash without loss of value.' },
      { term: 'Sweep-in FD', definition: 'A bank deposit facility that automatically transfers surplus savings into a term deposit while allowing instant card debits.' },
      { term: 'Runway', definition: 'The number of months you can survive comfortably without any incoming salary.' },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Where should you NOT park your core emergency fund?',
        options: [
          { id: 'a', text: 'High-rated bank savings account', isCorrect: false, explanation: 'Savings accounts offer instant accessibility.' },
          { id: 'b', text: 'Volatile high-growth equity stocks', isCorrect: true, explanation: 'Correct! Equities fluctuate violently and could decline 30% right when you need emergency cash.' },
          { id: 'c', text: 'Sweep-in fixed deposit', isCorrect: false, explanation: 'Sweep FDs provide instant liquidity and safe interest.' },
          { id: 'd', text: 'Liquid debt mutual fund', isCorrect: false, explanation: 'Liquid funds provide next-day redemption and minimal credit volatility.' },
        ],
      },
    ],
  },
  {
    slug: 'mutual-funds-and-sips',
    title: 'Mutual Funds & Systematic Investment Plans (SIPs)',
    category: 'investing',
    level: 'Intermediate',
    readingTimeMinutes: 7,
    summary:
      'Harness professional portfolio management, rupee-cost averaging, and long-term equity growth with automated SIPs.',
    keyTakeaways: [
      'A mutual fund pools capital from thousands of investors to purchase a diversified basket of stocks or bonds.',
      'A SIP (Systematic Investment Plan) automates investing a fixed rupee amount every month, removing emotional market timing.',
      'Rupee-cost averaging buys more units when market prices drop and fewer units when prices peak.',
    ],
    contentSections: [
      {
        heading: 'Demystifying Mutual Funds',
        body: 'Instead of spending hours researching hundreds of individual company balance sheets, a mutual fund allows you to purchase units managed by regulated Asset Management Companies (AMCs) and SEBI-registered fund managers. By holding 40 to 60 equities across various sectors, single-stock failure risk is vastly diluted.',
      },
      {
        heading: 'The Power of Rupee-Cost Averaging',
        body: 'Attempting to predict market peaks and valleys is statistically futile for retail investors. With an automated monthly SIP, your fixed instalment automatically buys more units during market corrections and fewer units during rallies, guaranteeing an attractive average purchase cost over multi-year cycles.',
        example:
          'If you invest ₹5,000 monthly: in Month 1 (NAV ₹100), you acquire 50 units. In Month 2, the market dips (NAV ₹50), and you acquire 100 units. Your blended average cost drops to ₹66.67 per unit.',
      },
    ],
    glossary: [
      { term: 'NAV (Net Asset Value)', definition: 'The per-unit market value of a mutual fund scheme calculated daily after market hours.' },
      { term: 'Expense Ratio (TER)', definition: 'The annual percentage fee charged by the AMC to manage fund administration and fund manager salaries.' },
      { term: 'Direct Plan', definition: 'Investing directly with the fund house without distributor commission deductions, earning higher net returns.' },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the primary benefit of rupee-cost averaging via an automated monthly SIP?',
        options: [
          { id: 'a', text: 'It guarantees that the stock market will never decline', isCorrect: false, explanation: 'Mutual funds remain subject to market movements.' },
          { id: 'b', text: 'It automatically buys more units when prices fall and fewer when prices rise', isCorrect: true, explanation: 'Correct! Fixed monthly sums purchase more volume at market discounts, lowering overall unit cost basis.' },
          { id: 'c', text: 'It eliminates all taxes on capital gains', isCorrect: false, explanation: 'Capital gains taxes still apply upon redemption.' },
          { id: 'd', text: 'It guarantees a fixed 20% return each year', isCorrect: false, explanation: 'Equity investments cannot legally guarantee fixed returns.' },
        ],
      },
    ],
  },
  {
    slug: 'index-funds-and-etfs',
    title: 'Index Funds & Exchange-Traded Funds (ETFs)',
    category: 'investing',
    level: 'Intermediate',
    readingTimeMinutes: 6,
    summary:
      'Low-cost passive investing: why tracking the NIFTY 50 index beats the majority of active fund managers over 10-year horizons.',
    keyTakeaways: [
      'Index funds and ETFs passively replicate a benchmark index like the NIFTY 50 or S&P BSE Sensex.',
      'They feature ultra-low expense ratios (often 0.05% to 0.20% vs 1.50%+ for actively managed funds).',
      'ETFs trade in real time on stock exchanges, while index funds are purchased at end-of-day NAV.',
    ],
    contentSections: [
      {
        heading: 'Active vs Passive Investing',
        body: 'Active mutual fund managers try to "beat the market" by hand-picking winners and timing entries. Over extended 10 to 15-year horizons, SPIVA studies consistently show that over 75% of active equity funds underperform their benchmark index after deducting their high management fees. Passive index funds accept the benchmark market return at minimal cost.',
      },
    ],
    glossary: [
      { term: 'Tracking Error', definition: 'The percentage divergence between the performance of an index fund and the benchmark index it replicates.' },
      { term: 'Passive Management', definition: 'An investment approach mirroring a market index without discretionary stock-picking.' },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Why do index funds generally have much lower expense ratios than active mutual funds?',
        options: [
          { id: 'a', text: 'Because they do not pay expensive research teams to pick and trade individual stocks', isCorrect: true, explanation: 'Correct! Rules-based replication drastically reduces administrative overhead.' },
          { id: 'b', text: 'Because they are subsidized by the government', isCorrect: false, explanation: 'Index funds are not government subsidized.' },
          { id: 'c', text: 'Because they only hold cash', isCorrect: false, explanation: 'Index funds hold the constituent equities of the index.' },
        ],
      },
    ],
  },
  {
    slug: 'power-of-compounding',
    title: 'The Mathematics & Power of Compound Interest',
    category: 'savings',
    level: 'Beginner',
    readingTimeMinutes: 5,
    summary:
      'Albert Einstein called it the eighth wonder of the world: understand how exponential time in the market turns modest savings into vast wealth.',
    keyTakeaways: [
      'Simple interest earns returns only on initial principal; compound interest earns returns on accumulated interest.',
      'Time in the market is vastly more powerful than timing the market.',
      'The "Rule of 72" estimates the years required to double your capital: 72 divided by annual return rate.',
    ],
    contentSections: [
      {
        heading: 'How Compounding Explodes Exponentially',
        body: 'During the first 5 years of an investment journey, compounding feels deceptively slow. However, by year 15 and 20, the annual interest generated by your portfolio exceeds your total original salary contributions. Starting early—even with ₹2,000 monthly—yields vastly larger fortunes than waiting until age 35 to invest ₹10,000 monthly.',
        example:
          'Investing ₹5,000/month at 12% p.a.: In 10 years, corpus is ₹11.6 Lakhs. In 20 years, it grows to ₹49.9 Lakhs. In 30 years, it skyrockets to ₹1.76 Crores!',
      },
    ],
    glossary: [
      { term: 'Rule of 72', definition: '72 / Annual Interest Rate = Years required to double investment principal.' },
      { term: 'CAGR', definition: 'Compound Annual Growth Rate—the smoothed geometric annual return of an investment over multiple years.' },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Using the Rule of 72, approximately how many years will it take for your investment to double at a 12% annual return?',
        options: [
          { id: 'a', text: '6 years', isCorrect: true, explanation: 'Correct! 72 / 12 = 6 years.' },
          { id: 'b', text: '12 years', isCorrect: false, explanation: '72 / 12 is 6 years, not 12.' },
          { id: 'c', text: '8 years', isCorrect: false, explanation: '72 / 8 would equal 9% return.' },
        ],
      },
    ],
  },
  {
    slug: 'inflation-and-real-returns',
    title: 'Inflation, Purchasing Power & Real Returns',
    category: 'investing',
    level: 'Intermediate',
    readingTimeMinutes: 6,
    summary:
      'Why keeping all your money in savings accounts or cash guarantees silent wealth erosion: calculating real returns after inflation.',
    keyTakeaways: [
      'Inflation is the invisible tax that diminishes what a rupee can buy year after year.',
      'Real Return = Nominal Interest Rate minus Prevailing Inflation Rate.',
      'Equities and gold are historical hedges that produce positive real returns above inflation.',
    ],
    contentSections: [
      {
        heading: 'The Silent Wealth Killer',
        body: 'If a bank savings account pays 3.5% interest while headline consumer inflation (CPI) is 6%, your purchasing power is actually shrinking by 2.5% every year. While your nominal rupee count appears to increase on your bank statement, the basket of goods you can purchase is strictly smaller.',
      },
    ],
    glossary: [
      { term: 'Nominal Return', definition: 'The raw percentage gain on an investment before accounting for inflation or taxes.' },
      { term: 'Real Return', definition: 'Net purchasing power gain: Nominal Return minus Inflation minus Taxes.' },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'If a fixed deposit pays 7% interest and inflation is 5.5%, what is your approximate real return before taxes?',
        options: [
          { id: 'a', text: '+1.5%', isCorrect: true, explanation: 'Correct! 7.0% - 5.5% = +1.5% real purchasing power gain.' },
          { id: 'b', text: '+7.0%', isCorrect: false, explanation: '7% is the nominal return ignoring inflation.' },
          { id: 'c', text: '-1.5%', isCorrect: false, explanation: 'The return exceeds inflation, so the real return is positive.' },
        ],
      },
    ],
  },
  {
    slug: 'financial-fraud-awareness',
    title: 'Financial Fraud Awareness & Digital UPI Security',
    category: 'security',
    level: 'Beginner',
    readingTimeMinutes: 5,
    summary:
      'Essential guidelines to safeguard bank accounts, prevent phishing, and avoid common UPI QR code scams.',
    keyTakeaways: [
      'You NEVER need to enter your UPI PIN to RECEIVE money.',
      'Bank officials, tech support, and law enforcement will NEVER demand your OTP or ask you to install screen-sharing software (AnyDesk, TeamViewer).',
      'Always verify bank account numbers and masked beneficiary names before confirming large transfers.',
    ],
    contentSections: [
      {
        heading: 'The Golden Rule of UPI',
        body: 'The most prevalent digital payment scam in India involves fraudsters claiming to send you refunds, lottery winnings, or marketplace payments by asking you to scan a QR code or enter your UPI PIN. Remember: entering your UPI PIN authorizes a debit from your bank account. Receiving funds requires zero authentication.',
      },
    ],
    glossary: [
      { term: 'UPI PIN', definition: 'Personal Identification Number used exclusively to authorize debits from your bank account.' },
      { term: 'Phishing', definition: 'Fraudulent communication designed to deceive individuals into revealing sensitive financial credentials.' },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'When is entering your UPI PIN required on digital payment apps (Google Pay, PhonePe, Paytm)?',
        options: [
          { id: 'a', text: 'To receive a cashback or payment credit', isCorrect: false, explanation: 'False! Receiving money never requires a PIN.' },
          { id: 'b', text: 'Only when money is being debited or transferred OUT of your bank account', isCorrect: true, explanation: 'Correct! A UPI PIN is required strictly to authorize funds leaving your account.' },
          { id: 'c', text: 'To check your Aadhaar link status', isCorrect: false, explanation: 'Aadhaar does not use your UPI PIN.' },
        ],
      },
    ],
  },
];

