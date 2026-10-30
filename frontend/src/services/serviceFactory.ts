import { isSupabaseConfigured } from '@/lib/supabase';
import {
  FinanceServiceContract,
  BankingServiceContract,
  InvestmentServiceContract,
  AIServiceContract,
  ReportServiceContract,
} from '@/services/contracts/finance';
import {
  mockFinanceService,
  mockBankingService,
  mockInvestmentService,
  mockAIService,
  mockReportService,
} from '@/services/mocks/mockFinanceService';
import {
  apiFinanceService,
  apiBankingService,
  apiInvestmentService,
  apiAIService,
  apiReportService,
} from '@/services/apiFinanceService';

export type BackendMode = 'supabase' | 'mock' | 'auto';

class ServiceFactory {
  private mode: BackendMode = 'auto';

  public setMode(mode: BackendMode) {
    this.mode = mode;
  }

  public getMode(): BackendMode {
    return this.mode;
  }

  public isUsingRealBackend(): boolean {
    if (this.mode === 'supabase') return true;
    if (this.mode === 'mock') return false;
    // 'auto' mode checks whether Supabase credentials are valid
    return isSupabaseConfigured;
  }

  public getFinanceService(): FinanceServiceContract {
    return this.isUsingRealBackend() ? apiFinanceService : mockFinanceService;
  }

  public getBankingService(): BankingServiceContract {
    return this.isUsingRealBackend() ? apiBankingService : mockBankingService;
  }

  public getInvestmentService(): InvestmentServiceContract {
    return this.isUsingRealBackend() ? apiInvestmentService : mockInvestmentService;
  }

  public getAIService(): AIServiceContract {
    return this.isUsingRealBackend() ? apiAIService : mockAIService;
  }

  public getReportService(): ReportServiceContract {
    return this.isUsingRealBackend() ? apiReportService : mockReportService;
  }
}

export const serviceFactory = new ServiceFactory();

