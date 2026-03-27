import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { GUESTS as INITIAL_GUESTS, ROOMS as INITIAL_ROOMS, BOOKINGS as INITIAL_BOOKINGS, ACTIVITIES as INITIAL_ACTIVITIES } from './constants.tsx';
import { Guest, Room, Booking, Activity, RoomStatus, BookingStatus, PaymentStatus } from './types.ts';

// ————— Context Types —————

interface DataContextType {
  // Guests
  guests: Guest[];
  addGuest: (guest: Guest) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;

  // Rooms
  rooms: Room[];
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  setRoomStatus: (id: string, status: RoomStatus) => void;

  // Bookings
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;

  // Activities
  activities: Activity[];
  addActivity: (activity: Activity) => void;

  // Transactions (Finance)
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
}

export interface Transaction {
  id: string;
  guest: Guest;
  date: string;
  amount: number;
  method: string;
  status: string;
  category: string;
}

// ————— Initial Transactions —————

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TX-9021', guest: INITIAL_GUESTS[0], date: 'Oct 30, 2024', amount: 840.00, method: 'Visa •••• 4242', status: 'Completed', category: 'Room Revenue' },
  { id: 'TX-9022', guest: INITIAL_GUESTS[1], date: 'Oct 29, 2024', amount: 150.00, method: 'Cash', status: 'Completed', category: 'Restaurant' },
  { id: 'TX-9023', guest: INITIAL_GUESTS[2], date: 'Oct 28, 2024', amount: 1200.00, method: 'Amex •••• 1001', status: 'Pending', category: 'Room Revenue' },
  { id: 'TX-9024', guest: INITIAL_GUESTS[3], date: 'Oct 28, 2024', amount: 45.00, method: 'Visa •••• 8912', status: 'Refunded', category: 'Mini-bar' },
];

// ————— Context —————

const DataContext = createContext<DataContextType | undefined>(undefined);

// ————— Provider —————

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // —— Guest actions ——
  const addGuest = useCallback((guest: Guest) => {
    setGuests(prev => [guest, ...prev]);
  }, []);

  const updateGuest = useCallback((id: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  // —— Room actions ——
  const addRoom = useCallback((room: Room) => {
    setRooms(prev => [room, ...prev]);
  }, []);

  const updateRoom = useCallback((id: string, updates: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const setRoomStatus = useCallback((id: string, status: RoomStatus) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }, []);

  // —— Booking actions ——
  const addBooking = useCallback((booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
  }, []);

  const updateBooking = useCallback((id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  // —— Activity actions ——
  const addActivity = useCallback((activity: Activity) => {
    setActivities(prev => [activity, ...prev]);
  }, []);

  // —— Transaction actions ——
  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  return (
    <DataContext.Provider value={{
      guests, addGuest, updateGuest,
      rooms, addRoom, updateRoom, setRoomStatus,
      bookings, addBooking, updateBooking,
      activities, addActivity,
      transactions, addTransaction, updateTransaction,
    }}>
      {children}
    </DataContext.Provider>
  );
};

// ————— Hook —————

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
