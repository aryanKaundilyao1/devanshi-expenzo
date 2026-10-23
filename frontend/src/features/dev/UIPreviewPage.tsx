import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { CurrencyDisplay } from '@/components/finance/CurrencyDisplay';
import { FinancialMetricCard } from '@/components/finance/FinancialMetricCard';
import { TransactionAmount } from '@/components/finance/TransactionAmount';
import { PercentageChange } from '@/components/finance/PercentageChange';
import { BudgetProgressBar } from '@/components/finance/BudgetProgressBar';
import { FinancialStatusBadge } from '@/components/finance/FinancialStatusBadge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useUIStore } from '@/store/useUIStore';
import { Wallet, TrendingUp, Sparkles, Building2, Sun, Moon, RotateCcw } from 'lucide-react';

export function UIPreviewPage() {
  const { theme, toggleTheme } = useUIStore();
  const store = useFinanceStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success">Developer Preview Tool</Badge>
            <Badge variant="outline">Phase 1 Complete</Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            EXPENZO Design System & Primitives
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual verification suite for reusable fintech components, theme tokens, and financial calculators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4 mr-1.5 text-amber-400" /> : <Moon className="h-4 w-4 mr-1.5" />}
            Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
          <Button variant="danger" size="sm" onClick={store.resetToDemo}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset Demo Data
          </Button>
        </div>
      </div>

      {/* Financial Metric Cards Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">1. Financial Metric Cards & KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialMetricCard
            title="Total Liquid Cash"
            amountMinor={store.getTotalLiquidCash()}
            changePercent={4.2}
            subtitle="vs. last month"
            icon={Wallet}
            badge="Healthy"
          />
          <FinancialMetricCard
            title="October Inflow"
            amountMinor={store.getPeriodIncome()}
            changePercent={1.5}
            subtitle="Salary & returns"
            icon={Building2}
          />
          <FinancialMetricCard
            title="October Outflow"
            amountMinor={store.getPeriodExpenses()}
            changePercent={-2.8}
            subtitle="Spent across 5 categories"
            icon={Wallet}
          />
          <FinancialMetricCard
            title="Portfolio Value"
            amountMinor={store.getPortfolioValue()}
            changePercent={8.97}
            subtitle="TCS & INFY holdings"
            icon={TrendingUp}
            badge="Positive"
          />
        </div>
      </section>

      {/* Financial Formatting Components */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">2. Currency & Transaction Formatting</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase">CurrencyDisplay Examples:</span>
              <div className="space-y-1 text-sm">
                <div>Standard: <CurrencyDisplay minor={5000000} /></div>
                <div>With Paise: <CurrencyDisplay minor={12540050} options={{ showPaise: true }} /></div>
                <div>Negative: <CurrencyDisplay minor={-50000} /></div>
                <div>Compact Lakhs: <CurrencyDisplay minor={15500000} options={{ compact: true }} /></div>
                <div>Compact Crores: <CurrencyDisplay minor={1250000000} options={{ compact: true }} /></div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase">Transaction Amounts:</span>
              <div className="space-y-1 text-sm">
                <div>Income (+): <TransactionAmount minor={5200000} type="income" /></div>
                <div>Expense (−): <TransactionAmount minor={1200000} type="expense" /></div>
                <div>Transfer: <TransactionAmount minor={500000} type="transfer" /></div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase">Percentage Changes:</span>
              <div className="space-y-1 text-sm">
                <div>Positive Gain: <PercentageChange valuePercent={12.45} /></div>
                <div>Negative Loss: <PercentageChange valuePercent={-3.18} /></div>
                <div>Flat / Neutral: <PercentageChange valuePercent={0.0} /></div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Budget Progress Bars */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">3. Multi-State Budget Progress Bars</h2>
        <Card className="p-6 space-y-4">
          <BudgetProgressBar
            category="Food & Dining (Healthy < 80%)"
            spentMinor={280000}
            allocatedMinor={600000}
          />
          <BudgetProgressBar
            category="Housing & Rent (Warning >= 80%)"
            spentMinor={1200000}
            allocatedMinor={1500000}
          />
          <BudgetProgressBar
            category="Shopping (Exceeded >= 100%)"
            spentMinor={450000}
            allocatedMinor={400000}
          />
        </Card>
      </section>

      {/* Buttons & UI Controls */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">4. Buttons & Interaction States</h2>
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Destructive Action</Button>
            <Button variant="primary" isLoading>Loading State</Button>
            <Button variant="primary" disabled>Disabled State</Button>
          </div>
        </Card>
      </section>

      {/* Badges & Status Indicators */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">5. Badges & Financial Status Tags</h2>
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Default Neutral</Badge>
            <Badge variant="success">Success / Verified</Badge>
            <Badge variant="warning">Warning / Threshold</Badge>
            <Badge variant="danger">Critical Alert</Badge>
            <Badge variant="info">AI Generated</Badge>
            <Badge variant="outline">Outline Badge</Badge>
            <FinancialStatusBadge status="completed" />
            <FinancialStatusBadge status="pending" />
            <FinancialStatusBadge status="flagged" />
          </div>
        </Card>
      </section>

      {/* Form Fields & Dialog */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">6. Form Inputs & Accessible Dialogs</h2>
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Demo Transaction Description" placeholder="e.g. Star Cafe Espresso" />
            <Input label="Amount (₹)" placeholder="500" error="Must be a valid positive amount" />
          </div>

          <div className="pt-2">
            <Button onClick={() => setDialogOpen(true)}>
              Test Accessible Dialog
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Financial Operation</DialogTitle>
                  <DialogDescription>
                    This is a demo confirmation modal with keyboard trap and ESC key dismissal.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-xs text-slate-500">
                  Transfers debit source account and credit target account atomically in the local store.
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setDialogOpen(false)}>
                    Confirm Transfer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">7. Tab Panels</h2>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview Panel</TabsTrigger>
            <TabsTrigger value="analytics">Analytics Panel</TabsTrigger>
            <TabsTrigger value="history">Historical Log</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card className="p-4 text-xs text-slate-600 dark:text-slate-300">
              Overview tab content rendering cleanly with zero layout shift.
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            <Card className="p-4 text-xs text-slate-600 dark:text-slate-300">
              Analytics tab content with financial breakdowns.
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card className="p-4 text-xs text-slate-600 dark:text-slate-300">
              Historical ledger records container.
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

