import React, { useState } from 'react';
import { Room, Guest, Booking, Activity, RoomStatus, BookingStatus, PaymentStatus } from '../types.ts';

// ——— Audit History Modal ———
interface AuditHistoryModalProps {
  room: Room;
  activities: Activity[];
  bookings: Booking[];
  onClose: () => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({ room, activities, bookings, onClose }) => {
  const roomBookings = bookings.filter(b => b.room.number === room.number);
  const auditEntries = [
    ...activities.map(a => ({ time: a.timestamp, text: a.title, desc: a.description, type: a.type, source: 'activity' as const })),
    ...roomBookings.map(b => ({
      time: b.checkIn,
      text: `Booking ${b.ref} — ${b.guest.name}`,
      desc: `${b.status} • ${b.checkIn} → ${b.checkOut} • ${b.paymentStatus}`,
      type: 'booking' as const,
      source: 'booking' as const,
    })),
  ];

  const iconMap: Record<string, string> = { booking: 'event', housekeeping: 'cleaning_services', vip: 'star', system: 'settings' };
  const colorMap: Record<string, string> = { booking: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', housekeeping: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', vip: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20', system: 'text-slate-500 bg-slate-50 dark:bg-slate-800' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Audit History</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Room {room.number} • Full Timeline</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
          {auditEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-3 block">history</span>
              <p className="text-sm font-bold">No history recorded yet</p>
            </div>
          ) : auditEntries.map((entry, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all">
              <div className={`size-10 rounded-xl ${colorMap[entry.type] || colorMap.system} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-[18px]">{iconMap[entry.type] || 'info'}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{entry.text}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{entry.desc}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{entry.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ——— Manage Room Modal ———
interface ManageRoomModalProps {
  room: Room;
  onSave: (id: string, updates: Partial<Room>) => void;
  onClose: () => void;
}

export const ManageRoomModal: React.FC<ManageRoomModalProps> = ({ room, onSave, onClose }) => {
  const [status, setStatus] = useState(room.status);
  const [price, setPrice] = useState(room.pricePerNight.toString());
  const [maintNote, setMaintNote] = useState(room.maintenanceNote || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(room.id, {
      status,
      pricePerNight: parseFloat(price) || room.pricePerNight,
      maintenanceNote: status === RoomStatus.MAINTENANCE ? maintNote : undefined,
    });
    setSaved(true);
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Manage Room</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Room {room.number} • {room.type}</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Room Status</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(RoomStatus).map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${status === s ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Price Per Night ($)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          {status === RoomStatus.MAINTENANCE && (
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Maintenance Note</label>
              <textarea value={maintNote} onChange={e => setMaintNote(e.target.value)} rows={2}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            </div>
          )}
          <button onClick={handleSave}
            className={`w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white shadow-primary/20 hover:shadow-xl active:scale-[0.98]'}`}>
            {saved ? '✓ Saved Successfully' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ——— Check-In Modal ———
interface CheckInModalProps {
  room: Room;
  guests: Guest[];
  onCheckIn: (room: Room, guest: Guest, checkOut: string) => void;
  onClose: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ room, guests, onCheckIn, onClose }) => {
  const [mode, setMode] = useState<'existing' | 'walkin'>('existing');
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleCheckIn = () => {
    let guest: Guest;
    if (mode === 'existing') {
      const found = guests.find(g => g.id === selectedGuestId);
      if (!found || !checkOutDate) return;
      guest = found;
    } else {
      if (!walkInName || !checkOutDate) return;
      guest = {
        id: `g-${Date.now()}`,
        name: walkInName,
        email: walkInEmail || `${walkInName.toLowerCase().replace(/\s/g, '.')}@walk.in`,
        phone: walkInPhone || 'N/A',
      };
    }
    setProcessing(true);
    setTimeout(() => {
      onCheckIn(room, guest, checkOutDate);
      onClose();
    }, 600);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Check-In Guest</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Room {room.number} • {room.type} • ${room.pricePerNight}/night</p>
          </div>
          <button onClick={onClose} className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Mode Tabs */}
          <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
            {(['existing', 'walkin'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === m ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}>
                {m === 'existing' ? 'Existing Guest' : 'Walk-In'}
              </button>
            ))}
          </div>

          {mode === 'existing' ? (
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Guest</label>
              <select value={selectedGuestId} onChange={e => setSelectedGuestId(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">Choose a guest...</option>
                {guests.map(g => <option key={g.id} value={g.id}>{g.name} {g.isVIP ? '⭐ VIP' : ''}</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name *</label>
                <input type="text" value={walkInName} onChange={e => setWalkInName(e.target.value)} placeholder="Guest name..."
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email</label>
                  <input type="email" value={walkInEmail} onChange={e => setWalkInEmail(e.target.value)} placeholder="Email..."
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone</label>
                  <input type="tel" value={walkInPhone} onChange={e => setWalkInPhone(e.target.value)} placeholder="Phone..."
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Check-Out Date *</label>
            <input type="date" value={checkOutDate} min={today} onChange={e => setCheckOutDate(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <button onClick={handleCheckIn} disabled={processing}
            className={`w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${processing ? 'bg-emerald-500 text-white animate-pulse' : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:shadow-xl active:scale-[0.98]'}`}>
            {processing ? 'Processing Check-In...' : 'Confirm Check-In'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ——— Confirmation Toast ———
interface ToastProps {
  message: string;
  icon?: string;
  type?: 'success' | 'info' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({ message, icon = 'check_circle', type = 'success' }) => {
  const colors = {
    success: 'bg-emerald-500 shadow-emerald-500/30',
    info: 'bg-blue-500 shadow-blue-500/30',
    warning: 'bg-amber-500 shadow-amber-500/30',
  };
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl text-white ${colors[type]} shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-500`}>
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
};
