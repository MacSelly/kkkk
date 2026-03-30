import React, { useState, useMemo } from 'react';
import { useData } from '../DataContext.tsx';
import { User, BookingStatus } from '../types.ts';

interface GuestPortalPageProps {
  user: User | null;
  onLogout: () => void;
}

type PortalTab = 'home' | 'services' | 'explore' | 'account';

interface ServiceRequest {
  id: string;
  icon: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
  time: string;
}

const GuestPortalPage: React.FC<GuestPortalPageProps> = ({ user, onLogout }) => {
  const { bookings, rooms } = useData();
  const [activeTab, setActiveTab] = useState<PortalTab>('home');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([
    { id: 'sr1', icon: 'dry_cleaning', label: 'Extra Towels', status: 'completed', time: 'Yesterday, 3:00 PM' },
    { id: 'sr2', icon: 'room_service', label: 'Room Service — Club Sandwich', status: 'in-progress', time: 'Today, 12:30 PM' },
  ]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  const [chatMessages, setChatMessages] = useState<{text: string; from: 'guest'|'hotel'; time: string}[]>([
    { text: 'Welcome to HMS Pro! How can we assist you?', from: 'hotel', time: '10:00 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  const activeBooking = useMemo(() => {
    return bookings.find(
      (b) => (b.status === BookingStatus.CHECKED_IN || b.status === BookingStatus.CONFIRMED) && b.guest.email === user?.email
    ) || bookings[0];
  }, [bookings, user]);

  // Check-in/out date computations
  const checkInDate = activeBooking ? new Date(activeBooking.checkIn) : new Date();
  const checkOutDate = activeBooking ? new Date(activeBooking.checkOut) : new Date();
  const today = new Date();
  const totalNights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  const nightsStayed = Math.max(0, Math.ceil((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  const stayProgress = Math.min(100, Math.round((nightsStayed / totalNights) * 100));

  const serviceCategories = [
    { id: 'dining', icon: 'restaurant', label: 'In-Room Dining', color: 'from-orange-500 to-amber-500', items: ['Breakfast Menu', 'Lunch Menu', 'Dinner Menu', 'Beverages', 'Late Night Snacks'] },
    { id: 'housekeeping', icon: 'cleaning_services', label: 'Housekeeping', color: 'from-cyan-500 to-blue-500', items: ['Extra Towels', 'Extra Pillows', 'Room Cleaning', 'Linen Change', 'Toiletries Refill'] },
    { id: 'concierge', icon: 'support_agent', label: 'Concierge', color: 'from-purple-500 to-violet-500', items: ['Restaurant Booking', 'Tour Booking', 'Airport Transfer', 'Car Rental', 'Event Tickets'] },
    { id: 'spa', icon: 'spa', label: 'Spa & Wellness', color: 'from-emerald-500 to-teal-500', items: ['Swedish Massage', 'Deep Tissue Massage', 'Facial Treatment', 'Yoga Session', 'Sauna Booking'] },
    { id: 'transport', icon: 'local_taxi', label: 'Transportation', color: 'from-rose-500 to-pink-500', items: ['Airport Pickup', 'City Tour', 'Taxi Request', 'Valet Parking'] },
    { id: 'technical', icon: 'build', label: 'Technical Support', color: 'from-slate-500 to-gray-600', items: ['WiFi Issues', 'TV/Remote', 'AC/Heating', 'Safe/Locker', 'Electrical Issue'] },
  ];

  const hotelAmenities = [
    { icon: 'pool', label: 'Infinity Pool', time: '6 AM – 10 PM', floor: 'Rooftop' },
    { icon: 'fitness_center', label: 'Fitness Center', time: '24 Hours', floor: 'Level 2' },
    { icon: 'spa', label: 'Serenity Spa', time: '9 AM – 9 PM', floor: 'Level 3' },
    { icon: 'restaurant', label: 'The Grand Bistro', time: '6 AM – 11 PM', floor: 'Lobby' },
    { icon: 'local_bar', label: 'Skyline Lounge', time: '5 PM – 1 AM', floor: 'Rooftop' },
    { icon: 'meeting_room', label: 'Business Center', time: '24 Hours', floor: 'Level 1' },
    { icon: 'child_care', label: 'Kids Club', time: '8 AM – 6 PM', floor: 'Level 2' },
    { icon: 'local_parking', label: 'Valet Parking', time: '24 Hours', floor: 'Basement' },
  ];

  const localExplore = [
    { icon: 'museum', label: 'City Museum', distance: '1.2 km', rating: 4.7 },
    { icon: 'park', label: 'Central Park', distance: '0.8 km', rating: 4.8 },
    { icon: 'shopping_bag', label: 'Grand Mall', distance: '2.5 km', rating: 4.5 },
    { icon: 'theater_comedy', label: 'Royal Theatre', distance: '3.0 km', rating: 4.6 },
    { icon: 'temple_buddhist', label: 'Heritage Temple', distance: '5.2 km', rating: 4.9 },
    { icon: 'beach_access', label: 'Sunset Beach', distance: '8.0 km', rating: 4.8 },
  ];

  const handleRequestService = (item: string) => {
    const newRequest: ServiceRequest = {
      id: `sr-${Date.now()}`,
      icon: serviceCategories.find(c => c.id === selectedServiceCategory)?.icon || 'room_service',
      label: item,
      status: 'pending',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
    setServiceRequests(prev => [newRequest, ...prev]);
    setSelectedServiceCategory(null);
    setShowServiceModal(false);
  };

  const handleUnlockDoor = () => {
    setDoorUnlocked(true);
    setTimeout(() => setDoorUnlocked(false), 5000);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setChatMessages(prev => [...prev, { text: chatInput, from: 'guest', time: now }]);
    setChatInput('');
    // Simulate hotel response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: "Thank you for your message! Our team will assist you shortly.", from: 'hotel', time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }]);
    }, 1500);
  };

  const handleSubmitFeedback = () => {
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setFeedbackSubmitted(false);
      setFeedbackRating(0);
      setFeedbackText('');
    }, 2000);
  };

  const statusColor = (s: string) => s === 'completed' ? 'text-emerald-500' : s === 'in-progress' ? 'text-amber-500' : 'text-blue-500';
  const statusIcon = (s: string) => s === 'completed' ? 'check_circle' : s === 'in-progress' ? 'autorenew' : 'schedule';

  // ===== RENDER TAB CONTENT =====

  const renderHome = () => (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Digital Key Section (Hero Card) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-xl overflow-hidden p-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-center justify-between">
            <div className="space-y-6 flex-1 text-center lg:text-left">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{activeBooking?.room.type || 'LUXURY SUITE'}</p>
                <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Room {activeBooking?.room.number || 'N/A'}</h2>
                <div className="mt-4 flex flex-wrap gap-4 items-center justify-center lg:justify-start">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    </span>
                    Live Key Active
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l-2 border-slate-200 dark:border-slate-700 pl-4">Floor {activeBooking?.room.floor || 1}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 pt-2">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Check-in</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{activeBooking?.checkIn || '--'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Check-out</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{activeBooking?.checkOut || '--'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Staying</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{totalNights} Nights</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Folio Total</p>
                  <p className="text-sm font-black text-primary">${((totalNights * (activeBooking?.room.pricePerNight || 0) + 205) * 1.12).toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-4 max-w-sm mx-auto lg:mx-0">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                   <span>Stay Progress</span>
                   <span className="text-slate-900 dark:text-white">{stayProgress}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(19,127,236,0.3)]" style={{ width: `${stayProgress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="lg:w-80 w-full shrink-0 flex flex-col gap-3 sm:gap-4">
              <button 
                onClick={handleUnlockDoor}
                className={`relative w-full h-32 rounded-3xl font-black text-sm uppercase tracking-[0.15em] transition-all transform-gpu active:scale-95 group overflow-hidden ${
                  doorUnlocked 
                    ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30' 
                    : 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30 hover:bg-slate-800'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${doorUnlocked ? 'bg-white text-emerald-500 rotate-12' : 'bg-primary/20 text-primary'}`}>
                    <span className="material-symbols-outlined text-3xl font-black">{doorUnlocked ? 'lock_open' : 'contactless'}</span>
                  </div>
                  {doorUnlocked ? 'Access Granted' : 'Tap To Unlock Room'}
                </div>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDndEnabled(!dndEnabled)}
                  className={`py-6 rounded-3xl border transition-all flex flex-col items-center gap-2 ${
                    dndEnabled 
                      ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-rose-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{dndEnabled ? 'notifications_paused' : 'do_not_disturb'}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">DND Mode</span>
                </button>
                <button 
                  onClick={() => setActiveTab('services')}
                  className="py-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary transition-all flex flex-col items-center gap-2"
                >
                  <span className="material-symbols-outlined text-2xl font-black">restaurant</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Butler Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Folio Details Card */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Billing Overview</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Room Account • Live Balance</p>
             </div>
             <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                <span className="material-symbols-outlined font-black">payments</span>
             </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Room & Tax', sub: `${totalNights} Nights`, val: (totalNights * (activeBooking?.room.pricePerNight || 0)).toLocaleString() },
              { label: 'Incidental Charges', sub: 'Room Service & Spa', val: '205.00' },
              { label: 'Government Taxes', sub: 'VAT & Tourism Fee', val: ((totalNights * (activeBooking?.room.pricePerNight || 0) + 205) * 0.12).toFixed(2) }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 transition-colors">
                <div>
                  <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{item.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.sub}</p>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white">${item.val}</p>
              </div>
            ))}
            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">Deposit Settled</span>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Balance Due</p>
                <p className="text-2xl font-black text-primary leading-none">${((totalNights * (activeBooking?.room.pricePerNight || 0) + 205) * 1.12).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Preferences Grid */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase mb-6 tracking-widest">Connect & Dine</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 group hover:border-primary transition-all">
                <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                   <span className="material-symbols-outlined text-lg">wifi</span>
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Wireless Network</p>
                <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">HMS-Guest-Luxury</p>
                <code className="text-[9px] text-slate-400 font-bold">PASS: welcome2024</code>
              </div>
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 group hover:border-amber-400 transition-all">
                <div className="size-10 rounded-xl bg-amber-400 text-white flex items-center justify-center mb-4 shadow-lg shadow-amber-400/20">
                   <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Morning Buffet</p>
                <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">06:30 – 10:30 AM</p>
                <code className="text-[9px] text-slate-400 font-bold">Lobby • Level 1</code>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 size-32 bg-primary/20 rounded-full blur-3xl -mt-16 -mr-16"></div>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Express Checkout</p>
             <h4 className="text-xl font-black tracking-tight leading-tight">Need to depart early?</h4>
             <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">Schedule your departure and receive your final invoice automatically via email.</p>
             <button onClick={() => setSelectedServiceCategory('concierge')} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Request Late Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Bespoke Services</h2>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Premium attention at your fingertips</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {serviceCategories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => { setSelectedServiceCategory(cat.id); setShowServiceModal(true); }}
            className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-[2rem] p-8 flex flex-col items-center text-center shadow-sm hover:shadow-2xl hover:border-primary transition-all duration-500 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 size-24 bg-gradient-to-br ${cat.color} opacity-[0.03] rounded-full -mt-10 -mr-10 transition-transform duration-700 group-hover:scale-[3]`}></div>
            <div className={`size-20 rounded-[1.5rem] bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg shadow-blue-500/10 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
              <span className="material-symbols-outlined text-3xl font-black">{cat.icon}</span>
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 leading-none">{cat.label}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Luxury Standard</p>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-8 tracking-widest flex items-center gap-3">
          <span className="size-1 w-12 bg-primary rounded-full"></span>
          Resort Facilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotelAmenities.map((amenity, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
              <div className="size-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm text-primary">
                <span className="material-symbols-outlined text-xl">{amenity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight truncate">{amenity.label}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{amenity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExplore = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">Explore Nearby</h2>
      <p className="text-sm text-slate-500 -mt-3">Curated recommendations from our concierge team</p>
      <div className="space-y-3">
        {localExplore.map((place, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all group cursor-pointer">
            <div className="size-14 bg-gradient-to-br from-primary/10 to-cyan-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-2xl">{place.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-white">{place.label}</p>
              <p className="text-xs text-slate-500">{place.distance} away</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{place.rating}</span>
              </div>
              <button className="text-[10px] text-primary font-bold mt-1">Get Directions →</button>
            </div>
          </div>
        ))}
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">Today's Weather</p>
            <p className="text-4xl font-black mt-1">24°C</p>
            <p className="text-sm opacity-80 mt-1">Partly Cloudy</p>
          </div>
          <span className="material-symbols-outlined text-5xl opacity-80">partly_cloudy_day</span>
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-white/20 text-sm">
          <div><span className="opacity-60">Humidity</span><p className="font-bold">62%</p></div>
          <div><span className="opacity-60">Wind</span><p className="font-bold">12 km/h</p></div>
          <div><span className="opacity-60">UV Index</span><p className="font-bold">Moderate</p></div>
        </div>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card Elevated */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[400px]">
          <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mt-20 -mr-20"></div>
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-cyan-400 rounded-full opacity-30 blur group-hover:opacity-50 transition duration-500"></div>
              <div className="size-40 rounded-full bg-white dark:bg-slate-900 p-2 overflow-hidden shadow-2xl relative">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="size-full rounded-full object-cover" />
                ) : (
                  <div className="size-full rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                     <span className="material-symbols-outlined text-6xl text-slate-300">person</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center md:text-left space-y-4">
              <div>
                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-200/50">Gold Status Member</span>
                <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">{user?.name}</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{user?.email}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                 <button className="h-12 px-8 bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">Edit Profile</button>
                 <button onClick={onLogout} className="h-12 px-8 bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-all">Safe Sign Out</button>
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Elevated */}
        <div className="lg:col-span-4 bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-xl relative flex flex-col items-center text-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
          <div className="size-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-8 relative z-10">
             <span className="material-symbols-outlined text-4xl text-white font-black">workspace_premium</span>
          </div>
          <h4 className="text-2xl font-black tracking-tighter uppercase relative z-10">5,280 <span className="text-sm font-bold text-amber-500">POINTS</span></h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 relative z-10">Tier Reward Progress</p>
          <div className="w-full max-w-[200px] h-2 bg-white/5 rounded-full mt-6 overflow-hidden relative z-10">
             <div className="h-full bg-amber-500 rounded-full" style={{ width: '72%' }}></div>
          </div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-4 relative z-10">1,420 PTS TO PLATINUM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
         {/* Preferences Redesign */}
         <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-8 tracking-widest">Guest Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
               {['High Floor', 'Non-Smoking', 'Extra Pillows', 'Late Checkout', 'Morning Coffee', 'Quiet Room'].map((pref, i) => (
                  <label key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 cursor-pointer group hover:border-primary transition-all">
                     <div className="relative flex items-center">
                        <input type="checkbox" defaultChecked={i < 3} className="peer hidden" />
                        <div className="size-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                           <span className="material-symbols-outlined text-white text-base opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all font-black">check</span>
                        </div>
                     </div>
                     <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{pref}</span>
                  </label>
               ))}
            </div>
         </div>

         {/* History Redesign */}
         <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-8 tracking-widest">Journey History</h3>
            <div className="space-y-4">
               {[
                 { date: 'OCT 2024', room: 'SUITE 304', nights: 4, total: '$1,400', status: 'PAID' },
                 { date: 'JUL 2024', room: 'KING 201', nights: 2, total: '$620', status: 'PAID' },
                 { date: 'MAR 2024', room: 'KING 405', nights: 3, total: '$1,050', status: 'PAID' },
               ].map((stay, i) => (
                 <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 group hover:border-slate-300 transition-all">
                   <div className="flex items-center gap-5">
                      <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                         <span className="material-symbols-outlined font-black">calendar_today</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{stay.room}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stay.date} • {stay.nights} NIGHTS</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{stay.total}</p>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{stay.status}</span>
                   </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <section className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 rounded-[3rem] p-5 sm:p-8 lg:p-14 text-white shadow-2xl mb-6 sm:mb-12 animate-in slide-in-from-top-4 duration-1000">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 size-[30rem] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 size-[25rem] bg-indigo-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
               <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
               </span>
               <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/80">Digital Butler Active</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-none text-white">
               The Guest <span className="text-primary tracking-tighter italic">Experience.</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-xl leading-relaxed">
               Welcome back, <span className="text-white font-black">{user?.name?.split(' ')[0]}</span>. Your world of hospitality, seamlessly integrated and perfectly tailored to your needs.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setShowChat(!showChat)} 
                className="group h-14 px-8 bg-primary rounded-2xl text-white text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:translate-y-[-2px] active:translate-y-0 transition-all flex items-center gap-4"
              >
                <div className="size-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                   <span className="material-symbols-outlined text-sm font-black">chat_bubble</span>
                </div>
                Concierge Live Chat
              </button>
              <button 
                 onClick={() => setShowFeedbackModal(true)}
                 className="h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl text-white text-[11px] font-black uppercase tracking-widest transition-all"
              >
                 Rate Your Stay
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-1 sm:gap-3 lg:w-[26rem] shrink-0 p-1.5 sm:p-2 bg-white/5 rounded-[1.8rem] sm:rounded-[2.8rem] border border-white/10 backdrop-blur-xl">
            {[
               { id: 'home', label: 'Home', icon: 'auto_awesome' },
               { id: 'services', label: 'Services', icon: 'room_service' },
               { id: 'explore', label: 'Explore', icon: 'travel_explore' },
               { id: 'account', label: 'Profile', icon: 'fingerprint' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PortalTab)} 
                className={`flex flex-col items-center justify-center gap-1.5 sm:gap-3 h-20 sm:h-32 rounded-2xl sm:rounded-[2rem] transition-all relative overflow-hidden group ${
                   activeTab === tab.id 
                    ? 'bg-white text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {activeTab === tab.id && <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>}
                <span className={`material-symbols-outlined text-xl sm:text-3xl font-black transition-all duration-500 ${activeTab === tab.id ? 'text-primary scale-110' : 'text-slate-400 group-hover:text-white group-hover:scale-110'}`}>{tab.icon}</span>
                <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest sm:tracking-[0.1em] whitespace-nowrap transition-all duration-500 ${activeTab === tab.id ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'explore' && renderExplore()}
        {activeTab === 'account' && renderAccount()}
      </div>

      {/* ===== MODALS ===== */}

      {/* Service Request Modal */}
      {showServiceModal && selectedServiceCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowServiceModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-br ${serviceCategories.find(c => c.id === selectedServiceCategory)?.color} p-6 text-white`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl">{serviceCategories.find(c => c.id === selectedServiceCategory)?.icon}</span>
                <div>
                  <h3 className="text-xl font-black">{serviceCategories.find(c => c.id === selectedServiceCategory)?.label}</h3>
                  <p className="text-sm opacity-80">Select a service to request</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {serviceCategories.find(c => c.id === selectedServiceCategory)?.items.map((item, i) => (
                <button key={i} onClick={() => handleRequestService(item)} className="w-full text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors flex items-center justify-between group">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">{item}</span>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">arrow_forward</span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowServiceModal(false)} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFeedbackModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {feedbackSubmitted ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4">sentiment_very_satisfied</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Thank You!</h3>
                <p className="text-slate-500">Your feedback helps us improve.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Rate Your Stay</h3>
                <p className="text-sm text-slate-500 mb-6">We'd love to hear about your experience</p>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setFeedbackRating(star)} className="transition-transform hover:scale-125">
                      <span className={`material-symbols-outlined text-4xl ${star <= feedbackRating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}>star</span>
                    </button>
                  ))}
                </div>
                <textarea 
                  value={feedbackText} 
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none h-24 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold">Cancel</button>
                  <button onClick={handleSubmitFeedback} disabled={feedbackRating === 0} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition">Submit</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowChat(false)}>
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] sm:h-[500px] animate-in slide-in-from-bottom-2 duration-300" onClick={e => e.stopPropagation()}>
            <div className="bg-primary p-4 flex items-center gap-3 text-white shrink-0">
              <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <div className="flex-1">
                <p className="font-bold">Hotel Concierge</p>
                <p className="text-xs opacity-80">Typically replies within minutes</p>
              </div>
              <button onClick={() => setShowChat(false)} className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'guest' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.from === 'guest' 
                      ? 'bg-primary text-white rounded-br-md' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === 'guest' ? 'text-white/60' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
              <input 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                placeholder="Type a message..." 
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button onClick={handleSendChat} className="size-10 bg-primary text-white rounded-full flex items-center justify-center shrink-0 hover:bg-blue-600 transition">
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestPortalPage;
