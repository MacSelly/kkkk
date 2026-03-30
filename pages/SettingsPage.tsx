
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext.tsx';
import { UserRole } from '../types.ts';

interface TeamMember {
  name: string;
  role: string;
  email: string;
  status: string;
}

interface SettingsPageProps {
  userRole?: UserRole;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('general');
  const { language, setLanguage, t } = useLanguage();

  // Platform Preferences State
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [isNightAuditEnabled, setIsNightAuditEnabled] = useState(false);

  // Team Management State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: 'James Anderson', role: 'General Manager', email: 'james.a@hmspro.com', status: 'Active' },
    { name: 'Alex Morgan', role: 'Receptionist', email: 'alex.m@hmspro.com', status: 'Active' },
    { name: 'Elena Rossi', role: 'Housekeeping Lead', email: 'elena.r@hmspro.com', status: 'On Break' },
  ]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    email: '',
    role: 'Receptionist'
  });

  // Sync Dark Mode with DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const allTabs = [
    { id: 'general', label: t('general'), icon: 'settings', roles: [UserRole.ADMIN_MANAGER] },
    { id: 'hotel', label: t('hotelProfile'), icon: 'apartment', roles: [UserRole.ADMIN_MANAGER] },
    { id: 'security', label: t('security'), icon: 'security', roles: [UserRole.ADMIN_MANAGER] },
    { id: 'team', label: t('teamMembers'), icon: 'badge', roles: [UserRole.ADMIN_MANAGER] },
    { id: 'billing', label: t('billing'), icon: 'credit_card', roles: [UserRole.ADMIN_MANAGER] },
  ];

  const tabs = allTabs.filter(tab => !userRole || tab.roles.includes(userRole));

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const formattedNextRenewal = nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleSaveGeneral = () => {
    alert('Preferences saved successfully.');
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: TeamMember = {
      ...newMemberData,
      status: 'Active'
    };
    setTeamMembers([...teamMembers, newMember]);
    setIsInviteModalOpen(false);
    setNewMemberData({ name: '', email: '', role: 'Receptionist' });
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-primary bg-primary/5 self-start px-3 py-1 rounded-full w-fit">
            <span>Core Systems</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="opacity-60">{t('settings')}</span>
          </nav>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">{t('systemSettings')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium max-w-xl">{t('settingsSummary')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sleek Vertical Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-3 shadow-xl shadow-slate-200/20 dark:shadow-none">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-[1.75rem] transition-all duration-300 relative group overflow-hidden whitespace-nowrap shrink-0 lg:shrink
                      ${activeTab === tab.id
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'}
                    `}
                  >
                    <span className={`material-symbols-outlined text-[24px] ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                      {tab.icon}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest">{tab.label}</span>
                    {activeTab === tab.id && (
                      <div className="absolute right-0 top-0 h-full w-1 bg-primary/40 blur-sm"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Status Info */}
            <div className="hidden lg:block bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2rem] p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Cloud Synced</p>
              <p className="text-xs text-slate-500 font-medium">Auto-backups are active and your data is secure.</p>
            </div>
          </div>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-200/10 dark:shadow-none overflow-hidden">
                <div className="p-10 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('platformPreferences')}</h3>
                    <p className="text-sm text-slate-500 mt-1">Refine your workspace aesthetics and operational behavior.</p>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Host: Node-01
                  </div>
                </div>

                <div className="p-5 sm:p-10 space-y-6 sm:space-y-10">
                  {/* Modern Dark Mode Group */}
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-300">
                    <div className="flex gap-6 items-center">
                      <div className="size-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[28px]">dark_mode</span>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('darkMode')}</p>
                        <p className="text-xs text-slate-500 mt-1">Synchronize themes across all system interfaces.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-6 sm:mt-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isDarkMode}
                        onChange={(e) => setIsDarkMode(e.target.checked)}
                      />
                      <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all duration-300 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Modern Night Audit Group */}
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-8 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-300">
                    <div className="flex gap-6 items-center">
                      <div className="size-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[28px]">update</span>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('nightAudit')}</p>
                        <p className="text-xs text-slate-500 mt-1">Enable automated ledger close-outs for optimized reporting.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-6 sm:mt-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isNightAuditEnabled}
                        onChange={(e) => setIsNightAuditEnabled(e.target.checked)}
                      />
                      <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all duration-300 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t('currency')}</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
                          <span className="material-symbols-outlined text-[20px]">payments</span>
                        </div>
                        <select className="w-full h-14 pl-12 pr-6 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all appearance-none cursor-pointer">
                          <option>USD ($) - US Dollar</option>
                          <option>EUR (€) - Euro</option>
                          <option>GBP (£) - British Pound</option>
                          <option>GHS (₵) - Ghana Cedi</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                          <span className="material-symbols-outlined">expand_more</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">{t('language')}</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
                          <span className="material-symbols-outlined text-[20px]">language</span>
                        </div>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as any)}
                          className="w-full h-14 pl-12 pr-6 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all appearance-none cursor-pointer"
                        >
                          <option value="en">English (US)</option>
                          <option value="es">Spanish (Español)</option>
                          <option value="fr">French (Français)</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                          <span className="material-symbols-outlined">expand_more</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  onClick={() => { setIsDarkMode(document.documentElement.classList.contains('dark')); setIsNightAuditEnabled(false); }}
                  className="h-16 px-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-300"
                >
                  {t('discardChanges')}
                </button>
                <button
                  onClick={handleSaveGeneral}
                  className="h-16 px-12 bg-primary text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-primary/20"
                >
                  {t('savePreferences')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'hotel' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl p-10 flex flex-col gap-12">
                <div className="flex flex-col sm:flex-row items-center gap-10">
                  <div className="relative group cursor-pointer shrink-0">
                    <div className="size-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden group-hover:border-primary transition-all duration-300">
                      <span className="material-symbols-outlined text-5xl text-slate-300 group-hover:text-primary transition-colors">add_photo_alternate</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 size-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">Property Brand Profile</h3>
                    <p className="text-sm text-slate-500 mt-3 font-medium">Define your hotel's administrative presence and visual identity.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Official Property Name</label>
                    <input type="text" defaultValue="HMS Pro Luxury Hotel" className="w-full h-14 px-6 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Registration Identifier</label>
                    <input type="text" defaultValue="HTL-2023-9821" className="w-full h-14 px-6 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all" />
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Operations Physical Address</label>
                    <textarea rows={3} defaultValue="1200 Ocean Drive, Miami Beach, FL 33139, United States" className="w-full p-6 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all resize-none" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Support Channel / Email</label>
                    <input type="email" defaultValue="hello@hmspro.com" className="w-full h-14 px-6 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Primary Hotline</label>
                    <input type="text" defaultValue="+1 (555) 123-4567" className="w-full h-14 px-6 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button className="h-16 px-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Update Hotel Profile</button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'security' && userRole === UserRole.ADMIN_MANAGER && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden">
                <div className="p-10 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Security & Shield</h3>
                    <p className="text-sm text-slate-500 mt-2">Managing access control and cryptographic protection layers.</p>
                  </div>
                  <div className="size-16 rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                    <span className="material-symbols-outlined text-[32px]">verified_user</span>
                  </div>
                </div>
                <div className="p-10 space-y-8">
                  <div className="group flex items-center justify-between p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100/50 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="size-16 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-primary shadow-xl group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[28px]">password</span>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Root Authentication</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Standard Password Access</p>
                      </div>
                    </div>
                    <button className="h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all">Update Key</button>
                  </div>

                  <div className="group flex items-center justify-between p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100/50 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-300 border-emerald-500/20">
                    <div className="flex items-center gap-6">
                      <div className="size-16 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[28px]">phonelink_lock</span>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">MFA / Two-Factor</p>
                        <p className="text-xs text-emerald-500 font-black uppercase tracking-widest mt-1">Multi-layered shield active</p>
                      </div>
                    </div>
                    <button className="h-12 px-6 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-all">Deactivate</button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'team' && userRole === UserRole.ADMIN_MANAGER && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Operational Personnel</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-widest">Active nodes: {teamMembers.length}</p>
                  </div>
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex h-12 items-center gap-3 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">group_add</span>
                    <span>Provision New Member</span>
                  </button>
                </div>
                <div className="p-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  {teamMembers.map((member, i) => (
                    <div key={i} className="p-4 flex items-center justify-between rounded-[1.5rem] bg-slate-50/30 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-800/50 transition-all group cursor-default">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 text-base uppercase border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                          {member.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white leading-none truncate">{member.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border ${member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                            member.status === 'On Break' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                              'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                          <div className={`size-1 rounded-full ${member.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                          {member.status === 'Active' ? 'Online' : 'Away'}
                        </span>
                        <button className="size-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-300 hover:text-primary transition-all shadow-sm border border-slate-100 dark:border-slate-800">
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && userRole === UserRole.ADMIN_MANAGER && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              {/* Modern Plan Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-slate-900 text-white rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl group border border-white/5">
                  <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 scale-150">
                    <span className="material-symbols-outlined text-[140px] text-white">bolt</span>
                  </div>
                  <div className="relative z-10 flex flex-col h-full">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] bg-primary/10 self-start px-4 py-1.5 rounded-full mb-8 border border-primary/20">Executive Enterprise</span>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-5xl font-black tracking-tighter leading-none">$499.00</span>
                      <span className="text-xs font-black uppercase tracking-widest opacity-40">Monthly Settle</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed">Limitless scaling, real-time node monitoring, and priority human support tier.</p>
                    <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/5 px-4 py-3 rounded-2xl border border-emerald-400/10 shadow-xl shadow-emerald-400/5">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      Renewal Sequence: {formattedNextRenewal}
                    </div>
                  </div>
                </section>

                <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[3.5rem] border border-slate-200/60 dark:border-slate-800/60 p-10 shadow-2xl">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">System Resources</h3>
                  <div className="space-y-8">
                    {[
                      { label: 'Licensed Units', used: 420, total: 1000, color: 'bg-primary' },
                      { label: 'Authorized Staff', used: 14, total: 50, color: 'bg-indigo-500' },
                      { label: 'Storage Cluster', used: 7.2, total: 50, unit: 'GB', color: 'bg-slate-900 dark:bg-slate-100' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="text-slate-900 dark:text-white/80">{item.used} / {item.total} {item.unit || ''}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${(item.used / item.total) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Enhanced Payment Card */}
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="size-16 rounded-[1.5rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                      <span className="material-symbols-outlined text-[32px]">credit_card</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Instrument</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized Billing Gateway</p>
                    </div>
                  </div>
                  <button className="h-12 px-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">Rotate Card</button>
                </div>
                <div className="p-10">
                  <div className="flex items-center gap-8 p-8 border border-primary/20 rounded-[2.5rem] bg-primary/5 hover:bg-primary/10 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
                      <span className="material-symbols-outlined text-[100px]">account_balance_wallet</span>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-2xl shrink-0">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 w-auto dark:invert dark:opacity-70" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-widest leading-none mb-2">•••• •••• •••• 4242</p>
                      <div className="flex gap-10">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiration</span>
                          <span className="text-xs font-black text-slate-600 dark:text-slate-400">04/2026</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tier</span>
                          <span className="text-xs font-black text-primary">BUSINESS SELECT</span>
                        </div>
                      </div>
                    </div>
                    <span className="ml-auto text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20 shadow-xl">Primary</span>
                  </div>
                </div>
              </section>

              {/* Minimal Billing Table */}
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-slate-100 dark:border-slate-800/50">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ledger History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Sequence ID</th>
                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Stamp</th>
                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Settlement Status</th>
                        <th className="p-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Value</th>
                        <th className="p-8 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {[
                        { id: `INV-${now.getFullYear()}-M1`, offset: 0 },
                        { id: `INV-${now.getFullYear()}-M2`, offset: 30 },
                        { id: `INV-${now.getFullYear()}-M3`, offset: 60 },
                      ].map((item, i) => {
                        const invDate = new Date(now);
                        invDate.setDate(now.getDate() - item.offset);
                        return (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                            <td className="p-8 text-xs font-mono font-black text-slate-400">{item.id}</td>
                            <td className="p-8 text-sm font-black text-slate-900 dark:text-white/80">{invDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="p-8">
                              <span className="px-5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                Settled
                              </span>
                            </td>
                            <td className="p-8 text-lg font-black text-slate-950 dark:text-white text-right tracking-tight">
                              $499.00
                            </td>
                            <td className="p-8 text-right">
                              <button className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Team Member Addition Modal */}
      {isInviteModalOpen && userRole === UserRole.ADMIN_MANAGER && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsInviteModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Provision Access</h3>
                  <p className="text-[9px] text-slate-400 mt-3 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                    Resource Authorization Terminal
                  </p>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all border border-slate-200 dark:border-slate-700 hover:rotate-90"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <form onSubmit={handleInviteMember} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Johnathan Sterling"
                        value={newMemberData.name}
                        onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                        className="w-full h-12 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Corporate Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                      </div>
                      <input
                        required
                        type="email"
                        placeholder="john@hms-pro.com"
                        value={newMemberData.email}
                        onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                        className="w-full h-12 pl-10 pr-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">System Privilege Tier</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                    </div>
                    <select
                      required
                      value={newMemberData.role}
                      onChange={(e) => setNewMemberData({ ...newMemberData, role: e.target.value })}
                      className="w-full h-12 pl-10 pr-10 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary/10 dark:text-white transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option>Manager</option>
                      <option>Receptionist</option>
                      <option>Housekeeping</option>
                      <option>Maintenance</option>
                      <option>General Manager</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 h-14 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-800"
                  >
                    Terminate
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] h-14 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 border border-primary/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Finalize Provisioning</span>
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 text-center border-t border-slate-100 dark:border-slate-800/50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">All members must verify identity via corporate SSO on first login.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
