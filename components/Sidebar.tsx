
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.tsx';
import { UserRole } from '../types.ts';

interface SidebarProps {
  isOpen: boolean;
  userRole?: UserRole;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, userRole, onToggle }) => {
  const { t } = useLanguage();
  
  const navItems = [
    { label: t('dashboard'), icon: 'dashboard', path: '/dashboard', roles: [UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST] },
    { label: t('frontDesk'), icon: 'apartment', path: '/front-desk', roles: [UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST] },
    { label: t('bookings'), icon: 'calendar_month', path: '/bookings', roles: [UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST] },
    { label: t('rooms'), icon: 'bed', path: '/rooms', roles: [UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST] },
    { label: t('guests'), icon: 'group', path: '/guests', roles: [UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST] },
    { label: t('finance'), icon: 'payments', path: '/finance', roles: [UserRole.ADMIN_MANAGER] },
    { label: t('settings'), icon: 'settings', path: '/settings', roles: [UserRole.ADMIN_MANAGER] },
    { label: 'Staff Operations', icon: 'cleaning_services', path: '/housekeeping', roles: [UserRole.HOUSEKEEPING] },
    { label: 'Guest Portal', icon: 'concierge', path: '/guest-portal', roles: [UserRole.GUEST] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40
        w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        flex flex-col shrink-0 h-full transition-transform duration-300
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="bg-primary flex items-center justify-center rounded-lg size-10 shrink-0 shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white">apartment</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight truncate">HMS Pro</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-tighter">
                {userRole || 'Admin'} Panel
              </p>
            </div>
            {/* Close button (mobile only) */}
            <button 
              onClick={onToggle}
              className="ml-auto lg:hidden size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => {
                  // Auto-close sidebar on mobile after navigating
                  if (window.innerWidth < 1024 && onToggle) onToggle();
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
                  ${isActive && item.path !== '#' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                `}
              >
                <span className={`material-symbols-outlined text-[22px] transition-colors`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
