import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.tsx';
import { useData } from '../DataContext.tsx';
import { User } from '../types.ts';

interface NavbarProps {
  user: User | null;
  onLogout?: () => void;
  onSidebarToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onSidebarToggle }) => {
  if (!user) return null;
  const { t } = useLanguage();
  const { activities } = useData();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'housekeeping': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'vip': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'calendar_month';
      case 'housekeeping': return 'cleaning_services';
      case 'vip': return 'auto_awesome';
      default: return 'info';
    }
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-20 sticky top-0 shrink-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile hamburger */}
        <button 
          onClick={onSidebarToggle}
          className="lg:hidden size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary transition-colors shrink-0"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input 
            className="block w-full h-10 pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm transition-all" 
            placeholder={t('searchPlaceholder')} 
            type="text" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setHasUnread(false); }}
            className={`relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 ${isNotificationsOpen ? 'text-primary bg-slate-100 dark:bg-slate-800' : ''}`}
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {hasUnread && (
              <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            )}
          </button>

          {isNotificationsOpen && (
          <div className="absolute right-0 sm:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${getIconColor(activity.type)}`}>
                        <span className="material-symbols-outlined text-[18px]">{getIcon(activity.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{activity.title}</p>
                          <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">{activity.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left ${isProfileOpen ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
          >
            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center ring-2 ring-white dark:ring-slate-800 shadow-sm" 
                 style={{ backgroundImage: `url('${user.avatar}')` }}>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{user.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.role}</p>
                <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
              </div>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-[100]">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="py-2">
                <button 
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-bold"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  {t('sign_out')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;