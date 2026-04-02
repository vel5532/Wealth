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
  Target
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
import { cn } from './lib/utils';
import { Stock, MutualFund, PreciousMetal, Income, Business, FinancialData } from './types';

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
    { id: '2', name: 'Mirae Asset Large Cap', sipAmount: 3000, totalInvested: 85000, nav: 110.2, sipDate: '5th', stepUp: 500 },
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
  ]
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<FinancialData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const updateMetalRate = (id: string, newRate: number) => {
    setData(prev => ({
      ...prev,
      metals: prev.metals.map(m => m.id === id ? { ...m, rate: newRate } : m)
    }));
  };

  const addStock = (newStock: Stock) => {
    setData(prev => ({
      ...prev,
      stocks: [...prev.stocks, newStock]
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
    // In a real app, this would fetch from Google Sheets and Yahoo Finance
    // Simulate CMP updates
    setData(prev => ({
      ...prev,
      stocks: prev.stocks.map(s => ({
        ...s,
        cmp: s.cmp ? s.cmp * (1 + (Math.random() * 0.02 - 0.01)) : s.avgPrice
      }))
    }));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const totals = useMemo(() => {
    const equityInvested = data.stocks.reduce((acc, s) => acc + (s.quantity * s.avgPrice), 0);
    const equityCurrent = data.stocks.reduce((acc, s) => acc + (s.quantity * (s.cmp || s.avgPrice)), 0);
    
    const mfInvested = data.mutualFunds.reduce((acc, mf) => acc + mf.totalInvested, 0);
    // Simple current value calculation for MF (mock)
    const mfCurrent = mfInvested * 1.15; 

    const goldValue = data.metals.filter(m => m.type === 'Gold').reduce((acc, m) => acc + (m.rate * m.holding), 0);
    const silverValue = data.metals.filter(m => m.type === 'Silver').reduce((acc, m) => acc + (m.rate * m.holding), 0);
    
    const totalIncome = data.income.reduce((acc, i) => acc + i.amount, 0);
    
    const netWorth = equityCurrent + mfCurrent + goldValue + silverValue;

    return {
      equityInvested,
      equityCurrent,
      mfInvested,
      mfCurrent,
      goldValue,
      silverValue,
      totalIncome,
      netWorth
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
          <NavItem active={activeTab === 'income'} onClick={() => setActiveTab('income')} icon={<Briefcase size={20} />} label="Income" />
          <NavItem active={activeTab === 'projection'} onClick={() => setActiveTab('projection')} icon={<LineChart size={20} />} label="Projection" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 pb-24 lg:pb-8 p-4 lg:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white capitalize">{activeTab}</h2>
            <p className="text-gray-400 text-sm">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <button 
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={cn(isLoading && "animate-spin")} />
            Refresh Data
          </button>
        </header>

        {activeTab === 'dashboard' && <DashboardView totals={totals} chartData={chartData} data={data} />}
        {activeTab === 'stocks' && <StocksView stocks={data.stocks} onAddStock={addStock} />}
        {activeTab === 'mf' && <MutualFundsView funds={data.mutualFunds} />}
        {activeTab === 'gold' && <MetalsView metals={data.metals} onUpdateRate={updateMetalRate} />}
        {activeTab === 'income' && <IncomeView income={data.income} businesses={data.businesses} />}
        {activeTab === 'projection' && <ProjectionView netWorth={totals.netWorth} monthlySavings={totals.totalIncome * 0.4} />}
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

function DashboardView({ totals, chartData, data }: { totals: any, chartData: any[], data: FinancialData }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Net Worth" value={totals.netWorth} icon={<Wallet className="text-emerald-500" />} trend="+12.5%" />
        <SummaryCard title="Equity Value" value={totals.equityCurrent} icon={<TrendingUp className="text-blue-500" />} trend="+8.2%" />
        <SummaryCard title="MF Value" value={totals.mfCurrent} icon={<PieChartIcon className="text-amber-500" />} trend="+15.1%" />
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
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
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
            {data.income.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-gray-400">{item.category}</span>
                </div>
                <span className="font-medium">₹{item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-800 flex justify-between font-bold text-white">
              <span>Total</span>
              <span>₹{totals.totalIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800 hover:border-emerald-500/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-white">₹{value.toLocaleString()}</h4>
    </div>
  );
}

function StocksView({ stocks, onAddStock }: { stocks: Stock[], onAddStock: (s: Stock) => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStock, setNewStock] = useState<Partial<Stock>>({ marketCap: 'Large' });

  const totals = stocks.reduce((acc, s) => {
    const invested = s.quantity * s.avgPrice;
    const current = s.quantity * (s.cmp || s.avgPrice);
    return {
      invested: acc.invested + invested,
      current: acc.current + current,
    };
  }, { invested: 0, current: 0 });

  const capWise = stocks.reduce((acc, s) => {
    const current = s.quantity * (s.cmp || s.avgPrice);
    acc[s.marketCap] = (acc[s.marketCap] || 0) + current;
    return acc;
  }, {} as Record<string, number>);

  const profit = totals.current - totals.invested;
  const profitPct = (profit / totals.invested) * 100;

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

function MutualFundsView({ funds }: { funds: MutualFund[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {funds.map(fund => (
          <div key={fund.id} className="bg-[#141414] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PieChartIcon size={80} />
            </div>
            <h4 className="text-lg font-bold text-white mb-4">{fund.name}</h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase">Monthly SIP</p>
                <p className="text-xl font-bold">₹{fund.sipAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase">Total Invested</p>
                <p className="text-xl font-bold">₹{fund.totalInvested.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase">SIP Date</p>
                <p className="text-gray-200 font-medium">{fund.sipDate}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1 uppercase">Step-up</p>
                <p className="text-emerald-500 font-medium">+{fund.stepUp}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <span className="text-sm text-gray-400">Current NAV: ₹{fund.nav}</span>
              <button className="text-emerald-500 text-sm font-medium flex items-center gap-1 hover:underline">
                View Details <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
        <button className="border-2 border-dashed border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-emerald-500/50 hover:text-emerald-500 transition-all">
          <Plus size={32} />
          <span className="font-medium">Add New Fund</span>
        </button>
      </div>
    </div>
  );
}

function MetalsView({ metals, onUpdateRate }: { metals: PreciousMetal[], onUpdateRate: (id: string, rate: number) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metals.map(metal => (
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
                <p className="text-2xl font-bold text-emerald-500">₹{(metal.rate * metal.holding).toLocaleString()}</p>
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

function IncomeView({ income, businesses }: { income: Income[], businesses: Business[] }) {
  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-semibold mb-6">Monthly Income Streams</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {income.map(item => (
            <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">{item.category}</p>
              <h4 className="text-xl font-bold text-white">₹{item.amount.toLocaleString()}</h4>
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
          {businesses.map(biz => {
            const progress = (biz.profit / biz.target) * 100;
            return (
              <div key={biz.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="font-bold text-white">{biz.name}</h4>
                    <p className="text-gray-400 text-xs">Investment: ₹{biz.investment.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500 font-bold">₹{biz.profit.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">Target: ₹{biz.target.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", progress >= 100 ? "bg-emerald-500" : "bg-blue-500")} 
                    style={{ width: `${Math.min(progress, 100)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold">
                  <span>Achievement</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProjectionView({ netWorth, monthlySavings }: { netWorth: number, monthlySavings: number }) {
  const [growthRate, setGrowthRate] = useState(12);
  const [years, setYears] = useState(30);

  const projectionData = useMemo(() => {
    let currentWealth = netWorth;
    const data = [];
    const annualSavings = monthlySavings * 12;

    for (let i = 0; i <= years; i++) {
      data.push({
        year: new Date().getFullYear() + i,
        wealth: Math.round(currentWealth),
        milestone: currentWealth >= 1000000000 ? '100Cr' : currentWealth >= 100000000 ? '10Cr' : currentWealth >= 10000000 ? '1Cr' : null
      });
      currentWealth = (currentWealth + annualSavings) * (1 + growthRate / 100);
    }
    return data;
  }, [netWorth, monthlySavings, growthRate, years]);

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
