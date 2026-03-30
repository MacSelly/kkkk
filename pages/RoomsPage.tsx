import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RoomStatus, Room } from '../types.ts';
import { useData } from '../DataContext.tsx';

const RoomsPage: React.FC = () => {
  const { rooms: localRooms, addRoom, setRoomStatus, updateRoom } = useData();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoomStatus>('ALL');

  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    number: '',
    type: 'Standard King',
    floor: '1',
    price: ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRoomData, setEditRoomData] = useState({
    number: '',
    type: '',
    floor: '',
    price: ''
  });

  const selectedRoom = useMemo(() => 
    localRooms.find(r => r.id === selectedRoomId) || null
  , [selectedRoomId, localRooms]);

  // Keyboard shortcut to close drawers/modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRoomId(null);
        setIsRegisterModalOpen(false);
        setIsEditModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredRooms = useMemo(() => {
    return localRooms.filter(room => {
      const matchesSearch = room.number.includes(searchQuery) || 
                            room.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, localRooms]);

  const handleRegisterRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom: Room = {
      id: `r${Date.now()}`,
      number: newRoomData.number,
      type: newRoomData.type,
      floor: parseInt(newRoomData.floor) || 1,
      pricePerNight: parseFloat(newRoomData.price) || 0,
      status: RoomStatus.AVAILABLE,
      lastCleaned: 'New Registration'
    };

    addRoom(newRoom);
    setIsRegisterModalOpen(false);
    setNewRoomData({ number: '', type: 'Standard King', floor: '1', price: '' });
  };

  const handleEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return;
    
    updateRoom(selectedRoomId, {
      number: editRoomData.number,
      type: editRoomData.type,
      floor: parseInt(editRoomData.floor) || 1,
      pricePerNight: parseFloat(editRoomData.price) || 0,
    });
    
    setIsEditModalOpen(false);
  };

  const stats = [
    { label: 'Total Inventory', val: localRooms.length, icon: 'domain', color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/50' },
    { label: 'Ready to Sell', val: localRooms.filter(r => r.status === RoomStatus.AVAILABLE).length, icon: 'check_circle', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'In Cleanup', val: localRooms.filter(r => r.status === RoomStatus.CLEANING).length, icon: 'cleaning_services', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Out of Order', val: localRooms.filter(r => r.status === RoomStatus.MAINTENANCE).length, icon: 'build', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Breadcrumbs & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            <span className="text-slate-400">Inventory</span>
            <span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>
            <span className="text-primary">Rooms Management</span>
          </nav>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Rooms Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage property assets, maintenance schedules, and configuration.</p>
        </div>
        <button 
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 rounded-2xl text-[10px] sm:text-xs font-black shadow-xl shadow-primary/20 transition-all active:scale-95 shrink-0 uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[20px]">add_box</span>
          <span>Register New Room</span>
        </button>
      </div>

      {/* Modern KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-1 transition-all hover:shadow-lg group">
            <div className="flex items-center justify-between mb-2">
              <div className={`size-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
              <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 group-hover:text-primary transition-colors">info</span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
            <p className="text-slate-900 dark:text-white text-3xl font-black tracking-tighter mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary dark:text-white" 
              placeholder="Search by Room # (e.g. 101, 102)..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-12 bg-slate-50 dark:bg-slate-900 border-none text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(RoomStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Room Table Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Room Info</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Rate / Night</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Live Status</th>
                <th className="p-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRooms.map((room) => (
                <tr 
                  key={room.id} 
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer group ${selectedRoomId === room.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                       <div className={`size-12 rounded-2xl flex items-center justify-center font-black transition-all ${selectedRoomId === room.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110' : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-white dark:border-slate-700 shadow-sm group-hover:border-primary'}`}>
                          {room.number}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 dark:text-white leading-none">Unit {room.number}</span>
                       </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-700 dark:text-slate-300">{room.type}</td>
                  <td className="p-6 text-sm font-medium text-slate-600 dark:text-slate-400">Floor {room.floor}</td>
                  <td className="p-6 text-sm font-black text-slate-900 dark:text-white">${room.pricePerNight}</td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      room.status === RoomStatus.AVAILABLE ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10' :
                      room.status === RoomStatus.OCCUPIED ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10' :
                      room.status === RoomStatus.CLEANING ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10' :
                      'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">settings</span>
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
        onClick={() => setSelectedRoomId(null)}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-[4px] z-[60] transition-all duration-500 ${selectedRoomId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      ></div>

      {/* Room Detail Sidebar Drawer */}
      <aside 
        className={`
          fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[540px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] z-[70] transform transition-transform duration-500 flex flex-col
          ${selectedRoomId ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {selectedRoom ? (
          <>
            <div className="px-6 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedRoomId(null)}
                  className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors border border-slate-100 dark:border-slate-700"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <div className="hidden sm:block">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Room Details</h4>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Unit {selectedRoom.number}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if(confirm("Archive this room?")) {
                      setRoomStatus(selectedRoom.id, RoomStatus.MAINTENANCE);
                      setSelectedRoomId(null);
                    }
                  }}
                  className="h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Archive
                </button>
                <button 
                  onClick={() => {
                    setEditRoomData({
                      number: selectedRoom.number,
                      type: selectedRoom.type,
                      floor: selectedRoom.floor.toString(),
                      price: selectedRoom.pricePerNight.toString()
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="h-10 px-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Edit Room
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6 sm:p-10 pt-6 w-full">
              <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-right-8 duration-500 w-full">
                <div className="flex flex-col items-center text-center w-full">
                   <div className="size-24 sm:size-32 rounded-[2.5rem] sm:rounded-[3.5rem] bg-primary/10 border-4 border-white dark:border-slate-800 shadow-2xl mb-6 sm:mb-8 flex items-center justify-center text-primary relative">
                      <span className="material-symbols-outlined text-[48px] sm:text-[64px]">bed</span>
                      <div className="absolute -bottom-2 -right-2 size-8 sm:size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center border-4 border-white dark:border-slate-900">
                        <span className="material-symbols-outlined text-[16px] sm:text-[20px]">check</span>
                      </div>
                   </div>
                   <h3 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none w-full truncate">Unit {selectedRoom.number}</h3>
                   <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-[0.4em] mt-3 sm:mt-4 w-full truncate">{selectedRoom.type}</p>
                   
                   <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-8 border-y border-slate-100 dark:border-slate-800 py-6 sm:py-8 w-full max-w-full overflow-hidden">
                      <div className="flex flex-col items-center justify-center min-w-0">
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate w-full px-1 text-center">${selectedRoom.pricePerNight}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 sm:mt-2">Rate</p>
                      </div>
                      <div className="flex flex-col items-center justify-center min-w-0 border-x border-slate-100 dark:border-slate-800 px-1">
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate w-full text-center">{selectedRoom.floor}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 sm:mt-2">Floor</p>
                      </div>
                      <div className="flex flex-col items-center justify-center min-w-0">
                        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none truncate w-full px-1 text-center">84%</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 sm:mt-2">Yield</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">monitoring</span>
                     Operational Status
                   </h4>
                    <div className="flex flex-wrap gap-2 w-full">
                      {Object.values(RoomStatus).map((status) => {
                        const statusColors: any = {
                          [RoomStatus.AVAILABLE]: 'border-emerald-500/20 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400',
                          [RoomStatus.OCCUPIED]: 'border-blue-500/20 bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400',
                          [RoomStatus.CLEANING]: 'border-amber-500/20 bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400',
                          [RoomStatus.MAINTENANCE]: 'border-rose-500/20 bg-rose-50 text-rose-600 dark:bg-rose-900/10 dark:text-rose-400',
                          [RoomStatus.DIRTY]: 'border-slate-500/20 bg-slate-50 text-slate-600 dark:bg-slate-900/10 dark:text-slate-400',
                        };
                        const isActive = selectedRoom.status === status;
                        return (
                          <button 
                            key={status}
                            onClick={() => setRoomStatus(selectedRoom.id, status)}
                            className={`
                              flex-1 min-w-[130px] h-12 flex items-center justify-center gap-2 px-3 rounded-xl border-2 transition-all font-black text-[9px] uppercase tracking-widest
                              ${isActive 
                                ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10' 
                                : `border-transparent ${statusColors[status] || 'bg-slate-50 text-slate-500'} opacity-60 hover:opacity-100 hover:border-slate-200 dark:hover:border-slate-700`}
                            `}
                          >
                             <div className={`size-1.5 rounded-full shrink-0 ${isActive ? 'bg-primary animate-pulse' : 'bg-current'}`}></div>
                             <span className="truncate">{status}</span>
                          </button>
                        );
                      })}
                    </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">king_bed</span>
                    Room Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: 'wifi', label: '1GB Fiber' },
                      { icon: 'tv', label: 'Smart TV' },
                      { icon: 'coffee', label: 'Nespresso' },
                      { icon: 'ac_unit', label: 'Climate Ctl' },
                      { icon: 'local_bar', label: 'Mini-Bar' },
                      { icon: 'visibility', label: 'City View' }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 group">
                        <span className="material-symbols-outlined text-slate-400 text-[18px] sm:text-[20px] group-hover:text-primary transition-colors">{feature.icon}</span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{feature.label}</span>
                      </div>
                    ))}
                   </div>
                </div>

                {/* Housekeeping and Maintenance notes */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Housekeeping Log</h4>
                      <span className="text-[9px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-lg w-max">Last Active</span>
                    </div>
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-amber-500 border border-slate-100 dark:border-slate-700 shrink-0">
                        <span className="material-symbols-outlined">cleaning_services</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">{selectedRoom.lastCleaned || 'Recent Service'}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate mt-0.5 sm:mt-0">Standard Turnover • 45m</p>
                      </div>
                    </div>
                  </div>

                  {selectedRoom.maintenanceNote && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-rose-100 dark:border-rose-900/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Maintenance Ticket</h4>
                        <span className="text-[9px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-lg w-max">High Priority</span>
                      </div>
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-rose-500 border border-rose-100 dark:border-rose-900/50 shrink-0">
                          <span className="material-symbols-outlined">report</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-black text-rose-900 dark:text-rose-400 leading-snug break-words">{selectedRoom.maintenanceNote}</p>
                          <p className="text-[9px] sm:text-[10px] text-rose-400 font-medium mt-1 uppercase tracking-widest truncate">Assigned: Engineering</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 sm:pt-4 grid grid-cols-1 gap-4 w-full">
                   <button 
                      onClick={() => alert(`Showing history for Unit ${selectedRoom.number}`)}
                      className="h-12 sm:h-16 w-full bg-slate-900 dark:bg-slate-800 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl sm:rounded-[1.5rem] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-3 border border-slate-950 shadow-xl"
                   >
                      <span className="material-symbols-outlined text-[18px]">history</span>
                      Audit Service Log
                   </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 uppercase font-black text-xs">
            Select a room
          </div>
        )}
      </aside>

      {/* Edit Room Modal */}
      {isEditModalOpen && selectedRoomId && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-2xl">edit</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Edit Room</h3>
                    <p className="text-[9px] text-slate-500 mt-1.5 uppercase tracking-widest font-black">Asset Terminal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleEditRoom} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Number</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 204"
                      value={editRoomData.number}
                      onChange={(e) => setEditRoomData({...editRoomData, number: e.target.value})}
                      className="w-full h-12 pl-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor Level</label>
                    <input 
                      required
                      type="number" 
                      placeholder="1"
                      value={editRoomData.floor}
                      onChange={(e) => setEditRoomData({...editRoomData, floor: e.target.value})}
                      className="w-full h-12 pl-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Category</label>
                  <select 
                    required
                    value={editRoomData.type}
                    onChange={(e) => setEditRoomData({...editRoomData, type: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                  >
                    <option>Standard King</option>
                    <option>Standard Queen</option>
                    <option>Double Twin</option>
                    <option>Deluxe Suite</option>
                    <option>Executive Suite</option>
                    <option>Presidential Terminal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nightly Rate (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      required
                      type="number" 
                      placeholder="0.00"
                      value={editRoomData.price}
                      onChange={(e) => setEditRoomData({...editRoomData, price: e.target.value})}
                      className="w-full h-12 pl-8 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[1.5] h-14 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Room Registration Modal - REFINED AND COMPACT (max-w-md) */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsRegisterModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-2xl">add_home</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">New Room</h3>
                    <p className="text-[9px] text-slate-500 mt-1.5 uppercase tracking-widest font-black">Asset Terminal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleRegisterRoom} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Number</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 204"
                      value={newRoomData.number}
                      onChange={(e) => setNewRoomData({...newRoomData, number: e.target.value})}
                      className="w-full h-12 pl-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Floor Level</label>
                    <input 
                      required
                      type="number" 
                      placeholder="1"
                      value={newRoomData.floor}
                      onChange={(e) => setNewRoomData({...newRoomData, floor: e.target.value})}
                      className="w-full h-12 pl-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Category</label>
                  <select 
                    required
                    value={newRoomData.type}
                    onChange={(e) => setNewRoomData({...newRoomData, type: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                  >
                    <option>Standard King</option>
                    <option>Standard Queen</option>
                    <option>Double Twin</option>
                    <option>Deluxe Suite</option>
                    <option>Executive Suite</option>
                    <option>Presidential Terminal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nightly Rate (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      required
                      type="number" 
                      placeholder="0.00"
                      value={newRoomData.price}
                      onChange={(e) => setNewRoomData({...newRoomData, price: e.target.value})}
                      className="w-full h-12 pl-8 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="flex-1 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[1.5] h-14 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    Post to Inventory
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

export default RoomsPage;