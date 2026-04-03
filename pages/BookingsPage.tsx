import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookingStatus, PaymentStatus, Booking, Room } from '../types.ts';
import { useLanguage } from '../LanguageContext.tsx';
import { useData } from '../DataContext.tsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Toast } from '../components/RoomPanelModals.tsx';

const BookingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { bookings: localBookings, addBooking, updateBooking, rooms, guests } = useData();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
  const [toast, setToast] = useState<{message: string, icon?: string, type?: 'success'|'info'|'warning'} | null>(null);

  const showToast = (msg: string, icon = 'check_circle', type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message: msg, icon, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // New Booking Modal State
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState({
    guestName: '',
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    guestsCount: '2 Adults'
  });

  // Action States
  const [isExporting, setIsExporting] = useState(false);

  const selectedBooking = useMemo(() => 
    localBookings.find(b => b.id === selectedBookingId) || null
  , [selectedBookingId, localBookings]);

  // Keyboard shortcut to close drawers/modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBookingId(null);
        setIsNewBookingModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredBookings = useMemo(() => {
    return localBookings.filter(booking => {
      const matchesSearch = booking.guest.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            booking.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            booking.room.number.includes(searchQuery);
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, localBookings]);


  // Real PDF Download
  const handleExportPDF = () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text('HMS PRO - RESERVATION REPORT', 14, 22);
      
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      
      const tableColumn = ["Ref", "Guest", "Room", "Check In", "Check Out", "Status", "Amount"];
      const tableRows = localBookings.map(b => [
        b.ref,
        b.guest.name,
        b.room.number,
        b.checkIn,
        b.checkOut,
        b.status.replace('_', ' '),
        `$${b.totalAmount.toFixed(2)}`
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] } // primary color
      });
      
      doc.save(`HMS-Reservation-Report-${Date.now()}.pdf`);
      showToast('PDF Exported Successfully', 'file_download', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Error exporting PDF', 'error', 'warning');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoom = rooms.find(r => r.number === newBookingData.roomNumber) || rooms[0];

    // Date validation
    const startDate = new Date(newBookingData.checkIn);
    const endDate = new Date(newBookingData.checkOut);
    if (endDate <= startDate) {
      showToast('Check-out date must be after check-in date', 'error', 'warning');
      return;
    }

    // Room conflict validation
    const conflicting = localBookings.find(b =>
      b.room.number === targetRoom.number &&
      b.status !== BookingStatus.CHECKED_OUT &&
      b.status !== BookingStatus.CANCELLED &&
      new Date(b.checkIn) < endDate &&
      new Date(b.checkOut) > startDate
    );
    if (conflicting) {
      showToast(`Room ${targetRoom.number} is already booked for those dates (${conflicting.ref})`, 'event_busy', 'warning');
      return;
    }
    
    const newEntry: Booking = {
      id: `b${Date.now()}`,
      ref: `#BK-${Math.floor(1000 + Math.random() * 9000)}`,
      guest: {
        id: `g${Date.now()}`,
        name: newBookingData.guestName,
        email: `${newBookingData.guestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: '+1 (555) 000-0000',
      },
      room: targetRoom,
      checkIn: newBookingData.checkIn,
      checkOut: newBookingData.checkOut,
      guestsCount: newBookingData.guestsCount,
      totalAmount: (() => {
        const start = new Date(newBookingData.checkIn);
        const end = new Date(newBookingData.checkOut);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        return targetRoom.pricePerNight * nights;
      })(),
      depositPaid: 0,
      paymentStatus: PaymentStatus.UNPAID,
      status: BookingStatus.CONFIRMED
    };

    addBooking(newEntry);
    setIsNewBookingModalOpen(false);
    setNewBookingData({ guestName: '', roomNumber: '', checkIn: '', checkOut: '', guestsCount: '2 Adults' });
  };

  const stats = [
    { label: 'Total Bookings', value: localBookings.length, icon: 'book_online', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Pending Arrivals', value: localBookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING).length, icon: 'flight_land', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending Payment', value: `$${localBookings.filter(b => b.paymentStatus !== PaymentStatus.PAID).reduce((sum, b) => sum + (b.totalAmount - b.depositPaid), 0).toLocaleString()}`, icon: 'pending_actions', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Occupancy Rate', value: `${rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'OCCUPIED').length / rooms.length) * 100) : 0}%`, icon: 'percent', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('reservations')}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">{t('bookingsSummary')}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 sm:px-5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[20px] ${isExporting ? 'animate-spin' : ''}`}>
                {isExporting ? 'sync' : 'file_download'}
              </span>
              {isExporting ? 'Generating PDF...' : t('exportPDF')}
            </button>
            <button 
              onClick={() => setIsNewBookingModalOpen(true)}
              className="flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 sm:px-6 text-xs sm:text-sm font-black text-white shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              {t('newBooking')}
            </button>
          </div>
        </header>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
              <div className={`size-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border-none bg-slate-50 dark:bg-slate-900 pl-10 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
          
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto scrollbar-hide">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0">
              {(['ALL', BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT, BookingStatus.CANCELLED] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2 sm:px-4 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest rounded-lg transition-all whitespace-nowrap ${statusFilter === status ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400'}`}>
                <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400'}`}>
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
            </div>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' ? (
          <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px] lg:min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest & Reference</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Room Details</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Accounting</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Payment</th>
                    <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                    <th className="p-5 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBookings.map((booking) => (
                    <tr 
                      key={booking.id} 
                      onClick={() => setSelectedBookingId(booking.id)}
                      className={`group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all ${selectedBookingId === booking.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''}`}
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 flex-none rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 bg-cover bg-center overflow-hidden flex items-center justify-center shadow-sm" style={booking.guest.avatar ? {backgroundImage: `url(${booking.guest.avatar})`} : {}}>
                            {!booking.guest.avatar && <span className="font-black text-slate-400 text-xs">{booking.guest.name[0]}</span>}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{booking.guest.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{booking.ref}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{booking.room.type}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Room {booking.room.number} • Floor {booking.room.floor}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{booking.checkIn}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="material-symbols-outlined text-[16px] text-slate-400">logout</span>
                             <span className="text-[11px] font-medium text-slate-400 italic">to {booking.checkOut}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                         <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-slate-900 dark:text-white">${booking.totalAmount.toFixed(2)}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Fee</span>
                         </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center justify-center h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                          booking.paymentStatus === PaymentStatus.PAID 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800' 
                            : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10 dark:border-rose-800'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                         <span className={`inline-flex items-center justify-center h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                           booking.status === BookingStatus.CHECKED_IN ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10' :
                           booking.status === BookingStatus.CONFIRMED ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/10' :
                           'bg-slate-50 text-slate-500 border-slate-100'
                         }`}>
                           {booking.status.replace('_', ' ')}
                         </span>
                      </td>
                      <td className="p-5">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                onClick={() => setSelectedBookingId(booking.id)}
                className={`bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-2 cursor-pointer transition-all hover:shadow-xl ${selectedBookingId === booking.id ? 'border-primary shadow-2xl shadow-primary/10' : 'border-transparent shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-200 bg-cover bg-center border-2 border-white dark:border-slate-700 shadow-lg" style={booking.guest.avatar ? {backgroundImage: `url(${booking.guest.avatar})`} : {}}>
                      {!booking.guest.avatar && <div className="size-full flex items-center justify-center font-black text-slate-400 uppercase">{booking.guest.name[0]}</div>}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight">{booking.guest.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{booking.ref}</p>
                    </div>
                  </div>
                  <span className={`h-6 px-2.5 rounded-lg flex items-center justify-center text-[9px] font-black uppercase tracking-widest ${
                    booking.status === BookingStatus.CHECKED_IN ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Room {booking.room.number}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{booking.room.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Guests</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{booking.guestsCount}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Period</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white mt-1">{booking.checkIn} — {booking.checkOut}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee</span>
                         <p className="text-xl font-black text-primary tracking-tighter mt-1">${booking.totalAmount}</p>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createPortal(
        <>
          {/* Sidebar Overlay */}
      <div 
        onClick={() => setSelectedBookingId(null)}
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-[4px] z-[60] transition-all duration-500 ${selectedBookingId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      ></div>

      {/* Booking Detail Sidebar Drawer */}
      <aside 
        className={`
          fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[540px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)] z-[70] transform transition-transform duration-500 flex flex-col
          ${selectedBookingId ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {selectedBooking ? (
          <>
            <div className="px-10 py-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 z-20">
              <button 
                onClick={() => setSelectedBookingId(null)}
                className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors border border-slate-100 dark:border-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="flex gap-3">
                {selectedBooking.status === BookingStatus.CONFIRMED && (
                  <button onClick={() => {
                    updateBooking(selectedBooking.id, { status: BookingStatus.CHECKED_IN });
                    showToast('Guest Checked In successfully');
                  }} className="h-12 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all">Check In</button>
                )}
                {selectedBooking.status === BookingStatus.CHECKED_IN && (
                  <button onClick={() => {
                    updateBooking(selectedBooking.id, { status: BookingStatus.CHECKED_OUT });
                    showToast('Guest Checked Out successfully', 'logout', 'success');
                  }} className="h-12 px-6 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all">Check Out</button>
                )}
                {selectedBooking.status !== BookingStatus.CANCELLED && selectedBooking.status !== BookingStatus.CHECKED_OUT && (
                  <button onClick={() => {
                    updateBooking(selectedBooking.id, { status: BookingStatus.CANCELLED });
                    showToast('Booking cancelled', 'cancel', 'warning');
                    setSelectedBookingId(null);
                  }} className="h-12 px-6 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-colors active:scale-95">Cancel</button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-8">
              <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                
                {/* Guest Profile Header */}
                <div className="flex flex-col items-center text-center">
                   <div className="size-32 rounded-[3.5rem] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-2xl mb-8 overflow-hidden bg-cover bg-center flex items-center justify-center" style={selectedBooking.guest.avatar ? {backgroundImage: `url(${selectedBooking.guest.avatar})`} : {}}>
                      {!selectedBooking.guest.avatar && <span className="font-black text-4xl text-slate-300">{selectedBooking.guest.name[0]}</span>}
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{selectedBooking.guest.name}</h3>
                   <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mt-4">Reservation {selectedBooking.ref}</p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap justify-center gap-2">
                   <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-200 dark:border-blue-800">
                     {selectedBooking.status.replace('_', ' ')}
                   </span>
                   <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border ${
                     selectedBooking.paymentStatus === PaymentStatus.PAID 
                       ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                       : 'bg-rose-100 text-rose-700 border-rose-200'
                   }`}>
                     Payment {selectedBooking.paymentStatus}
                   </span>
                </div>

                {/* Stay Journey */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">event_repeat</span>
                    Stay Lifecycle
                  </h4>
                  <div className="relative p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check In</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{selectedBooking.checkIn}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-4">
                           <div className="w-full h-px bg-slate-200 dark:bg-slate-700 relative">
                              <div className="absolute inset-y-0 left-0 bg-primary w-1/2"></div>
                              <div className="absolute top-1/2 left-0 -translate-y-1/2 size-2 rounded-full bg-primary ring-4 ring-white dark:ring-slate-800"></div>
                              <div className="absolute top-1/2 right-0 -translate-y-1/2 size-2 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-800"></div>
                           </div>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">{(() => { const s = new Date(selectedBooking.checkIn); const e = new Date(selectedBooking.checkOut); const n = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000)); return `${n} Night${n !== 1 ? 's' : ''} Stay`; })()}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check Out</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{selectedBooking.checkOut}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary border border-slate-100 dark:border-slate-700 shadow-sm">
                           <span className="material-symbols-outlined text-[20px]">group</span>
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-900 dark:text-white">{selectedBooking.guestsCount}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupancy Load</p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Assigned Asset */}
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">bed</span>
                     Assigned Inventory
                   </h4>
                   <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-xl border-2 border-primary/10 shadow-inner">
                            {selectedBooking.room.number}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{selectedBooking.room.type}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floor {selectedBooking.room.floor} • Wing A</p>
                         </div>
                      </div>
                      <button onClick={() => showToast('Re-assigning room feature coming soon', 'info', 'info')} className="size-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-primary transition-colors active:scale-95">
                        <span className="material-symbols-outlined">sync_alt</span>
                      </button>
                   </div>
                </div>

                {/* Financial Overview */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    Accounting breakdown
                  </h4>
                  <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl">
                     <div className="space-y-4">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span>Base Revenue</span>
                           <span>${selectedBooking.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span>Service Charge</span>
                           <span>$0.00</span>
                        </div>
                        <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                           <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Gross Total</span>
                           <span className="text-3xl font-black tracking-tighter text-white">${selectedBooking.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 rounded-2xl p-4 mt-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Balance Settled</span>
                           <span className="text-lg font-black">${selectedBooking.depositPaid.toFixed(2)}</span>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 grid grid-cols-1 gap-4">
                   <button onClick={() => showToast('Confirmation email sent to guest', 'mail', 'success')} className="h-16 bg-slate-900 dark:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-[1.5rem] hover:opacity-90 transition-all flex items-center justify-center gap-3 border border-slate-950 shadow-xl active:scale-95">
                      <span className="material-symbols-outlined">mail</span>
                      Send Confirmation Email
                   </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 uppercase font-black text-xs">
            Select a reservation
          </div>
        )}
      </aside>

      {/* New Booking Modal */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setIsNewBookingModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-3xl">add_card</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">New Reservation</h3>
                    <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-black">Booking Confirmation Terminal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-800"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest Identity</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Robert Paulson"
                      value={newBookingData.guestName}
                      onChange={(e) => setNewBookingData({...newBookingData, guestName: e.target.value})}
                      className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Assignment</label>
                    <select 
                      required
                      value={newBookingData.roomNumber}
                      onChange={(e) => setNewBookingData({...newBookingData, roomNumber: e.target.value})}
                      className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    >
                      <option value="">Select Room</option>
                      {rooms.filter(r => r.status === 'AVAILABLE').map(r => (
                        <option key={r.number} value={r.number}>Room {r.number} - {r.type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Date</label>
                    <input 
                      required
                      type="date"
                      value={newBookingData.checkIn}
                      onChange={(e) => setNewBookingData({...newBookingData, checkIn: e.target.value})}
                      className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure Date</label>
                    <input 
                      required
                      type="date"
                      value={newBookingData.checkOut}
                      onChange={(e) => setNewBookingData({...newBookingData, checkOut: e.target.value})}
                      className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Occupancy Count</label>
                  <select 
                    value={newBookingData.guestsCount}
                    onChange={(e) => setNewBookingData({...newBookingData, guestsCount: e.target.value})}
                    className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary shadow-sm dark:text-white"
                  >
                    <option>1 Adult</option>
                    <option>2 Adults</option>
                    <option>2 Adults, 1 Child</option>
                    <option>2 Adults, 2 Children</option>
                    <option>Executive Suite Max</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsNewBookingModalOpen(false)}
                    className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] h-16 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} icon={toast.icon} type={toast.type} />}
        </>,
        document.body
      )}
    </div>
  );
};

export default BookingsPage;