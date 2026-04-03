import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useLanguage } from '../LanguageContext.tsx';
import { useData } from '../DataContext.tsx';
import { UserRole, RoomStatus, BookingStatus } from '../types.ts';

const revenueData = [
  { day: 'Mon', revenue: 2100, adr: 180, occ: 65 },
  { day: 'Tue', revenue: 4500, adr: 195, occ: 72 },
  { day: 'Wed', revenue: 3800, adr: 185, occ: 68 },
  { day: 'Thu', revenue: 5200, adr: 210, occ: 85 },
  { day: 'Fri', revenue: 6100, adr: 225, occ: 92 },
  { day: 'Sat', revenue: 7500, adr: 245, occ: 98 },
  { day: 'Sun', revenue: 6800, adr: 230, occ: 88 },
];

interface DashboardPageProps {
  userRole?: UserRole;
  userName?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userRole, userName }) => {
  const [metric, setMetric] = useState<'revenue' | 'adr' | 'occ'>('revenue');
  const { t } = useLanguage();
  const { rooms, bookings, guests, incidents, transactions, updateIncident } = useData();
  const navigate = useNavigate();

  const isReceptionist = userRole === UserRole.RECEPTIONIST;

  // ——— Computed KPIs from live data ———
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const todayRevenue = transactions.reduce((sum, t) => t.status === 'Completed' ? sum + t.amount : sum, 0);
  const adrValue = occupiedRooms > 0 ? Math.round(todayRevenue / occupiedRooms) : 0;
  const revparValue = totalRooms > 0 ? Math.round(todayRevenue / totalRooms) : 0;
  const pendingArrivals = bookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING).length;
  const pendingDepartures = bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length;
  const vipGuestCount = guests.filter(g => g.isVIP).length;
  const cleaningCount = rooms.filter(r => r.status === RoomStatus.CLEANING).length;
  const maintenanceCount = rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length;
  const waitlistCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;

  const occupancyData = useMemo(() => [
    { name: 'Occupied', value: rooms.filter(r => r.status === RoomStatus.OCCUPIED).length, color: '#f43f5e' },
    { name: 'Available', value: rooms.filter(r => r.status === RoomStatus.AVAILABLE).length, color: '#10b981' },
    { name: 'Cleaning', value: rooms.filter(r => r.status === RoomStatus.CLEANING).length, color: '#f59e0b' },
    { name: 'Maintenance', value: rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length, color: '#3b82f6' },
  ], [rooms]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* Welcome Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-5 sm:p-8 lg:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 size-80 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 size-60 bg-indigo-500/10 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live System Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {t('welcomeMessage')} <span className="text-primary">{userName || 'Manager'}</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-lg text-lg">
              {t('daySummary')}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                <span className="material-symbols-outlined text-primary">flight_land</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('todayArrivals')}</p>
                  <p className="text-lg font-black leading-none">{String(pendingArrivals).padStart(2, '0')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                <span className="material-symbols-outlined text-rose-400">flight_takeoff</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('todayDepartures')}</p>
                  <p className="text-lg font-black leading-none">{String(pendingDepartures).padStart(2, '0')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                <span className="material-symbols-outlined text-amber-400">auto_awesome</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('vipGuests')}</p>
                  <p className="text-lg font-black leading-none">{String(vipGuestCount).padStart(2, '0')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:w-72 shrink-0">
            <button 
              onClick={() => navigate('/bookings')}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-primary text-white rounded-3xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all transform-gpu will-change-transform"
            >
              <span className="material-symbols-outlined text-3xl">add_box</span>
              <span className="text-[9px] font-black uppercase tracking-widest">{t('newBooking')}</span>
            </button>
            <button 
              onClick={() => navigate('/front-desk')}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/10 text-white rounded-3xl hover:bg-white/20 active:scale-95 transition-all transform-gpu will-change-transform border border-white/10"
            >
              <span className="material-symbols-outlined text-3xl">login</span>
              <span className="text-[9px] font-black uppercase tracking-widest">{t('checkIn')}</span>
            </button>
            <button 
              onClick={() => navigate('/rooms')}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/10 text-white rounded-3xl hover:bg-white/20 active:scale-95 transition-all transform-gpu will-change-transform border border-white/10"
            >
              <span className="material-symbols-outlined text-3xl">cleaning_services</span>
              <span className="text-[9px] font-black uppercase tracking-widest">{t('inventory')}</span>
            </button>
            <button 
              onClick={() => navigate('/finance')}
              disabled={isReceptionist}
              className={`flex flex-col items-center justify-center gap-2 p-4 text-white rounded-3xl transition-all transform-gpu will-change-transform border border-white/10 ${isReceptionist ? 'bg-white/5 opacity-40 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 active:scale-95'}`}
            >
              <span className="material-symbols-outlined text-3xl">{isReceptionist ? 'lock' : 'analytics'}</span>
              <span className="text-[9px] font-black uppercase tracking-widest">{t('finance')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: t('revenueToday'), value: `$${todayRevenue.toLocaleString()}`, icon: 'account_balance_wallet', trend: '↑ 12%', color: 'blue', hidden: isReceptionist },
          { label: t('adr'), value: `$${adrValue}`, icon: 'payments', trend: '↑ 2%', color: 'violet', hidden: isReceptionist },
          { label: t('occupancy'), value: `${occupancyRate}%`, icon: 'bed', trend: '↑ 4%', color: 'rose', hidden: false },
          { label: t('revpar'), value: `$${revparValue}`, icon: 'trending_up', trend: '↑ 5%', color: 'indigo', hidden: isReceptionist },
          { label: 'Cleaning Tasks', value: String(cleaningCount).padStart(2, '0'), icon: 'cleaning_services', trend: 'Pending', color: 'blue', hidden: !isReceptionist },
          { label: 'Maintenance', value: String(maintenanceCount).padStart(2, '0'), icon: 'build', trend: maintenanceCount > 0 ? 'Critical' : 'Clear', color: 'violet', hidden: !isReceptionist },
          { label: 'Waitlist', value: String(waitlistCount).padStart(2, '0'), icon: 'hourglass_empty', trend: waitlistCount > 0 ? `${waitlistCount} pending` : 'None', color: 'indigo', hidden: !isReceptionist },
        ].filter(kpi => !kpi.hidden).map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm group hover:border-primary transition-all hover:shadow-xl">
            <div className={`size-12 rounded-2xl mb-4 flex items-center justify-center 
              ${kpi.color === 'rose' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' : 
                kpi.color === 'blue' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' :
                kpi.color === 'indigo' ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20' :
                'bg-violet-50 text-violet-500 dark:bg-violet-900/20'}`}>
              <span className="material-symbols-outlined text-[24px]">{kpi.icon}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{kpi.value}</h3>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${kpi.trend.includes('↑') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Analytics Section */}
        <div className={!isReceptionist ? "lg:col-span-8 space-y-8" : "lg:col-span-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm flex flex-col justify-center items-center text-center"}>
          {!isReceptionist ? (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-4 sm:p-8 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Performance Analytics</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Revenue Comparison • Last 7 Days</p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl flex border border-slate-200/50 dark:border-slate-700/50">
                    {[
                      { id: 'revenue', label: 'Revenue' },
                      { id: 'adr', label: 'ADR' },
                      { id: 'occ', label: 'OCC %' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setMetric(opt.id as any)}
                        className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${metric === opt.id ? 'bg-white dark:bg-slate-800 text-primary shadow-lg ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:text-slate-700 transition-colors'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-full h-[300px] sm:h-[400px] relative overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#137fec" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#137fec" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                          dy={15} 
                      />
                      <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                        itemStyle={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}
                        labelStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey={metric} 
                        stroke="#137fec" 
                        strokeWidth={6} 
                        fill="url(#colorMetric)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Incidents Section for Admin/Manager */}
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Recent Incidents</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Live Maintenance & Guest Reports</p>
                  </div>
                  <span className="px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">{incidents.filter(i => i.status !== 'resolved').length} Active</span>
                </div>
                <div className="space-y-4">
                  {incidents.slice(0, 3).map((inc, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 group hover:border-rose-200 transition-all">
                      <div className="flex items-center gap-5">
                        <div className={`size-12 rounded-2xl flex items-center justify-center shadow-sm ${inc.priority === 'urgent' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                          <span className="material-symbols-outlined font-black">{inc.category === 'plumbing' ? 'water_drop' : inc.category === 'electrical' ? 'bolt' : 'report'}</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Room {inc.roomNumber} • {inc.category}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[200px]">{inc.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-rose-500 uppercase mb-1">{inc.priority}</p>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inc.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  {incidents.length === 0 && (
                    <div className="py-10 text-center">
                      <p className="text-slate-400 text-sm italic tracking-widest">No active incidents reported.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="size-24 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-slate-300">event_available</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Today's Schedule</h3>
              <p className="text-slate-500 max-w-sm mt-4">Revenue reports are restricted to management. Focus on guest check-ins and housekeeping coordination.</p>
              <button onClick={() => navigate('/front-desk')} className="mt-8 px-8 h-12 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">Go to Front Desk</button>

              {/* Incidents Section for Receptionist */}
              <div className="w-full mt-12 text-left bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-[2rem] p-6">
                <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Urgent Attention Required</h4>
                <div className="space-y-3">
                  {incidents.filter(i => i.priority === 'urgent' || i.priority === 'high').map((inc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-rose-100 shadow-sm">
                      <span className="material-symbols-outlined text-rose-500 text-lg">warning</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase">Room {inc.roomNumber} - {inc.category}</p>
                        <p className="text-[10px] text-slate-400 truncate">{inc.description}</p>
                      </div>
                      <button onClick={() => updateIncident(inc.id, { status: 'in-progress' })} className="text-[10px] font-black text-primary uppercase">Ack</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-5 sm:p-8 flex flex-col shadow-sm min-h-[400px] sm:min-h-[500px]">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8 uppercase tracking-widest">{t('inventory')}</h3>
          <div className="flex-1 min-h-[280px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                    data={occupancyData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={85} 
                    outerRadius={110} 
                    paddingAngle={10} 
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                >
                  {occupancyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{occupancyRate}<span className="text-2xl text-slate-400">%</span></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('occupancy')}</span>
            </div>
          </div>
          <div className="mt-10 space-y-4">
            {occupancyData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 hover:border-primary/20 transition-all cursor-default group">
                <div className="flex items-center gap-4">
                  <div className="size-3.5 rounded-full shadow-sm group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">{item.value} Units</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;