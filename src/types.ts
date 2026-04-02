export interface Stock {
  id: string;
  name: string;
  code: string;
  quantity: number;
  avgPrice: number;
  cmp?: number;
  purchaseDate: string;
  marketCap: 'Large' | 'Mid' | 'Small';
}

export interface MutualFund {
  id: string;
  name: string;
  sipAmount: number;
  totalInvested: number;
  nav?: number;
  sipDate: string;
  stepUp: number;
}

export interface PreciousMetal {
  id: string;
  type: 'Gold' | 'Silver';
  rate: number;
  holding: number;
}

export interface Income {
  id: string;
  category: string;
  amount: number;
}

export interface Business {
  id: string;
  name: string;
  investment: number;
  target: number;
  profit: number;
}

export interface FinancialData {
  stocks: Stock[];
  mutualFunds: MutualFund[];
  metals: PreciousMetal[];
  income: Income[];
  businesses: Business[];
}
