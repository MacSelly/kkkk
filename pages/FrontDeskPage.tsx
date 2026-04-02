import React, { useState, useMemo } from 'react';
import { RoomStatus, BookingStatus, PaymentStatus } from '../types.ts';
import { useLanguage } from '../LanguageContext.tsx';
import { useData } from '../DataContext.tsx';
import { AuditHistoryModal, ManageRoomModal, CheckInModal, Toast } from '../components/RoomPanelModals.tsx';

interface FrontDeskPageProps {
  onLogout?: () => void;
}

interface ToastState {
  message: string;
  icon?: string;
  type?: 'success' | 'info' | 'warning';
}

const FrontDeskPage: React.FC<FrontDeskPageProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  const { rooms, guests, bookings, activities, incidents, updateRoom, setRoomStatus, addBooking, addActivity, addGuest, updateIncident } = useData();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | RoomStatus>('ALL');

  // Modal states
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [showManageRoom, setShowManageRoom] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (msg: string, icon = 'check_circle', type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message: msg, icon, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getGuestForRoom = (roomNumber: string) => {
    const booking = bookings.find(b => b.room.number === roomNumber);
    return booking ? booking.guest : null;
  };

  const getBookingForRoom = (roomNumber: string) => {
    return bookings.find(b => b.room.number === roomNumber);
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;
  const currentBooking = selectedRoom ? getBookingForRoom(selectedRoom.number) : null;
  const currentGuest = currentBooking?.guest || null;

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.number.includes(searchQuery) || 
                            room.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterTab === 'ALL' || room.status === filterTab;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterTab, rooms]);

  const opStats = [
    { label: 'Pending Arrivals', val: '7', icon: 'login', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Due Departures', val: '4', icon: 'logout', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Stay-overs', val: '12', icon: 'night_shelter', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Priority Clean', val: '3', icon: 'priority_high', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] dark:bg-slate-950 font-display">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Professional Top Bar */}
        <header className="h-auto sm:h-16 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
              <span className="material-symbols-outlined">room_service</span>
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Command Center</h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live Hospitality Stream</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-initial">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text" 
                placeholder="Scan Room or Guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full sm:w-48 lg:w-64 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-900 dark:text-white pl-10 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            {/* Incident Alert Counter */}
            <div className="relative group">
              <button className="size-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 transition-all flex items-center justify-center border border-rose-100 dark:border-rose-900/50 shrink-0">
                 <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                 {incidents.filter(i => i.status === 'pending').length > 0 && (
                   <span className="absolute -top-1 -right-1 size-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-bounce">
                     {incidents.filter(i => i.status === 'pending').length}
                   </span>
                 )}
              </button>
              
              {/* Dropdown with recent incidents */}
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all z-50">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending Guest Reports</h4>
                <div className="space-y-3">
                  {incidents.filter(i => i.status === 'pending').slice(0, 3).map((inc, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-rose-500">ROOM {inc.roomNumber}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase">{inc.timestamp}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{inc.description}</p>
                    </div>
                  ))}
                  {incidents.filter(i => i.status === 'pending').length === 0 && (
                    <p className="text-[10px] text-slate-400 italic text-center py-4 uppercase font-bold tracking-widest">No active alerts</p>
                  )}
                </div>
              </div>
            </div>

            <button className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors flex items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0">
               <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {/* Quick Stats Toolbar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {opStats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:shadow-lg hover:border-primary/20 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-none mt-0.5">{stat.val}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors text-sm">chevron_right</span>
              </div>
            ))}
          </div>

          {/* Dynamic Filter Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-hide">
              {(['ALL', RoomStatus.AVAILABLE, RoomStatus.OCCUPIED, RoomStatus.CLEANING, RoomStatus.MAINTENANCE] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${filterTab === tab ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab === 'ALL' ? 'Everything' : tab}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
              Viewing {filteredRooms.length} Active Units
            </p>
          </div>

          {/* High-Fidelity Room Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 sm:gap-6">
            {filteredRooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const guest = getGuestForRoom(room.number);
              
              return (
                <div 
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`
                    relative group flex flex-col p-6 rounded-[2rem] border-2 transition-all cursor-pointer h-56
                    ${isSelected 
                      ? 'border-primary bg-white dark:bg-slate-800 shadow-2xl ring-4 ring-primary/5' 
                      : 'border-transparent bg-white dark:bg-slate-900 shadow-sm hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-xl'}
                  `}
                >
                   <div className="flex justify-between items-start mb-4">
                      <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{room.number}</span>
                      <div className={`size-8 rounded-lg flex items-center justify-center ${
                        room.status === RoomStatus.AVAILABLE ? 'bg-emerald-50 text-emerald-500' :
                        room.status === RoomStatus.OCCUPIED ? 'bg-blue-50 text-blue-500' :
                        room.status === RoomStatus.CLEANING ? 'bg-amber-50 text-amber-500' :
                        'bg-rose-50 text-rose-500'
                      }`}>
                         <span className="material-symbols-outlined text-[20px]">
                           {room.status === RoomStatus.AVAILABLE ? 'check_circle' : 
                            room.status === RoomStatus.OCCUPIED ? 'person' : 
                            room.status === RoomStatus.CLEANING ? 'cleaning_services' : 'build'}
                         </span>
                      </div>
                   </div>

                   <div className="flex flex-col">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{room.type}</p>
                      <div className="mt-4 flex flex-col gap-1">
                        {guest ? (
                          <>
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{guest.name}</p>
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                              <div className="w-2/3 h-full bg-primary"></div>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm font-bold text-slate-300 dark:text-slate-700 italic">Ready for assignment</p>
                        )}
                      </div>
                   </div>

                   <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        room.status === RoomStatus.AVAILABLE ? 'text-emerald-500' : 'text-primary'
                      }`}>
                        {room.status}
                      </span>
                      {guest?.isVIP && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <span className="material-symbols-outlined text-[14px] fill-1">star</span>
                          <span className="text-[8px] font-black uppercase tracking-tighter">VIP Tier</span>
                        </div>
                      )}
                   </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Modern Overlay Detail Panel */}
      <div 
        onClick={() => setSelectedRoomId(null)}
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[60] transition-all duration-500 ${selectedRoomId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      ></div>

      <aside className={`
        fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 
        flex flex-col shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] z-[70] transform transition-transform duration-500
        ${selectedRoomId ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {selectedRoom ? (
          <>
            <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button 
                onClick={() => setSelectedRoomId(null)}
                className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="flex items-center gap-2 sm:gap-4">
                 <button onClick={() => setShowAuditHistory(true)} className="h-10 sm:h-12 px-3 sm:px-6 bg-slate-100 dark:bg-slate-800 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95">Audit History</button>
                 <button onClick={() => setShowManageRoom(true)} className="h-10 sm:h-12 px-3 sm:px-6 bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">Manage Room</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-10 custom-scrollbar">
              <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                
                {/* Visual Room Summary */}
                <div className="flex flex-col items-center text-center">
                   <div className="size-32 rounded-[3.5rem] bg-slate-900 dark:bg-primary border-4 border-white dark:border-slate-800 shadow-2xl mb-8 flex items-center justify-center text-white relative">
                      <span className="text-5xl font-black tracking-tighter">{selectedRoom.number}</span>
                      <div className="absolute -bottom-2 -right-2 size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center border-4 border-white dark:border-slate-900">
                        <span className="material-symbols-outlined text-[20px]">verified</span>
                      </div>
                   </div>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedRoom.type}</h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-4">Floor {selectedRoom.floor} • Wing South</p>
                </div>

                {/* Dynamic Content: Guest Info OR Check-in prompt */}
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                     <span className="material-symbols-outlined text-[16px]">person</span>
                     Current Occupancy Information
                   </h4>

                   {currentGuest ? (
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="flex items-center gap-5">
                           <div className="size-16 rounded-3xl bg-white dark:bg-slate-800 shadow-xl border-2 border-slate-50 dark:border-slate-700 flex items-center justify-center font-black text-2xl text-primary uppercase">
                              {currentGuest.name[0]}
                           </div>
                           <div>
                              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{currentGuest.name}</h3>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {currentBooking?.ref}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                           <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{currentBooking?.checkIn}</p>
                           </div>
                           <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Departure</p>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{currentBooking?.checkOut}</p>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="p-10 rounded-[3.5rem] bg-emerald-50/50 dark:bg-emerald-900/10 border-2 border-dashed border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center text-center">
                        <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mb-6">
                           <span className="material-symbols-outlined text-3xl">add_task</span>
                        </div>
                        <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-500 tracking-tight leading-none">Ready for Arrival</h3>
                        <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-[200px]">No active occupancy detected. You can assign a walk-in guest or check-in a pending reservation.</p>
                        <button onClick={() => setShowCheckIn(true)} className="mt-8 h-12 px-8 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all hover:shadow-2xl">Start Check-in</button>
                     </div>
                   )}
                </div>

                {/* Operations Checklist */}
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">checklist_rtl</span>
                     Quick Operations
                   </h4>
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => {
                        setRoomStatus(selectedRoom.id, RoomStatus.AVAILABLE);
                        addActivity({ id: `a-${Date.now()}`, timestamp: 'Just now', title: `Room ${selectedRoom.number} marked clean`, description: `Status changed to AVAILABLE`, type: 'housekeeping' });
                        showToast(`Room ${selectedRoom.number} marked as CLEAN`, 'auto_awesome', 'success');
                      }} className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group active:scale-95">
                         <span className="material-symbols-outlined text-emerald-500 text-2xl group-hover:scale-125 transition-transform">auto_awesome</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Mark Clean</span>
                      </button>
                      <button onClick={() => {
                        setRoomStatus(selectedRoom.id, RoomStatus.MAINTENANCE);
                        addActivity({ id: `a-${Date.now()}`, timestamp: 'Just now', title: `Room ${selectedRoom.number} set to maintenance`, description: `Room is now under maintenance`, type: 'system' });
                        showToast(`Room ${selectedRoom.number} set to MAINTENANCE`, 'construction', 'warning');
                      }} className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all group active:scale-95">
                         <span className="material-symbols-outlined text-rose-500 text-2xl group-hover:scale-125 transition-transform">construction</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Maintenance</span>
                      </button>
                      <button onClick={() => {
                        showToast(`Digital key issued for Room ${selectedRoom.number}`, 'key', 'info');
                        addActivity({ id: `a-${Date.now()}`, timestamp: 'Just now', title: `Digital key issued for Room ${selectedRoom.number}`, description: `Mobile key sent to guest`, type: 'system' });
                      }} className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-white dark:hover:bg-slate-800 transition-all group active:scale-95">
                         <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-125 transition-transform">key</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Digital Key</span>
                      </button>
                      <button onClick={() => {
                        showToast(`Late checkout approved for Room ${selectedRoom.number} (2:00 PM)`, 'update', 'info');
                        addActivity({ id: `a-${Date.now()}`, timestamp: 'Just now', title: `Late checkout approved for Room ${selectedRoom.number}`, description: `Checkout extended to 2:00 PM`, type: 'booking' });
                      }} className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all group active:scale-95">
                         <span className="material-symbols-outlined text-amber-500 text-2xl group-hover:scale-125 transition-transform">update</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Late Checkout</span>
                      </button>
                   </div>
                </div>

                {/* Recent Feed for this Room */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity Trace</h4>
                  <div className="space-y-3">
                    {activities
                      .filter(act => act.title.includes(selectedRoom.number) || act.description.includes(selectedRoom.number))
                      .slice(0, 4)
                      .length > 0
                      ? activities
                          .filter(act => act.title.includes(selectedRoom.number) || act.description.includes(selectedRoom.number))
                          .slice(0, 4)
                          .map((act, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm">
                              <div className="size-1.5 rounded-full bg-primary mt-2"></div>
                              <div>
                                <p className="text-[11px] font-bold text-slate-900 dark:text-white">{act.title}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">{act.timestamp}</p>
                              </div>
                            </div>
                          ))
                      : activities.slice(0, 2).map((act, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="size-1.5 rounded-full bg-primary mt-2"></div>
                            <div>
                              <p className="text-[11px] font-bold text-slate-900 dark:text-white">{act.title}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{act.timestamp}</p>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400">
            <div className="size-24 rounded-[3rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800">
               <span className="material-symbols-outlined text-5xl">dashboard_customize</span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter">Operational Detail</h3>
            <p className="text-xs font-medium max-w-[240px] mt-4 leading-relaxed">Select a terminal unit from the inventory grid to access live guest profiles, housekeeping controls, and check-in workflows.</p>
          </div>
        )}
      </aside>

      {/* ——— Modals ——— */}
      {showAuditHistory && selectedRoom && (
        <AuditHistoryModal room={selectedRoom} activities={activities} bookings={bookings} onClose={() => setShowAuditHistory(false)} />
      )}
      {showManageRoom && selectedRoom && (
        <ManageRoomModal room={selectedRoom}
          onSave={(id, updates) => {
            updateRoom(id, updates);
            addActivity({ id: `a-${Date.now()}`, timestamp: 'Just now', title: `Room ${selectedRoom.number} updated`, description: `Status: ${updates.status || selectedRoom.status}, Price: $${updates.pricePerNight || selectedRoom.pricePerNight}`, type: 'system' });
            showToast(`Room ${selectedRoom.number} updated successfully`);
          }}
          onClose={() => setShowManageRoom(false)}
        />
      )}
      {showCheckIn && selectedRoom && (
        <CheckInModal room={selectedRoom} guests={guests}
          onCheckIn={(room, guest, checkOut) => {
            // Add guest if walk-in
            if (!guests.find(g => g.id === guest.id)) addGuest(guest);
            // Update room to occupied
            setRoomStatus(room.id, RoomStatus.OCCUPIED);
            // Create booking
            const today = new Date();
            const ref = `#BK-${Math.floor(1000 + Math.random() * 9000)}`;
            addBooking({
              id: `b-${Date.now()}`,
              ref,
              guest,
              room: { ...room, status: RoomStatus.OCCUPIED },
              checkIn: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              checkOut: new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              guestsCount: '1 Adult',
              totalAmount: room.pricePerNight,
              depositPaid: 0,
              paymentStatus: PaymentStatus.UNPAID,
              status: BookingStatus.CHECKED_IN,
            });
            addActivity({ id: `a-${Date.now()}`, timestamp: 'Just now', title: `Check-in: ${guest.name} → Room ${room.number}`, description: `Booking ${ref} created`, type: 'booking' });
            showToast(`${guest.name} checked into Room ${room.number}!`);
          }}
          onClose={() => setShowCheckIn(false)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} icon={toast.icon} type={toast.type} />}
    </div>
  );
};

export default FrontDeskPage;