import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    frontDesk: 'Front Desk',
    bookings: 'Bookings',
    rooms: 'Rooms',
    guests: 'Guests',
    finance: 'Finance',
    settings: 'Settings',
    searchPlaceholder: 'Search guests, rooms, or bookings...',
    sign_out: 'Sign Out',
    // Dashboard
    welcomeMessage: 'Welcome back,',
    daySummary: 'Here is what is happening at your property today.',
    todayArrivals: 'Arrivals Today',
    todayDepartures: 'Departures Today',
    vipGuests: 'VIP Guests',
    newBooking: 'New Booking',
    checkIn: 'Check-In',
    inventory: 'Inventory',
    revenueToday: 'Revenue Today',
    occupancy: 'Occupancy',
    adr: 'Avg Daily Rate',
    revpar: 'RevPAR',
    // Settings
    systemSettings: 'System Settings',
    settingsSummary: 'Configure your platform preferences and manage organizational details.',
    general: 'General',
    hotelProfile: 'Hotel Profile',
    security: 'Security',
    teamMembers: 'Team Members',
    billing: 'Plan & Billing',
    platformPreferences: 'Platform Preferences',
    darkMode: 'Dark Mode Appearance',
    nightAudit: 'Automatic Night Audit',
    currency: 'Default Currency',
    language: 'Default Language',
    savePreferences: 'Save Preferences',
    discardChanges: 'Discard Changes',
    // Rooms
    roomsInventory: 'Rooms Inventory',
    roomsSummary: 'Manage property assets, maintenance schedules, and configuration.',
    registerNewRoom: 'Register New Room',
    totalInventory: 'Total Inventory',
    readyToSell: 'Ready to Sell',
    inCleanup: 'In Cleanup',
    outOfOrder: 'Out of Order',
    // Bookings
    reservations: 'Reservations',
    bookingsSummary: 'Manage and monitor all hotel guest bookings and stay cycles.',
    exportPDF: 'Export PDF',
    // Guests
    guestDirectory: 'Guest Directory',
    guestsSummary: 'Manage guest profiles, loyalty status, and historical data.',
    registerProfile: 'Register New Profile',
    // Finance
    financialIntelligence: 'Financial Intelligence',
    financeSummary: 'Real-time revenue monitoring and transaction reconciliation.',
    totalRevenue: 'Total Revenue',
    operatingCosts: 'Operating Costs',
    netProfit: 'Net Profit',
    exportReport: 'Export Report',
    // Front Desk Specific
    fullTrace: 'Full Trace',
    auditTrail: 'Audit Trail',
    lifecycleDescription: 'Historical record of all events, sensor triggers, and staff actions.'
  },
  es: {
    // Nav
    dashboard: 'Tablero',
    frontDesk: 'Recepción',
    bookings: 'Reservas',
    rooms: 'Habitaciones',
    guests: 'Huéspedes',
    finance: 'Finanzas',
    settings: 'Ajustes',
    searchPlaceholder: 'Buscar huéspedes, habitaciones o reservas...',
    sign_out: 'Cerrar Sesión',
    // Dashboard
    welcomeMessage: 'Bienvenido de nuevo,',
    daySummary: 'Esto es lo que está pasando en su propiedad hoy.',
    todayArrivals: 'Llegadas de Hoy',
    todayDepartures: 'Salidas de Hoy',
    vipGuests: 'Huéspedes VIP',
    newBooking: 'Nueva Reserva',
    checkIn: 'Registrar Entrada',
    inventory: 'Inventario',
    revenueToday: 'Ingresos de Hoy',
    occupancy: 'Ocupación',
    adr: 'Tarifa Diaria Promedio',
    revpar: 'RevPAR',
    // Settings
    systemSettings: 'Ajustes del Sistema',
    settingsSummary: 'Configure sus preferencias de plataforma y gestione detalles organizativos.',
    general: 'General',
    hotelProfile: 'Perfil del Hotel',
    security: 'Seguridad',
    teamMembers: 'Miembros del Equipo',
    billing: 'Plan y Facturación',
    platformPreferences: 'Preferencias de Plataforma',
    darkMode: 'Apariencia de Modo Oscuro',
    nightAudit: 'Auditoría Nocturna Automática',
    currency: 'Moneda Predeterminada',
    language: 'Idioma Predeterminado',
    savePreferences: 'Guardar Preferencias',
    discardChanges: 'Descartar Cambios',
    // Rooms
    roomsInventory: 'Inventario de Habitaciones',
    roomsSummary: 'Gestione activos de la propiedad, horarios de mantenimiento y configuración.',
    registerNewRoom: 'Registrar Nueva Habitación',
    totalInventory: 'Inventario Total',
    readyToSell: 'Lista para Vender',
    inCleanup: 'En Limpieza',
    outOfOrder: 'Fuera de Servicio',
    // Bookings
    reservations: 'Reservas',
    bookingsSummary: 'Gestione y supervise todas las reservas de huéspedes y ciclos de estancia.',
    exportPDF: 'Exportar PDF',
    // Guests
    guestDirectory: 'Directorio de Huéspedes',
    guestsSummary: 'Gestione perfiles de huéspedes, estado de lealtad y datos históricos.',
    registerProfile: 'Registrar Nuevo Perfil',
    // Finance
    financialIntelligence: 'Inteligencia Financiera',
    financeSummary: 'Monitoreo de ingresos en tiempo real y conciliación de transacciones.',
    totalRevenue: 'Ingresos Totales',
    operatingCosts: 'Costos Operativos',
    netProfit: 'Beneficio Neto',
    exportReport: 'Exportar Informe',
    // Front Desk Specific
    fullTrace: 'Seguimiento Completo',
    auditTrail: 'Pista de Auditoría',
    lifecycleDescription: 'Registro histórico de todos los eventos, activadores de sensores y acciones del personal.'
  },
  fr: {
    // Nav
    dashboard: 'Tableau de bord',
    frontDesk: 'Réception',
    bookings: 'Réservations',
    rooms: 'Chambres',
    guests: 'Clients',
    finance: 'Finance',
    settings: 'Paramètres',
    searchPlaceholder: 'Rechercher des clients, chambres...',
    sign_out: 'Déconnexion',
    // Dashboard
    welcomeMessage: 'Bon retour,',
    daySummary: 'Voici ce qui se passe dans votre établissement aujourd\'hui.',
    todayArrivals: 'Arrivées aujourd\'hui',
    todayDepartures: 'Départs aujourd\'hui',
    vipGuests: 'Clients VIP',
    newBooking: 'Nouvelle Réservation',
    checkIn: 'Enregistrement',
    inventory: 'Inventaire',
    revenueToday: 'Revenu du jour',
    occupancy: 'Occupation',
    adr: 'Prix Moyen',
    revpar: 'RevPAR',
    // Settings
    systemSettings: 'Paramètres Système',
    settingsSummary: 'Configurez vos préférences de plateforme et gérez les détails de l\'organisation.',
    general: 'Général',
    hotelProfile: 'Profil de l\'Hôtel',
    security: 'Sécurité',
    teamMembers: 'Membres de l\'Équipe',
    billing: 'Plan et Facturation',
    platformPreferences: 'Préférences de Plateforme',
    darkMode: 'Apparence Mode Sombre',
    nightAudit: 'Audit de Nuit Automatique',
    currency: 'Devise par Défaut',
    language: 'Langue par Défaut',
    savePreferences: 'Enregistrer les Préférences',
    discardChanges: 'Annuler les Changements',
    // Rooms
    roomsInventory: 'Inventaire des Chambres',
    roomsSummary: 'Gérez les actifs de la propriété, les horaires d\'entretien et la configuration.',
    registerNewRoom: 'Enregistrer une Chambre',
    totalInventory: 'Inventaire Total',
    readyToSell: 'Prête à la Vente',
    inCleanup: 'En Nettoyage',
    outOfOrder: 'Hors Service',
    // Bookings
    reservations: 'Réservations',
    bookingsSummary: 'Gérez et surveillez toutes les réservations des clients et les cycles de séjour.',
    exportPDF: 'Exporter en PDF',
    // Guests
    guestDirectory: 'Répertoire des Clients',
    guestsSummary: 'Gérez les profils des clients, le statut de fidélité et les données historiques.',
    registerProfile: 'Enregistrer un Profil',
    // Finance
    financialIntelligence: 'Intelligence Financière',
    financeSummary: 'Suivi des revenus en temps réel et rapprochement des transactions.',
    totalRevenue: 'Revenu Total',
    operatingCosts: 'Coûts d\'Exploitation',
    netProfit: 'Bénéfice Net',
    exportReport: 'Exporter le Rapport',
    // Front Desk Specific
    fullTrace: 'Traçabilité Complète',
    auditTrail: 'Piste d\'Audit',
    lifecycleDescription: 'Historique de tous les événements, déclencheurs de capteurs et actions du personnel.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
