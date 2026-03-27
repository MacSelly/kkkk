
export enum UserRole {
  ADMIN_MANAGER = 'Admin/Manager',
  RECEPTIONIST = 'Receptionist',
  GUEST = 'Guest',
  HOUSEKEEPING = 'Housekeeping/Maintenance'
}

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  DIRTY = 'DIRTY'
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL'
}

export interface GuestPreference {
  icon: string;
  label: string;
}

export interface PastStay {
  date: string;
  room: string;
  total: number;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isVIP?: boolean;
  isReturning?: boolean;
  memberSince?: string;
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  loyaltyPoints?: number;
  preferences?: GuestPreference[];
  pastStays?: PastStay[];
  internalNotes?: string;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  pricePerNight: number;
  status: RoomStatus;
  lastCleaned?: string;
  maintenanceNote?: string;
}

export interface Booking {
  id: string;
  ref: string;
  guest: Guest;
  room: Room;
  checkIn: string;
  checkOut: string;
  guestsCount: string;
  totalAmount: number;
  depositPaid: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
}

export interface Activity {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'booking' | 'housekeeping' | 'vip' | 'system';
}
