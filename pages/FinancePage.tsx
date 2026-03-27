import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ResponsiveContainer, Tooltip, 
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { useData, Transaction } from '../DataContext.tsx';

// Mock data sets for the dynamic chart
const chartDataSets = {
  daily: [
    { date: '08:00', revenue: 1200, expenses: 800 },
    { date: '10:00', revenue: 2400, expenses: 900 },
    { date: '12:00', revenue: 3800, expenses: 1100 },
    { date: '14:00', revenue: 5200, expenses: 1200 },
    { date: '16:00', revenue: 4100, expenses: 1000 },
    { date: '18:00', revenue: 6500, expenses: 1400 },
    { date: '20:00', revenue: 7800, expenses: 1500 },
  ],
  weekly: [
    { date: 'Mon', revenue: 5200, expenses: 2800 },
    { date: 'Tue', revenue: 4800, expenses: 2400 },
    { date: 'Wed', revenue: 6100, expenses: 2900 },
    { date: 'Thu', revenue: 7200, expenses: 3100 },
    { date: 'Fri', revenue: 9400, expenses: 3800 },
    { date: 'Sat', revenue: 11500, expenses: 4200 },
    { date: 'Sun', revenue: 8900, expenses: 3400 },
  ],
  monthly: [
    { date: 'Oct 01', revenue: 4200, expenses: 2100 },
    { date: 'Oct 05', revenue: 5800, expenses: 2400 },
    { date: 'Oct 10', revenue: 5100, expenses: 2200 },
    { date: 'Oct 15', revenue: 7200, expenses: 2800 },
    { date: 'Oct 20', revenue: 6400, expenses: 2600 },
    { date: 'Oct 25', revenue: 8900, expenses: 3100 },
    { date: 'Oct 30', revenue: 9500, expenses: 3400 },
  ]
};

const sourceData = [
  { name: 'Direct', value: 45, color: '#137fec', amount: '$64,161', growth: '+5.2%', trend: 'up', icon: 'person_pin_circle' },
  { name: 'OTA', value: 30, color: '#8b5cf6', amount: '$42,774', growth: '+2.1%', trend: 'up', icon: 'travel' },
  { name: 'Corp.', value: 15, color: '#10b981', amount: '$21,387', growth: '-1.4%', trend: 'down', icon: 'business_center' },
  { name: 'Walk-in', value: 10, color: '#f59e0b', amount: '$14,258', growth: '+0.8%', trend: 'up', icon: 'directions_walk' },
];



const FinancePage: React.FC = () => {
  const { transactions: localTransactions, addTransaction, updateTransaction, guests } = useData();
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transaction Form State
  const [newTxData, setNewTxData] = useState({
    guestId: '',
    category: 'Room Revenue',
    amount: '',
    method: 'Visa •••• 0000'
  });

  const selectedTx = useMemo(() => 
    localTransactions.find(t => t.id === selectedTxId) || null
  , [selectedTxId, localTransactions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTxId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Monthly Revenue Audit exported to CSV and PDF successfully.');
    }, 2000);
  };

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    const guest = guests.find(g => g.id === newTxData.guestId) || guests[0];
    const newTx: Transaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      guest: guest,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: parseFloat(newTxData.amount),
      method: newTxData.method,
      status: 'Completed',
      category: newTxData.category
    };
    addTransaction(newTx);
    setIsModalOpen(false);
    setNewTxData({ guestId: '', category: 'Room Revenue', amount: '', method: 'Visa •••• 0000' });
  };

  const handleVoidTransaction = () => {
    if (!selectedTxId) return;
    if (confirm('Are you sure you want to void this transaction? This action will issue a full refund.')) {
      updateTransaction(selectedTxId, { status: 'Refunded' });
      alert('Transaction voided and refunded.');
    }
  };

  const stats = [
    { label: 'Total Revenue', val: '$142,580', trend: '+12.5%', icon: 'account_balance', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Operating Costs', val: '$38,240', trend: '-2.1%', icon: 'payments', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Net Profit', val: '$104,340', trend: '+18.2%', icon: 'trending_up', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending Payouts', val: `$${localTransactions.filter(t => t.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0)}`, trend: 'Active', icon: 'hourglass_empty', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            <span className="text-slate-400">Financials</span>
            <span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>
            <span className="text-primary">Revenue & Ledger</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Financial Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Real-time revenue monitoring and transaction reconciliation.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="h-12 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[20px] ${isExporting ? 'animate-spin' : ''}`}>
              {isExporting ? 'sync' : 'file_download'}
            </span>
            {isExporting ? 'Generating...' : 'Export Report'}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-12 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            New Transaction
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-1 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className={`size-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${s.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                {s.trend}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
            <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tighter mt-1 leading-none">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm flex flex-col min-h-[520px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Revenue Stream</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Inflow vs Outflow • {timeRange.toUpperCase()}</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex border border-slate-200/50 dark:border-slate-700/50">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range.toLowerCase() as any)}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${timeRange === range.toLowerCase() ? 'bg-white dark:bg-slate-800 text-primary shadow-lg' : 'text-slate-500'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDataSets[timeRange]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#137fec" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#137fec" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                  labelStyle={{ fontWeight: 'black', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#137fec" strokeWidth={4} fill="url(#colorRev)" animationDuration={1500} />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="transparent" strokeDasharray="8 8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intelligence Source Mix */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 flex flex-col shadow-sm min-h-[520px]">
          <div className="flex items-center justify-between mb-6">
            <div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Source Mix</h3>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Distribution Intelligence</p>
            </div>
            <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-8 flex-1">
            <div className="relative size-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={sourceData} 
                    cx="50%" cy="50%" 
                    innerRadius={72} outerRadius={88} 
                    paddingAngle={10} 
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                    cornerRadius={4}
                  >
                    {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">100%</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Allocation</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              {sourceData.map((item, i) => (
                <div key={i} className="group p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:border-primary/20 cursor-default">
                  <div className="flex justify-between items-start mb-3">
                    <div className="size-8 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: item.color }}>
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm">{item.value}%</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.name}</p>
                  <div className="flex items-baseline justify-between gap-1">
                    <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">{item.amount}</p>
                    <div className={`flex items-center gap-0.5 ${item.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <span className="text-[9px] font-black">{item.growth}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Unified Ledger</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Recent Cash Flow Events</p>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID & Guest</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Payment Info</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Settlement</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="p-6 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {localTransactions.map((tx) => (
                <tr 
                  key={tx.id} 
                  onClick={() => setSelectedTxId(tx.id)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer group ${selectedTxId === tx.id ? 'bg-primary/5' : ''}`}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-900 bg-cover bg-center flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm" style={tx.guest.avatar ? {backgroundImage: `url(${tx.guest.avatar})`} : {}}>
                        {!tx.guest.avatar && <span className="font-black text-slate-400 text-xs">{tx.guest.name[0]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{tx.guest.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{tx.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{tx.category}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{tx.date}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">
                      <span className="material-symbols-outlined text-[16px]">credit_card</span>
                      {tx.method}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">${tx.amount.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Processed Net</p>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      tx.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      <div className={`size-1.5 rounded-full ${tx.status === 'Completed' ? 'bg-emerald-500' : tx.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-slate-300 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">description</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Overlay & Drawer using Portals */}
      {selectedTxId && createPortal(
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedTxId(null)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[10px] z-[9998] transition-all duration-700 animate-in fade-in"
          ></div>

          {/* Transaction Sidebar Drawer */}
          <aside 
            className="fixed inset-y-0 right-0 w-full sm:w-[500px] lg:w-[600px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.15)] z-[9999] transform transition-transform duration-500 flex flex-col animate-in slide-in-from-right"
          >
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
              {selectedTx ? (
                <div className="p-8 sm:p-12 space-y-12 animate-in fade-in slide-in-from-right-12 duration-700">
                  {/* Header Actions */}
                  <div className="flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-20 -mx-4 px-4 py-4 mb-4 border-b border-slate-100/50 dark:border-slate-800/50">
                    <button 
                      onClick={() => setSelectedTxId(null)}
                      className="size-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => alert('Receipt sent to guest.')} 
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-200 hover:text-primary transition-all px-2 py-4"
                      >
                        Email Receipt
                      </button>
                      <button 
                        onClick={() => alert('Printing Invoice...')} 
                        className="h-12 px-8 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        Print Folio
                      </button>
                    </div>
                  </div>

                  {/* Transaction Hero Card */}
                  <div className="relative group overflow-hidden rounded-[3.5rem] bg-slate-950 dark:bg-slate-900 p-12 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
                       <span className="material-symbols-outlined text-[180px]">receipt_long</span>
                    </div>
                    {/* Subtle Gradient Glow */}
                    <div className="absolute -top-1/2 -right-1/4 w-full h-full bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-4 opacity-80">Transaction Detail</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-500 tracking-tight">$</span>
                        <h3 className="text-7xl font-black tracking-tighter leading-none">{selectedTx.amount.toFixed(2)}</h3>
                      </div>
                      <div className="mt-12 flex items-center gap-4">
                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                            selectedTx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            selectedTx.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <div className={`size-1.5 rounded-full ${selectedTx.status === 'Completed' ? 'bg-emerald-400' : selectedTx.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse`}></div>
                          {selectedTx.status}
                        </span>
                        <div className="h-4 w-px bg-slate-800 mx-2"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID: {selectedTx.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-10 rounded-[3rem] border border-slate-200/50 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl group">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 opacity-60">Payer Details</p>
                      <div className="flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center font-black text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110">
                          {selectedTx.guest.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">{selectedTx.guest.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Member</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-10 rounded-[3rem] border border-slate-200/50 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl group">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 opacity-60">Payment Method</p>
                      <div className="flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm transition-transform group-hover:scale-110">
                          <span className="material-symbols-outlined text-[28px]">credit_card</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">{selectedTx.method}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Secure Transaction</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Terminal */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[3.5rem] border border-slate-200/50 dark:border-slate-800 p-12 space-y-8">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Settlement Breakdown</h4>
                    <div className="space-y-6">
                       {[
                         { label: 'Base Revenue', amount: selectedTx.amount * 0.85, detail: 'Net accommodation rate' },
                         { label: 'Service Charge', amount: selectedTx.amount * 0.10, detail: 'Operational handling (10%)' },
                         { label: 'Taxation / VAT', amount: selectedTx.amount * 0.05, detail: 'Statutory fees (5%)' },
                       ].map((item, i) => (
                         <div key={i} className="flex justify-between items-center group/item p-4 -mx-4 rounded-3xl hover:bg-white dark:hover:bg-slate-900 transition-all">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800 dark:text-slate-300">{item.label}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.detail}</span>
                            </div>
                            <span className="text-lg font-black text-slate-900 dark:text-white">${item.amount.toFixed(2)}</span>
                         </div>
                       ))}
                       <div className="pt-10 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Total Settlement</span>
                             <span className="text-sm font-bold text-slate-500 mt-1 italic">Authorized Amount</span>
                          </div>
                          <span className="text-5xl font-black text-primary tracking-tighter">${selectedTx.amount.toFixed(2)}</span>
                       </div>
                    </div>
                  </div>

                  {/* Lifecycle Actions */}
                  <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button className="h-20 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.75rem] hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl">
                        <span className="material-symbols-outlined text-[20px]">history_edu</span>
                        View Audit Log
                     </button>
                     <button 
                      onClick={handleVoidTransaction}
                      disabled={selectedTx.status === 'Refunded'}
                      className={`h-20 text-[10px] font-black uppercase tracking-[0.3em] rounded-[1.75rem] active:scale-95 transition-all flex items-center justify-center gap-4 border shadow-sm
                        ${selectedTx.status === 'Refunded' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200/50'}
                      `}
                     >
                        <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                        Process Refund
                     </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="size-24 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-200 dark:text-slate-800 mb-8 border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-5xl">receipt</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">No Transaction Snapshot</h3>
                  <p className="max-w-xs text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest leading-loose">Select a ledger entry to inspect deep financial intelligence and settlement lifecycle.</p>
                </div>
              )}
            </div>
          </aside>
        </>
      , document.body)}

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-3xl">add_card</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">New Entry</h3>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-black">Financial Settlement Terminal</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-800">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateTx} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest / Payer</label>
                  <select 
                    required
                    value={newTxData.guestId}
                    onChange={(e) => setNewTxData({...newTxData, guestId: e.target.value})}
                    className="w-full h-14 pl-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                  >
                    <option value="">Select Guest</option>
                    {guests.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                    <select 
                      value={newTxData.category}
                      onChange={(e) => setNewTxData({...newTxData, category: e.target.value})}
                      className="w-full h-14 pl-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    >
                      <option>Room Revenue</option>
                      <option>Restaurant</option>
                      <option>Spa & Wellness</option>
                      <option>Mini-bar</option>
                      <option>Late Checkout Fee</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                    <input 
                      required
                      type="number" step="0.01"
                      placeholder="0.00"
                      value={newTxData.amount}
                      onChange={(e) => setNewTxData({...newTxData, amount: e.target.value})}
                      className="w-full h-14 pl-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MasterCard •••• 1234"
                    value={newTxData.method}
                    onChange={(e) => setNewTxData({...newTxData, method: e.target.value})}
                    className="w-full h-14 pl-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full h-16 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">
                    Post Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;