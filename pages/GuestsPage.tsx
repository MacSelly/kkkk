
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Guest } from '../types.ts';
import { useData } from '../DataContext.tsx';

const GuestsPage: React.FC = () => {
  const { guests: localGuests, addGuest, updateGuest, addActivity } = useData();
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'VIP' | 'RETURNING' | 'NEW'>('ALL');

  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGuestData, setNewGuestData] = useState({
    name: '',
    email: '',
    phone: '',
    isVIP: false,
    isReturning: false
  });

  // Messaging Modal State
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedGuest = useMemo(() => 
    localGuests.find(g => g.id === selectedGuestId) || null
  , [selectedGuestId, localGuests]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedGuestId(null);
        setIsModalOpen(false);
        setIsMessageModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredGuests = useMemo(() => {
    return localGuests.filter(guest => {
      const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            guest.phone.includes(searchQuery);
      
      const matchesFilter = 
        filterType === 'ALL' ||
        (filterType === 'VIP' && guest.isVIP) ||
        (filterType === 'RETURNING' && guest.isReturning) ||
        (filterType === 'NEW' && !guest.isVIP && !guest.isReturning);

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterType, localGuests]);

  const handleRegisterGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const newGuest: Guest = {
      id: `g${Date.now()}`,
      name: newGuestData.name,
      email: newGuestData.email,
      phone: newGuestData.phone,
      isVIP: newGuestData.isVIP,
      isReturning: newGuestData.isReturning,
      avatar: undefined,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      loyaltyTier: 'Bronze',
      loyaltyPoints: 0
    };

    addGuest(newGuest);
    setIsModalOpen(false);
    setNewGuestData({ name: '', email: '', phone: '', isVIP: false, isReturning: false });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsMessageModalOpen(false);
      setMessageText('');
      alert(`Message dispatched to ${selectedGuest?.name} successfully.`);
    }, 1200);
  };

  const stats = [
    { label: 'Total Registered', val: localGuests.length.toLocaleString(), icon: 'group', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'VIP Members', val: localGuests.filter(g => g.isVIP).length.toString(), icon: 'star', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Returning Guests', val: localGuests.filter(g => g.isReturning).length.toString(), icon: 'rebase_edit', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Avg Stay Value', val: '$840', icon: 'payments', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 relative">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            <span className="text-slate-400">Directory</span>
            <span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>
            <span className="text-primary">Guest Management</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Guest Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage guest profiles, loyalty status, and historical data.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 rounded-2xl text-[10px] sm:text-xs font-black shadow-xl shadow-primary/20 transition-all active:scale-95 shrink-0 uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[22px]">person_add</span>
          <span>Register New Profile</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-1 transition-all hover:shadow-lg group">
            <div className={`size-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-2`}>
              <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
            <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tighter mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary dark:text-white" 
              placeholder="Search by name, email, or phone number..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto scrollbar-hide">
            {(['ALL', 'VIP', 'RETURNING', 'NEW'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-3 sm:px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filterType === tab ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest Profile</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Information</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Membership</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Lifetime Spent</th>
                <th className="p-6 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGuests.map((guest) => (
                <tr 
                  key={guest.id} 
                  onClick={() => setSelectedGuestId(guest.id)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer group ${selectedGuestId === guest.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`size-14 rounded-[1.2rem] bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0 border-4 border-white dark:border-slate-800 shadow-sm group-hover:scale-110 transition-all duration-300 overflow-hidden flex items-center justify-center`} style={guest.avatar ? {backgroundImage: `url(${guest.avatar})`} : {}}>
                        {!guest.avatar && <span className="font-black text-slate-400 text-lg uppercase">{guest.name[0]}</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-black text-slate-900 dark:text-white leading-tight">{guest.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Since {guest.memberSince || 'Oct 2024'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-slate-600 dark:text-slate-300 font-medium">{guest.email}</td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {guest.isVIP && (
                        <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase tracking-[0.1em] rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
                          {guest.loyaltyTier || 'VIP'}
                        </span>
                      )}
                      {guest.isReturning ? (
                        <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase tracking-[0.1em] rounded-xl border border-blue-200 dark:border-blue-800">
                          Returning
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-[0.1em] rounded-xl border border-transparent">
                          New Profile
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right font-black text-slate-900 dark:text-white">${guest.isVIP ? '4,820.00' : '1,250.00'}</td>
                  <td className="p-6 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {createPortal(
        <>
          {/* Sidebar Overlay */}
          <div 
            onClick={() => setSelectedGuestId(null)}
            className={`fixed inset-0 bg-slate-950/60 backdrop-blur-[4px] z-[60] transition-all duration-500 ${selectedGuestId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          ></div>

          {/* RE-DESIGNED: Guest Detail Sidebar Drawer */}
          <aside 
            className={`
              fixed inset-y-0 right-0 w-full sm:w-[500px] lg:w-[600px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] z-[70] transform transition-transform duration-500 flex flex-col
              ${selectedGuestId ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
            {selectedGuest ? (
              <>
                <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 z-20">
                  <button 
                    onClick={() => setSelectedGuestId(null)}
                    className="size-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors border border-slate-100 dark:border-slate-700"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => alert(`Showing history for ${selectedGuest.name}`)}
                      className="h-11 px-6 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200"
                    >
                      History
                    </button>
                    <button 
                      onClick={() => setIsMessageModalOpen(true)}
                      className="h-11 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20"
                    >
                      Send Message
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-10 space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                    
                    {/* 1. Profile Hero Section */}
                    <div className="flex flex-col items-center text-center">
                       <div className="relative group">
                         <div className="size-36 rounded-[3.5rem] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-cover bg-center flex items-center justify-center mb-8" style={selectedGuest.avatar ? {backgroundImage: `url(${selectedGuest.avatar})`} : {}}>
                            {!selectedGuest.avatar && <span className="font-black text-5xl text-slate-300">{selectedGuest.name[0]}</span>}
                         </div>
                         <div className="absolute -bottom-2 -right-2 size-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                            <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                         </div>
                       </div>
                       <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{selectedGuest.name}</h3>
                       <div className="flex items-center gap-3 mt-4">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">{selectedGuest.loyaltyTier || 'Elite'} Member</span>
                         <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                         <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Since {selectedGuest.memberSince || '2023'}</span>
                       </div>
                    </div>

                    {/* 2. Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4 border-y border-slate-100 dark:border-slate-800 py-8">
                       <div className="text-center">
                          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{selectedGuest.loyaltyPoints?.toLocaleString() || '450'}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Points</p>
                       </div>
                       <div className="text-center border-x border-slate-100 dark:border-slate-800 px-4">
                          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{selectedGuest.pastStays?.length || '1'}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Visits</p>
                       </div>
                       <div className="text-center">
                          <p className="text-2xl font-black text-emerald-500 tracking-tighter leading-none">$4.8k</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">LTV</p>
                       </div>
                    </div>

                    {/* 3. Loyalty Tier Progress */}
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">military_tech</span>
                            {selectedGuest.loyaltyTier} Tier Progress
                          </h4>
                          <span className="text-[10px] font-bold text-primary">850 pts to Platinum</span>
                       </div>
                       <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: '75%' }}></div>
                       </div>
                    </div>

                    {/* 4. Contact & Identity Panel */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Information</h4>
                       <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                             <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">mail</span>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Email</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedGuest.email}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                             <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">call</span>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mobile Phone</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedGuest.phone}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* 5. Guest Preferences DNA */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <span className="material-symbols-outlined text-[16px]">psychology</span>
                         Stay Preferences
                       </h4>
                       <div className="flex flex-wrap gap-3">
                          {(selectedGuest.preferences || [
                            { icon: 'vaping_rooms', label: 'Non-Smoking' },
                            { icon: 'high_quality', label: 'Quiet Room' }
                          ]).map((pref, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-primary transition-all">
                               <span className="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">{pref.icon}</span>
                               <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{pref.label}</span>
                            </div>
                          ))}
                          <button 
                            onClick={() => alert("Add preference modal...")}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            <span className="text-[11px] font-bold">Add Preference</span>
                          </button>
                       </div>
                    </div>

                    {/* 6. Internal Staff Notes */}
                    <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-800/50">
                       <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Internal Remarks</h4>
                          <span className="material-symbols-outlined text-[18px] text-amber-500">lock_person</span>
                       </div>
                       <p className="text-xs font-medium text-amber-800 dark:text-amber-400/80 leading-relaxed italic">
                          {selectedGuest.internalNotes || "No restricted notes for this guest profile. Add notes regarding behavior or special service requests here."}
                       </p>
                    </div>

                    {/* 7. Historical Trace (Past Stays) */}
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Stay Ledger</h4>
                       <div className="space-y-3">
                          {(selectedGuest.pastStays || [{ date: 'Oct 2024', room: '101', total: 450 }]).map((stay, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-black text-xs text-slate-400">
                                     {stay.room}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-slate-900 dark:text-white">{stay.date}</p>
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room {stay.room} • Completed</p>
                                  </div>
                               </div>
                               <p className="text-sm font-black text-slate-900 dark:text-white">${stay.total}</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="pt-8 pb-10">
                       <button 
                        onClick={() => {
                          if (!selectedGuest) return;
                          updateGuest(selectedGuest.id, { loyaltyPoints: (selectedGuest.loyaltyPoints || 0) + 100 });
                          addActivity({
                            id: `act-${Date.now()}`,
                            timestamp: new Date().toLocaleTimeString(),
                            title: 'Loyalty Reward Given',
                            description: `Awarded 100 points to ${selectedGuest.name}`,
                            type: 'vip'
                          });
                          alert(`Loyalty points updated for ${selectedGuest.name}! (Awarded 100 points)`);
                        }}
                        className="w-full h-16 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-[1.5rem] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl border border-slate-950"
                       >
                          <span className="material-symbols-outlined">auto_awesome</span>
                          Initiate Loyalty Reward
                       </button>
                    </div>

                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="size-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                   <span className="material-symbols-outlined text-4xl">contact_page</span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest">Select Profile</h3>
                <p className="text-[10px] max-w-[200px] mt-2 font-medium">Search for and select a guest profile to view loyalty data, preferences, and stay history.</p>
              </div>
            )}
          </aside>

        {/* New Guest Registration Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <span className="material-symbols-outlined text-2xl">person_add</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">New Profile</h3>
                      <p className="text-[9px] text-slate-500 mt-1.5 uppercase tracking-widest font-black">Directory Terminal</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-800 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleRegisterGuest} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Robert Paulson"
                      value={newGuestData.name}
                      onChange={(e) => setNewGuestData({...newGuestData, name: e.target.value})}
                      className="w-full h-12 pl-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="name@domain.com"
                      value={newGuestData.email}
                      onChange={(e) => setNewGuestData({...newGuestData, email: e.target.value})}
                      className="w-full h-12 pl-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Loyalty Tier</h4>
                    
                    <div className="flex items-center justify-between group">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">VIP Elite Access</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={newGuestData.isVIP}
                          onChange={(e) => setNewGuestData({...newGuestData, isVIP: e.target.checked})}
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-[1.5] h-14 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                      Post Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {isMessageModalOpen && selectedGuest && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => !isSending && setIsMessageModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Send Message</h3>
                      <p className="text-[9px] text-slate-500 mt-1.5 uppercase tracking-widest font-black">To: {selectedGuest.name}</p>
                    </div>
                  </div>
                  <button 
                    disabled={isSending}
                    onClick={() => setIsMessageModalOpen(false)}
                    className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 border border-slate-100 dark:border-slate-800 shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Compose Message</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white resize-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      type="button"
                      disabled={isSending}
                      onClick={() => setIsMessageModalOpen(false)}
                      className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      disabled={isSending || !messageText.trim()}
                      className="flex-[1.5] h-14 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        </>,
        document.body
      )}
    </div>
  );
};

export default GuestsPage;
