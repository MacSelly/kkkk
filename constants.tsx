
import { RoomStatus, BookingStatus, PaymentStatus, Room, Guest, Booking, Activity } from './types.ts';

const today = new Date();
const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const dMinus2 = new Date(today); dMinus2.setDate(today.getDate() - 2);
const dMinus1 = new Date(today); dMinus1.setDate(today.getDate() - 1);
const dPlus2 = new Date(today); dPlus2.setDate(today.getDate() + 2);
const dPlus3 = new Date(today); dPlus3.setDate(today.getDate() + 3);
const dPlus5 = new Date(today); dPlus5.setDate(today.getDate() + 5);

export const GUESTS: Guest[] = [
  {
    id: 'g1',
    name: 'Sarah Connor',
    email: 'sarah.c@email.com',
    phone: '+1 (555) 019-2834',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyWCGcyn-BJGDYqjYrO8n2fEsCE-20Oe49eiAtnJn6sNAKHNakfB4aDDYCKlMZNEJEU6RdgIFDXFmUsSBIdpHrzov0AHBRX_u3Rt_agYi3AfxDIM2PgK9NfyYpB3nriNZYrX2tZkSz_uxxEZjfBcqQ9Wnhj3yUGJYY8v2GcemVqTx-3_I_CDR5OIiXSdxs4S-jaOiyKvQH-6C59AKS8eKXXXdq85jid6KhIAMBvflQq9HAOeN2QIy-IdjJPpSZum16km644Dj8mVU',
    isVIP: true,
    isReturning: true,
    memberSince: 'Jan 2022',
    loyaltyTier: 'Platinum',
    loyaltyPoints: 12450,
    preferences: [
      { icon: 'high_quality', label: 'High Floor' },
      { icon: 'coffee', label: 'Extra Espresso Pods' },
      { icon: 'vaping_rooms', label: 'Non-Smoking' }
    ],
    pastStays: [
      { date: 'Aug 2024', room: '405', total: 1200 },
      { date: 'May 2024', room: '202', total: 850 }
    ],
    internalNotes: 'Frequent traveler. Prefers rooms far from elevator due to light sleeping.'
  },
  {
    id: 'g2',
    name: 'John Smith',
    email: 'john.smith@gmail.com',
    phone: '+1 (555) 012-3456',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop',
    memberSince: 'Mar 2023',
    loyaltyTier: 'Gold',
    loyaltyPoints: 5200,
    preferences: [
      { icon: 'wine_bar', label: 'Red Wine Welcome' }
    ]
  },
  {
    id: 'g3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 (555) 011-2233',
    memberSince: 'Oct 2024',
    loyaltyTier: 'Bronze',
    loyaltyPoints: 450
  },
  {
    id: 'g4',
    name: 'Bob Smith',
    email: 'bob@smith.com',
    phone: '+1 (555) 012-7890',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1hqycs6SCh7t1Sniof4ElzoM6EC3Ri9XgFPNYow_G5Ag-B5wBejrMXAusrKEOQHH6U5qEWi3j__7xVqYe2PA1pGimA5GYwlD0sQwxQNTFdPZ3JtpgjO8Td6bum5axhkHo8AQQ4JoV86h5Ove6B1Eh-mAecYMo989zRWbthRYeUGuPGyUvADEeFeXhn-41FJ3m0L-xOo72eNP4XxDFa9gPLKyaE3LKvHmVfYSUQrpzw6IYmbeEWu-MpzSOaFUGD_tfG3A_Ccq30ek',
    memberSince: 'Jun 2023',
    loyaltyTier: 'Silver',
    loyaltyPoints: 2100
  }
];

export const ROOMS: Room[] = [
  { id: 'r101', number: '101', type: 'Standard King', floor: 1, pricePerNight: 250, status: RoomStatus.AVAILABLE, lastCleaned: 'Today, 10:00 AM' },
  { id: 'r102', number: '102', type: 'Standard Queen', floor: 1, pricePerNight: 180, status: RoomStatus.OCCUPIED, lastCleaned: 'Yesterday, 2:00 PM' },
  { id: 'r103', number: '103', type: 'Double Twin', floor: 1, pricePerNight: 150, status: RoomStatus.CLEANING, lastCleaned: '3 Days Ago' },
  { id: 'r104', number: '104', type: 'Deluxe Suite', floor: 1, pricePerNight: 450, status: RoomStatus.OCCUPIED, lastCleaned: 'Today, 8:00 AM' },
  { id: 'r105', number: '105', type: 'Suite', floor: 1, pricePerNight: 350, status: RoomStatus.MAINTENANCE, maintenanceNote: 'AC Repair' },
  { id: 'r106', number: '106', type: 'Standard King', floor: 1, pricePerNight: 250, status: RoomStatus.AVAILABLE, lastCleaned: 'Today, 11:30 AM' },
  { id: 'r107', number: '107', type: 'Double Twin', floor: 1, pricePerNight: 160, status: RoomStatus.OCCUPIED },
  { id: 'r108', number: '108', type: 'Standard King', floor: 1, pricePerNight: 240, status: RoomStatus.OCCUPIED },
  { id: 'r109', number: '109', type: 'Standard King', floor: 1, pricePerNight: 250, status: RoomStatus.AVAILABLE },
  { id: 'r110', number: '110', type: 'Double Twin', floor: 1, pricePerNight: 155, status: RoomStatus.CLEANING },
];

export const BOOKINGS: Booking[] = [
  {
    id: 'b1',
    ref: '#BK-8392',
    guest: GUESTS[2],
    room: ROOMS[3],
    checkIn: formatDate(dMinus2),
    checkOut: formatDate(dPlus2),
    guestsCount: '2 Adults',
    totalAmount: 450,
    depositPaid: 450,
    paymentStatus: PaymentStatus.PAID,
    status: BookingStatus.CONFIRMED
  },
  {
    id: 'b2',
    ref: '#BK-9102',
    guest: GUESTS[3],
    room: ROOMS[1],
    checkIn: formatDate(dPlus3),
    checkOut: formatDate(dPlus5),
    guestsCount: '1 Adult',
    totalAmount: 220,
    depositPaid: 0,
    paymentStatus: PaymentStatus.UNPAID,
    status: BookingStatus.PENDING
  }
];

export const ACTIVITIES: Activity[] = [
  { id: 'a1', timestamp: 'Just now', title: 'New Booking via Expedia', description: 'Guest: Robert Paulson for Room 101.', type: 'booking' },
  { id: 'a2', timestamp: '25 mins ago', title: 'Housekeeping Alert', description: 'Room 202 requested extra towels and cleanup.', type: 'housekeeping' },
  { id: 'a3', timestamp: '1 hour ago', title: 'VIP Check-in Complete', description: 'Sarah Connor has checked into Room 304.', type: 'vip' },
  { id: 'a4', timestamp: '3 hours ago', title: 'System Update', description: 'Nightly audit completed successfully.', type: 'system' }
];
