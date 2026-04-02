/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Coins, 
  Wallet, 
  Briefcase, 
  LineChart,
  Plus,
  Trash2,
  RefreshCw,
  ChevronRight,
  TrendingDown,
  Target,
  Settings as SettingsIcon,
  Zap,
  ArrowUpCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { Stock, MutualFund, PreciousMetal, Income, Business, FinancialData, AppSettings, Loan } from './types';

// Persistent Settings Helper
const getStoredSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem('wealthwise_settings');
    return stored ? JSON.parse(stored) : { scriptUrl: '', sheetId: '' };
  } catch (e) {
    console.error('Error parsing stored settings:', e);
    return { scriptUrl: '', sheetId: '' };
  }
};

// Mock Data for initial state
const INITIAL_DATA: FinancialData = {
  stocks: [
    { id: '1', name: 'Reliance Industries', code: 'RELIANCE', quantity: 10, avgPrice: 2400, cmp: 2950, purchaseDate: '2023-05-15', marketCap: 'Large' },
    { id: '2', name: 'HDFC Bank', code: 'HDFCBANK', quantity: 50, avgPrice: 1550, cmp: 1450, purchaseDate: '2023-08-20', marketCap: 'Large' },
    { id: '3', name: 'TCS', code: 'TCS', quantity: 5, avgPrice: 3200, cmp: 4100, purchaseDate: '2024-01-10', marketCap: 'Large' },
    { id: '4', name: 'Tata Motors', code: 'TATAMOTORS', quantity: 20, avgPrice: 600, cmp: 950, purchaseDate: '2023-11-05', marketCap: 'Large' },
    { id: '5', name: 'Polycab', code: 'POLYCAB', quantity: 15, avgPrice: 4500, cmp: 5200, purchaseDate: '2023-12-12', marketCap: 'Mid' },
  ],
  mutualFunds: [
    { id: '1', name: 'Parag Parikh Flexi Cap', sipAmount: 5000, totalInvested: 120000, nav: 72.5, sipDate: '15th', stepUp: 10 },
    { id: '2', name: 'Mirae Asset Large Cap', sipAmount: 3000, totalInvested: 85000, nav: 110.2, sipDate: '5th', stepUp: 5 },
  ],
  metals: [
    { id: '1', type: 'Gold', rate: 6500, holding: 20 },
    { id: '2', type: 'Silver', rate: 75, holding: 500 },
  ],
  income: [
    { id: '1', category: 'Tuition', amount: 15000 },
    { id: '2', category: 'Business', amount: 45000 },
    { id: '3', category: 'School', amount: 20000 },
  ],
  businesses: [
    { id: '1', name: 'E-commerce Store', investment: 200000, target: 500000, profit: 120000 },
  ],
  loans: [
    { id: '1', name: 'Home Loan', totalAmount: 5000000, remainingAmount: 4200000, emi: 45000, interestRate: 8.5, tenureMonths: 240, startDate: '2022-01-10' },
    { id: '2', name: 'Car Loan', totalAmount: 1000000, remainingAmount: 650000, emi: 18000, interestRate: 9.2, tenureMonths: 60, startDate: '2023-05-15' },
  ]
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#141414] border border-red-500/30 p-8 rounded-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
              <p className="text-gray-400 text-sm">
                The application encountered an unexpected error. This might be due to corrupted data or a calculation overflow.
              </p>
            </div>
            <div className="bg-black/20 p-4 rounded-xl text-left overflow-auto max-h-32">
              <code className="text-xs text-red-400">{this.state.error?.message}</code>
            </div>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
            >
              Clear Data & Reset App
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <WealthWiseApp />
    </ErrorBoundary>
  );
}

function WealthWiseApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<FinancialData>(INITIAL_DATA);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('wealthwise_settings', JSON.stringify(settings));
  }, [settings]);

  const updateMetalRate = (id: string, newRate: number) => {
    setData(prev => ({
      ...prev,
      metals: (prev.metals || []).map(m => m.id === id ? { ...m, rate: newRate } : m)
    }));
  };

  const addStock = (newStock: Stock) => {
    setData(prev => ({
      ...prev,
      stocks: [...(prev.stocks || []), newStock]
    }));
  };

  const addFund = (newFund: MutualFund) => {
    setData(prev => ({
      ...prev,
      mutualFunds: [...(prev.mutualFunds || []), newFund]
    }));
  };

  const addLoan = (newLoan: Loan) => {
    setData(prev => ({
      ...prev,
      loans: [...(prev.loans || []), newLoan]
    }));
  };

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    
    if (settings.scriptUrl) {
      try {
        const response = await fetch(`${settings.scriptUrl}?action=getData&sheetId=${settings.sheetId}`);
        const result = await response.json();
        if (result.status === 'success' && result.data) {
          // Merge with INITIAL_DATA to ensure all keys exist
          setData(prev => ({
            ...INITIAL_DATA,
            ...result.data,
            // Deep merge arrays if necessary, but here we assume result.data is a full replacement
          }));
        }
      } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
      }
    } else {
      // Fallback to simulation if no script URL is provided
      setData(prev => ({
        ...prev,
        stocks: (prev?.stocks || INITIAL_DATA.stocks).map(s => ({
          ...s,
          cmp: (s.cmp || s.avgPrice) * (1 + (Math.random() * 0.02 - 0.01))
        }))
      }));
    }
    
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const totals = useMemo(() => {
    const stocks = data?.stocks ?? INITIAL_DATA.stocks;
    const mutualFunds = data?.mutualFunds ?? INITIAL_DATA.mutualFunds;
    const metals = data?.metals ?? INITIAL_DATA.metals;
    const income = data?.income ?? INITIAL_DATA.income;
    const loans = data?.loans ?? INITIAL_DATA.loans;

    const equityInvested = stocks.reduce((acc, s) => acc + (Number(s.quantity || 0) * Number(s.avgPrice || 0)), 0);
    const equityCurrent = stocks.reduce((acc, s) => acc + (Number(s.quantity || 0) * Number(s.cmp || s.avgPrice || 0)), 0);
    
    const mfInvested = mutualFunds.reduce((acc, mf) => acc + Number(mf.totalInvested || 0), 0);
    const mfCurrent = mfInvested * 1.15; 

    const goldValue = metals.filter(m => m.type === 'Gold').reduce((acc, m) => acc + (Number(m.rate || 0) * Number(m.holding || 0)), 0);
    const silverValue = metals.filter(m => m.type === 'Silver').reduce((acc, m) => acc + (Number(m.rate || 0) * Number(m.holding || 0)), 0);
    
    const totalIncome = income.reduce((acc, i) => acc + Number(i.amount || 0), 0);
    const totalSIP = mutualFunds.reduce((acc, mf) => acc + Number(mf.sipAmount || 0), 0);
    
    const totalLoanLiability = loans.reduce((acc, l) => acc + Number(l.remainingAmount || 0), 0);
    const totalLoanEMI = loans.reduce((acc, l) => acc + Number(l.emi || 0), 0);

    const netWorth = (equityCurrent + mfCurrent + goldValue + silverValue) - totalLoanLiability;

    return {
      equityInvested: isFinite(equityInvested) ? equityInvested : 0,
      equityCurrent: isFinite(equityCurrent) ? equityCurrent : 0,
      mfInvested: isFinite(mfInvested) ? mfInvested : 0,
      mfCurrent: isFinite(mfCurrent) ? mfCurrent : 0,
      goldValue: isFinite(goldValue) ? goldValue : 0,
      silverValue: isFinite(silverValue) ? silverValue : 0,
      totalIncome: isFinite(totalIncome) ? totalIncome : 0,
      totalSIP: isFinite(totalSIP) ? totalSIP : 0,
      totalLoanLiability: isFinite(totalLoanLiability) ? totalLoanLiability : 0,
      totalLoanEMI: isFinite(totalLoanEMI) ? totalLoanEMI : 0,
      netWorth: isFinite(netWorth) ? netWorth : 0
    };
  }, [data]);

  const chartData = [
    { name: 'Equity', value: totals.equityCurrent },
    { name: 'Mutual Funds', value: totals.mfCurrent },
    { name: 'Gold', value: totals.goldValue },
    { name: 'Silver', value: totals.silverValue },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:top-0 lg:bottom-0 lg:w-64 bg-[#141414] border-t lg:border-t-0 lg:border-r border-gray-800 z-50">
        <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-800">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">WealthWise</h1>
        </div>
        
        <div className="flex lg:flex-col justify-around lg:justify-start p-2 lg:p-4 gap-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem active={activeTab === 'stocks'} onClick={() => setActiveTab('stocks')} icon={<TrendingUp size={20} />} label="Stocks" />
          <NavItem active={activeTab === 'mf'} onClick={() => setActiveTab('mf')} icon={<PieChartIcon size={20} />} label="Mutual Funds" />
          <NavItem active={activeTab === 'gold'} onClick={() => setActiveTab('gold')} icon={<Coins size={20} />} label="Metals" />
          <NavItem active={activeTab === 'loans'} onClick={() => setActiveTab('loans')} icon={<Wallet className="text-red-400" size={20} />} label="Loans" />
          <NavItem active={activeTab === 'income'} onClick={() => setActiveTab('income')} icon={<Briefcase size={20} />} label="Income" />
          <NavItem active={activeTab === 'sip-consolidated'} onClick={() => setActiveTab('sip-consolidated')} icon={<Zap size={20} />} label="SIP Tracker" />
          <NavItem active={activeTab === 'projection'} onClick={() => setActiveTab('projection')} icon={<LineChart size={20} />} label="Projection" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20} />} label="Settings" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 pb-24 lg:pb-8 p-4 lg:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="hidden md:flex w-12 h-12 bg-emerald-500/10 rounded-2xl items-center justify-center border border-emerald-500/20">
              <RefreshCw className={cn("text-emerald-500 w-6 h-6", isLoading && "animate-spin")} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white capitalize tracking-tight">{activeTab}</h2>
                {!isLoading && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/20">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <p className="text-gray-400 text-sm font-medium">
                  {isLoading ? (
                    <span className="flex items-center gap-2 text-blue-400">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                      Syncing with Google Sheets...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-500">Last synced:</span>
                      <span className="text-gray-300">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={refreshData}
            disabled={isLoading}
            className="group relative flex items-center gap-3 px-6 py-3 bg-[#141414] border border-gray-800 text-gray-300 rounded-2xl hover:border-emerald-500/50 hover:text-white transition-all disabled:opacity-50 active:scale-95 overflow-hidden"
          >
            <div className={cn(
              "absolute inset-0 bg-emerald-500/5 translate-y-full transition-transform duration-300 group-hover:translate-y-0",
              isLoading && "translate-y-0"
            )} />
            <RefreshCw size={20} className={cn("relative z-10 transition-transform duration-700", isLoading && "animate-spin")} />
            <span className="relative z-10 font-bold text-sm">Refresh Data</span>
          </button>
        </header>

        {activeTab === 'dashboard' && <DashboardView totals={totals} chartData={chartData} data={data} />}
        {activeTab === 'stocks' && <StocksView stocks={data.stocks} onAddStock={addStock} />}
        {activeTab === 'mf' && <MutualFundsView funds={data.mutualFunds} onAddFund={addFund} />}
        {activeTab === 'gold' && <MetalsView metals={data.metals} onUpdateRate={updateMetalRate} />}
        {activeTab === 'loans' && <LoansView loans={data.loans} onAddLoan={addLoan} />}
        {activeTab === 'income' && <IncomeView income={data.income} businesses={data.businesses} />}
        {activeTab === 'sip-consolidated' && <ConsolidatedSIPView funds={data.mutualFunds} />}
        {activeTab === 'projection' && <ProjectionView netWorth={totals.netWorth} funds={data.mutualFunds} otherSavings={totals.totalIncome * 0.4 - totals.totalSIP} />}
        {activeTab === 'settings' && <SettingsView settings={settings} onSave={setSettings} />}
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-3 py-2 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 group",
        active ? "bg-emerald-500/10 text-emerald-500" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
      )}
    >
      <span className={cn("transition-transform duration-200", active && "scale-110")}>{icon}</span>
      <span className="text-[10px] lg:text-sm font-medium">{label}</span>
    </button>
  );
}

function DashboardView({ totals, chartData = [], data }: { totals: any, chartData: any[], data: FinancialData }) {
  const safeIncome = data?.income ?? [];
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Net Worth" value={totals.netWorth} icon={<Wallet className="text-emerald-500" />} trend="+12.5%" />
        <SummaryCard title="Equity Value" value={totals.equityCurrent} icon={<TrendingUp className="text-blue-500" />} trend="+8.2%" />
        <SummaryCard title="Loan Liability" value={totals.totalLoanLiability} icon={<TrendingDown className="text-red-500" />} trend="-2.1%" />
        <SummaryCard title="Monthly Income" value={totals.totalIncome} icon={<Briefcase className="text-purple-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Allocation Chart */}
        <div className="lg:col-span-2 bg-[#141414] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-lg font-semibold mb-6">Asset Allocation</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: number) => `₹${(Number(value) || 0).toLocaleString()}`}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Performance / Stats */}
        <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-lg font-semibold mb-6">Income Distribution</h3>
          <div className="space-y-4">
            {safeIncome.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-gray-400">{item.category}</span>
                </div>
                <span className="font-medium">₹{(Number(item.amount) || 0).toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-800 flex justify-between font-bold text-white">
              <span>Total</span>
              <span>₹{(Number(totals.totalIncome) || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value = 0, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend?: string }) {
  const isNegative = title.toLowerCase().includes('loan') || title.toLowerCase().includes('liability');
  const safeValue = Number(value) || 0;
  return (
    <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800 hover:border-emerald-500/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", isNegative ? "text-red-500 bg-red-500/10" : "text-emerald-500 bg-emerald-500/10")}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <h4 className={cn("text-2xl font-bold", isNegative ? "text-red-400" : "text-white")}>₹{safeValue.toLocaleString()}</h4>
    </div>
  );
}

function StocksView({ stocks = [], onAddStock }: { stocks: Stock[], onAddStock: (s: Stock) => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStock, setNewStock] = useState<Partial<Stock>>({ marketCap: 'Large' });

  const safeStocks = Array.isArray(stocks) ? stocks : [];

  const totals = safeStocks.reduce((acc, s) => {
    const invested = Number(s.quantity || 0) * Number(s.avgPrice || 0);
    const current = Number(s.quantity || 0) * Number(s.cmp || s.avgPrice || 0);
    return {
      invested: acc.invested + invested,
      current: acc.current + current,
    };
  }, { invested: 0, current: 0 });

  const capWise = safeStocks.reduce((acc, s) => {
    const current = Number(s.quantity || 0) * Number(s.cmp || s.avgPrice || 0);
    acc[s.marketCap] = (acc[s.marketCap] || 0) + current;
    return acc;
  }, {} as Record<string, number>);

  const profit = totals.current - totals.invested;
  const profitPct = totals.invested !== 0 ? (profit / totals.invested) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStock.name && newStock.code && newStock.quantity && newStock.avgPrice && newStock.purchaseDate) {
      onAddStock({
        id: Math.random().toString(36).substr(2, 9),
        name: newStock.name,
        code: newStock.code,
        quantity: Number(newStock.quantity),
        avgPrice: Number(newStock.avgPrice),
        purchaseDate: newStock.purchaseDate,
        marketCap: newStock.marketCap as any,
        cmp: Number(newStock.avgPrice) // Initial CMP same as Avg Price
      });
      setShowAddForm(false);
      setNewStock({ marketCap: 'Large' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total Invested</p>
          <h4 className="text-xl font-bold">₹{totals.invested.toLocaleString()}</h4>
        </div>
        <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Current Value</p>
          <h4 className="text-xl font-bold">₹{totals.current.toLocaleString()}</h4>
        </div>
        <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total P&L</p>
          <h4 className={cn("text-xl font-bold", profit >= 0 ? "text-emerald-500" : "text-red-500")}>
            ₹{profit.toLocaleString()} ({profitPct.toFixed(2)}%)
          </h4>
        </div>
      </div>

      {/* Cap-wise Breakdown */}
      <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Market Cap Allocation</h3>
        <div className="grid grid-cols-3 gap-4">
          {['Large', 'Mid', 'Small'].map(cap => (
            <div key={cap} className="bg-white/5 p-4 rounded-xl">
              <p className="text-gray-400 text-xs mb-1">{cap} Cap</p>
              <p className="text-lg font-bold">₹{(capWise[cap] || 0).toLocaleString()}</p>
              <div className="mt-2 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full", 
                    cap === 'Large' ? "bg-emerald-500" : cap === 'Mid' ? "bg-blue-500" : "bg-amber-500"
                  )} 
                  style={{ width: `${(capWise[cap] || 0) / totals.current * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Holdings</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus size={18} />
          Add Stock
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#141414] p-6 rounded-2xl border border-emerald-500/30 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            placeholder="Company Name" 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            value={newStock.name || ''}
            onChange={e => setNewStock({...newStock, name: e.target.value})}
            required
          />
          <input 
            placeholder="NSE Code" 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            value={newStock.code || ''}
            onChange={e => setNewStock({...newStock, code: e.target.value})}
            required
          />
          <input 
            type="number" 
            placeholder="Quantity" 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            value={newStock.quantity || ''}
            onChange={e => setNewStock({...newStock, quantity: Number(e.target.value)})}
            required
          />
          <input 
            type="number" 
            placeholder="Avg Price" 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            value={newStock.avgPrice || ''}
            onChange={e => setNewStock({...newStock, avgPrice: Number(e.target.value)})}
            required
          />
          <input 
            type="date" 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            value={newStock.purchaseDate || ''}
            onChange={e => setNewStock({...newStock, purchaseDate: e.target.value})}
            required
          />
          <select 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            value={newStock.marketCap}
            onChange={e => setNewStock({...newStock, marketCap: e.target.value as any})}
          >
            <option value="Large">Large Cap</option>
            <option value="Mid">Mid Cap</option>
            <option value="Small">Small Cap</option>
          </select>
          <div className="md:col-span-3 flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold">Save Stock</button>
          </div>
        </form>
      )}

      <div className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Cap</th>
                <th className="px-6 py-4 font-semibold">Qty</th>
                <th className="px-6 py-4 font-semibold">Avg Price</th>
                <th className="px-6 py-4 font-semibold">CMP</th>
                <th className="px-6 py-4 font-semibold">P&L</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stocks.map(stock => {
                const invested = stock.quantity * stock.avgPrice;
                const current = stock.quantity * (stock.cmp || stock.avgPrice);
                const pnl = current - invested;
                const pnlPct = (pnl / invested) * 100;
                
                return (
                  <tr key={stock.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{stock.name}</div>
                      <div className="text-xs text-gray-500">{stock.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                        stock.marketCap === 'Large' ? "bg-emerald-500/10 text-emerald-500" :
                        stock.marketCap === 'Mid' ? "bg-blue-500/10 text-blue-500" :
                        "bg-amber-500/10 text-amber-500"
                      )}>
                        {stock.marketCap}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{stock.quantity}</td>
                    <td className="px-6 py-4 text-gray-300">₹{stock.avgPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-300">₹{stock.cmp?.toLocaleString()}</td>
                    <td className={cn("px-6 py-4 font-medium", pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                      ₹{pnl.toLocaleString()} ({pnlPct.toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{stock.purchaseDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MutualFundsView({ funds = [], onAddFund }: { funds: MutualFund[], onAddFund: (f: MutualFund) => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFund, setNewFund] = useState<Partial<MutualFund>>({ sipDate: '15th', stepUp: 10 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFund.name && newFund.sipAmount && newFund.totalInvested) {
      onAddFund({
        id: Math.random().toString(36).substr(2, 9),
        name: newFund.name,
        sipAmount: Number(newFund.sipAmount),
        totalInvested: Number(newFund.totalInvested),
        nav: Number(newFund.nav || 0),
        sipDate: newFund.sipDate || '15th',
        stepUp: Number(newFund.stepUp || 0)
      });
      setShowAddForm(false);
      setNewFund({ sipDate: '15th', stepUp: 10 });
    }
  };

  const FUND_OPTIONS = [
    "Parag Parikh Flexi Cap Fund",
    "Mirae Asset Large Cap Fund",
    "Quant Small Cap Fund",
    "HDFC Index S&P BSE Sensex Fund",
    "ICICI Prudential Bluechip Fund",
    "Axis Bluechip Fund",
    "SBI Bluechip Fund",
    "Nippon India Large Cap Fund",
    "Kotak Bluechip Fund",
    "UTI Mastershare Unit Scheme"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Mutual Funds</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus size={18} />
          Add Fund
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#141414] p-6 rounded-2xl border border-emerald-500/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Fund Name</label>
            <select 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newFund.name || ''}
              onChange={e => setNewFund({...newFund, name: e.target.value})}
              required
            >
              <option value="">Select a Fund</option>
              {FUND_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              <option value="Other">Other (Manual Entry)</option>
            </select>
          </div>

          {newFund.name === 'Other' && (
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-bold uppercase">Custom Fund Name</label>
              <input 
                placeholder="Enter Fund Name" 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                onChange={e => setNewFund({...newFund, name: e.target.value})}
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Monthly SIP Amount</label>
            <input 
              type="number" 
              placeholder="SIP Amount" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newFund.sipAmount || ''}
              onChange={e => setNewFund({...newFund, sipAmount: Number(e.target.value)})}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Total Invested Value</label>
            <input 
              type="number" 
              placeholder="Total Invested" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newFund.totalInvested || ''}
              onChange={e => setNewFund({...newFund, totalInvested: Number(e.target.value)})}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Current NAV (Optional)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="NAV" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newFund.nav || ''}
              onChange={e => setNewFund({...newFund, nav: Number(e.target.value)})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">SIP Date</label>
            <input 
              placeholder="e.g. 15th" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newFund.sipDate || ''}
              onChange={e => setNewFund({...newFund, sipDate: e.target.value})}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Step-up %</label>
            <input 
              type="number" 
              placeholder="Step-up %" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newFund.stepUp || ''}
              onChange={e => setNewFund({...newFund, stepUp: Number(e.target.value)})}
              required
            />
          </div>

          <div className="lg:col-span-3 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold">Save Fund</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(funds || []).map(fund => (
          <div key={fund.id} className="bg-[#141414] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PieChartIcon size={80} />
            </div>
            <h4 className="text-lg font-bold text-white mb-4">{fund.name}</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase">Monthly SIP</p>
                <p className="text-xl font-bold">₹{(fund.sipAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase">Total Invested</p>
                <p className="text-xl font-bold">₹{(fund.totalInvested || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase">SIP Date</p>
                <p className="text-gray-200 font-medium">{fund.sipDate}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase">Step-up</p>
                <p className="text-emerald-500 font-medium">+{(fund.stepUp || 0)}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase font-bold">10-Year Projection</span>
                <span className="text-emerald-500 font-bold">
                  ₹{Math.round(
                    Array.from<any>({ length: 10 }).reduce((acc: number, _: any, i: number) => {
                      const yearlySIP = ((fund.sipAmount || 0) * Math.pow(1 + (fund.stepUp || 0) / 100, i)) * 12;
                      const nextVal = (acc + yearlySIP) * 1.12; // Assuming 12% growth
                      return isFinite(nextVal) ? nextVal : acc;
                    }, fund.totalInvested || 0)
                  ).toLocaleString()}
                </span>
              </div>
              <button className="text-emerald-500 text-sm font-medium flex items-center gap-1 hover:underline">
                View Details <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="border-2 border-dashed border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-emerald-500/50 hover:text-emerald-500 transition-all"
          >
            <Plus size={32} />
            <span className="font-medium">Add New Fund</span>
          </button>
        )}
      </div>
    </div>
  );
}

function MetalsView({ metals = [], onUpdateRate }: { metals: PreciousMetal[], onUpdateRate: (id: string, rate: number) => void }) {
  const safeMetals = Array.isArray(metals) ? metals : [];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safeMetals.map(metal => (
          <div key={metal.id} className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  metal.type === 'Gold' ? "bg-amber-500/10 text-amber-500" : "bg-gray-400/10 text-gray-400"
                )}>
                  <Coins size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{metal.type}</h4>
                  <p className="text-gray-400 text-sm">Holding: {metal.holding} {metal.type === 'Gold' ? 'grams' : 'kg'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs mb-1 uppercase">Total Value</p>
                <p className="text-2xl font-bold text-emerald-500">₹{(Number(metal.rate || 0) * Number(metal.holding || 0)).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase font-bold">Manual Price Entry (per {metal.type === 'Gold' ? 'gram' : 'kg'})</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input 
                    type="number" 
                    value={metal.rate}
                    onChange={(e) => onUpdateRate(metal.id, Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-2 text-white focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-bold flex items-center">
                  Live
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncomeView({ income = [], businesses = [] }: { income: Income[], businesses: Business[] }) {
  const safeIncome = Array.isArray(income) ? income : [];
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];
  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-semibold mb-6">Monthly Income Streams</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safeIncome.map(item => (
            <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">{item.category}</p>
              <h4 className="text-xl font-bold text-white">₹{(Number(item.amount) || 0).toLocaleString()}</h4>
              <div className="mt-2 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '65%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-semibold mb-6">Business Performance</h3>
        <div className="space-y-6">
          {safeBusinesses.map(biz => {
            const progress = (Number(biz.profit || 0) / Number(biz.target || 1)) * 100;
            const safeProgress = isFinite(progress) ? progress : 0;
            return (
              <div key={biz.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="font-bold text-white">{biz.name}</h4>
                    <p className="text-gray-400 text-xs">Investment: ₹{(Number(biz.investment) || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500 font-bold">₹{(Number(biz.profit) || 0).toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">Target: ₹{(Number(biz.target) || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", safeProgress >= 100 ? "bg-emerald-500" : "bg-blue-500")} 
                    style={{ width: `${Math.min(safeProgress, 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold">
                  <span>Achievement</span>
                  <span>{safeProgress.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProjectionView({ netWorth = 0, funds = [], otherSavings = 0 }: { netWorth: number, funds: MutualFund[], otherSavings: number }) {
  const [growthRate, setGrowthRate] = useState(12);
  const [years, setYears] = useState(30);

  const projectionData = useMemo(() => {
    let currentWealth = netWorth;
    const data = [];
    
    // Track each fund's SIP separately to apply individual step-ups
    let currentFunds = (funds || []).map(f => ({ ...f }));

    for (let i = 0; i <= years; i++) {
      data.push({
        year: new Date().getFullYear() + i,
        wealth: Math.round(currentWealth),
        milestone: currentWealth >= 1000000000 ? '100Cr' : currentWealth >= 100000000 ? '10Cr' : currentWealth >= 10000000 ? '1Cr' : null
      });

      // Calculate annual savings for this year
      const annualSIP = currentFunds.reduce((acc, f) => acc + ((f.sipAmount || 0) * 12), 0);
      const annualOtherSavings = Math.max(0, (otherSavings || 0) * 12);
      const totalAnnualSavings = annualSIP + annualOtherSavings;

      // Apply growth and add savings
      const nextWealth = (currentWealth + totalAnnualSavings) * (1 + growthRate / 100);
      currentWealth = isFinite(nextWealth) ? nextWealth : currentWealth;

      // Safety check for Infinity
      if (!isFinite(currentWealth)) {
        currentWealth = 1e15; // Cap at a very large number
      }

      // Apply annual step-up to each fund for the NEXT year
      currentFunds = currentFunds.map(f => ({
        ...f,
        sipAmount: (f.sipAmount || 0) * (1 + (f.stepUp || 0) / 100)
      }));
    }
    return data;
  }, [netWorth, funds, otherSavings, growthRate, years]);

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">Expected Annual Growth Rate (%)</label>
            <input 
              type="range" min="1" max="30" value={growthRate} 
              onChange={(e) => setGrowthRate(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xl font-bold text-white">
              <span>{growthRate}%</span>
              <span className="text-emerald-500">Aggressive</span>
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">Projection Period (Years)</label>
            <input 
              type="range" min="5" max="50" value={years} 
              onChange={(e) => setYears(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xl font-bold text-white">
              <span>{years} Years</span>
              <span className="text-blue-500">Long Term</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => `₹${value.toLocaleString()}`}
              />
              <Area type="monotone" dataKey="wealth" stroke="#10b981" fillOpacity={1} fill="url(#colorWealth)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Year</th>
              <th className="px-6 py-4 font-semibold">Projected Wealth</th>
              <th className="px-6 py-4 font-semibold">Milestone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {projectionData.filter((_, i) => i % 5 === 0 || i === projectionData.length - 1).map(row => (
              <tr key={row.year} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{row.year}</td>
                <td className="px-6 py-4 text-gray-300">₹{row.wealth.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {row.milestone && (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      row.milestone === '100Cr' ? "bg-purple-500/20 text-purple-500" :
                      row.milestone === '10Cr' ? "bg-blue-500/20 text-blue-500" :
                      "bg-emerald-500/20 text-emerald-500"
                    )}>
                      {row.milestone} Milestone
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoansView({ loans = [], onAddLoan }: { loans: Loan[], onAddLoan: (l: Loan) => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({});

  const safeLoans = Array.isArray(loans) ? loans : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLoan.name && newLoan.totalAmount && newLoan.remainingAmount && newLoan.emi) {
      onAddLoan({
        id: Math.random().toString(36).substr(2, 9),
        name: newLoan.name,
        totalAmount: Number(newLoan.totalAmount),
        remainingAmount: Number(newLoan.remainingAmount),
        emi: Number(newLoan.emi),
        interestRate: Number(newLoan.interestRate || 0),
        tenureMonths: Number(newLoan.tenureMonths || 0),
        startDate: newLoan.startDate || new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      setNewLoan({});
    }
  };

  const totalLiability = safeLoans.reduce((acc, l) => acc + Number(l.remainingAmount || 0), 0);
  const totalEMI = safeLoans.reduce((acc, l) => acc + Number(l.emi || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
          <p className="text-red-500 text-sm font-bold uppercase mb-1">Total Loan Liability</p>
          <h4 className="text-3xl font-bold text-white">₹{totalLiability.toLocaleString()}</h4>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl">
          <p className="text-orange-500 text-sm font-bold uppercase mb-1">Total Monthly EMI</p>
          <h4 className="text-3xl font-bold text-white">₹{totalEMI.toLocaleString()}</h4>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Loans</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus size={18} />
          Add Loan
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#141414] p-6 rounded-2xl border border-red-500/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Loan Name</label>
            <input 
              placeholder="e.g. Home Loan" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newLoan.name || ''}
              onChange={e => setNewLoan({...newLoan, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Total Loan Amount</label>
            <input 
              type="number" 
              placeholder="Total Amount" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newLoan.totalAmount || ''}
              onChange={e => setNewLoan({...newLoan, totalAmount: Number(e.target.value)})}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Remaining Principal</label>
            <input 
              type="number" 
              placeholder="Remaining Principal" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newLoan.remainingAmount || ''}
              onChange={e => setNewLoan({...newLoan, remainingAmount: Number(e.target.value)})}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Monthly EMI</label>
            <input 
              type="number" 
              placeholder="EMI" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newLoan.emi || ''}
              onChange={e => setNewLoan({...newLoan, emi: Number(e.target.value)})}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Interest Rate (%)</label>
            <input 
              type="number" 
              step="0.1"
              placeholder="Interest Rate" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newLoan.interestRate || ''}
              onChange={e => setNewLoan({...newLoan, interestRate: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold uppercase">Start Date</label>
            <input 
              type="date" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              value={newLoan.startDate || ''}
              onChange={e => setNewLoan({...newLoan, startDate: e.target.value})}
            />
          </div>
          <div className="lg:col-span-3 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">Save Loan</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safeLoans.map(loan => {
          const progress = ((Number(loan.totalAmount || 0) - Number(loan.remainingAmount || 0)) / Number(loan.totalAmount || 1)) * 100;
          const safeProgress = isFinite(progress) ? progress : 0;
          return (
            <div key={loan.id} className="bg-[#141414] p-6 rounded-2xl border border-gray-800 group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-white">{loan.name}</h4>
                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                  {loan.interestRate}% Interest
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-xs mb-1 uppercase">Monthly EMI</p>
                  <p className="text-xl font-bold text-white">₹{(Number(loan.emi) || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1 uppercase">Remaining</p>
                  <p className="text-xl font-bold text-red-400">₹{(Number(loan.remainingAmount) || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 uppercase font-bold">
                  <span>Repayment Progress</span>
                  <span>{safeProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${Math.min(safeProgress, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Paid: ₹{(Number(loan.totalAmount || 0) - Number(loan.remainingAmount || 0)).toLocaleString()}</span>
                  <span>Total: ₹{(Number(loan.totalAmount) || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsView({ settings, onSave }: { settings: AppSettings, onSave: (s: AppSettings) => void }) {
  const [form, setForm] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-[#141414] p-8 rounded-2xl border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <SettingsIcon className="text-emerald-500" />
          Backend Configuration
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Google Apps Script Web App URL</label>
            <input 
              type="url" 
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
              value={form.scriptUrl}
              onChange={e => setForm({...form, scriptUrl: e.target.value})}
            />
            <p className="text-xs text-gray-500">The URL you get after deploying your Google Apps Script as a Web App.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Google Sheet ID</label>
            <input 
              type="text" 
              placeholder="1a2b3c4d5e6f7g8h9i0j..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
              value={form.sheetId}
              onChange={e => setForm({...form, sheetId: e.target.value})}
            />
            <p className="text-xs text-gray-500">Found in the URL of your Google Sheet: docs.google.com/spreadsheets/d/<b>[SHEET_ID]</b>/edit</p>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl">
        <h4 className="text-blue-400 font-bold mb-2">How to set up?</h4>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal ml-4">
          <li>Create a new Google Sheet and copy its ID from the URL.</li>
          <li>Go to Extensions &gt; Apps Script and paste the provided backend code.</li>
          <li>Deploy as a Web App (Execute as: Me, Access: Anyone).</li>
          <li>Copy the Web App URL and paste it above.</li>
          <li>Your data will now be stored and synced with your Google Sheet!</li>
        </ol>
      </div>
    </div>
  );
}

function ConsolidatedSIPView({ funds = [] }: { funds: MutualFund[] }) {
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [financialGoals, setFinancialGoals] = useState("Retire with 10Cr in 20 years, Buy a house in 5 years");

  const safeFunds = Array.isArray(funds) ? funds : [];

  const totalMonthlySIP = safeFunds.reduce((acc, f) => acc + Number(f.sipAmount || 0), 0);
  const totalInvested = safeFunds.reduce((acc, f) => acc + Number(f.totalInvested || 0), 0);

  const getAiSuggestion = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `I have the following mutual fund SIPs: ${JSON.stringify(funds.map(f => ({ name: f.name, amount: f.sipAmount, stepUp: f.stepUp })))}. 
      My total monthly SIP is ₹${totalMonthlySIP}. 
      My financial goals are: "${financialGoals}".
      
      Please provide a detailed and personalized financial suggestion for a "Step-up SIP" strategy to achieve these goals. 
      Suggest specific step-up percentages or amounts for each fund. 
      Analyze if the current SIPs are sufficient for the stated goals.
      Keep the response professional, encouraging, and formatted in clear bullet points with bold headings.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiSuggestion(response.text || "Unable to generate suggestion at this time.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiSuggestion("Failed to connect to AI service. Please check your API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
          <p className="text-emerald-500 text-sm font-bold uppercase mb-1">Total Monthly SIP</p>
          <h4 className="text-3xl font-bold text-white">₹{totalMonthlySIP.toLocaleString()}</h4>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl">
          <p className="text-blue-500 text-sm font-bold uppercase mb-1">Total MF Investment</p>
          <h4 className="text-3xl font-bold text-white">₹{totalInvested.toLocaleString()}</h4>
        </div>
      </div>

      <div className="bg-[#141414] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-semibold">SIP Consolidation Table</h3>
          <span className="text-xs text-gray-500 font-bold uppercase">{safeFunds.length} Active SIPs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Fund Name</th>
                <th className="px-6 py-4 font-semibold text-right">SIP Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Step-up</th>
                <th className="px-6 py-4 font-semibold text-center">SIP Date</th>
                <th className="px-6 py-4 font-semibold text-right">Total Invested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {safeFunds.map(fund => (
                <tr key={fund.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{fund.name}</td>
                  <td className="px-6 py-4 text-right text-emerald-500 font-bold">₹{(Number(fund.sipAmount) || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-blue-400 font-medium">+{fund.stepUp}%</td>
                  <td className="px-6 py-4 text-center text-gray-400">{fund.sipDate}</td>
                  <td className="px-6 py-4 text-right text-gray-300">₹{(Number(fund.totalInvested) || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Step-up Suggestion Section */}
      <div className="bg-[#141414] p-8 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Zap size={120} className="text-emerald-500" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowUpCircle className="text-emerald-500" />
                AI Personalized Wealth Strategy
              </h3>
              <p className="text-gray-400 text-sm">Get personalized advice based on your SIPs and financial goals.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-gray-500 font-bold uppercase">Your Financial Goals</label>
            <textarea 
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all h-24 resize-none"
              placeholder="e.g. Retire with 5Cr in 15 years, Child's education in 10 years..."
              value={financialGoals}
              onChange={e => setFinancialGoals(e.target.value)}
            />
          </div>

          <button 
            onClick={getAiSuggestion}
            disabled={isAiLoading}
            className="w-full md:w-auto px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {isAiLoading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
            {aiSuggestion ? "Regenerate Strategy" : "Generate Personalized Strategy"}
          </button>

          {aiSuggestion && (
            <div className="bg-white/5 border border-gray-800 p-6 rounded-xl text-gray-300 leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-4 duration-500">
              {aiSuggestion}
            </div>
          )}
          
          {!aiSuggestion && !isAiLoading && (
            <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-xl">
              <p className="text-gray-500">Define your goals and click the button to get AI insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
