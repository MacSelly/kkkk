
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, User } from '../types.ts';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.ADMIN_MANAGER);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock user object based on selected role
    const mockUser: User = {
      name: activeRole === UserRole.ADMIN_MANAGER ? 'James Anderson' : 
            activeRole === UserRole.RECEPTIONIST ? 'Sarah Jenkins' :
            activeRole === UserRole.GUEST ? 'Michael Chen' : 'Alex Rivera',
      email: activeRole === UserRole.GUEST 
        ? 'michael.chen@gmail.com' 
        : `${activeRole.split('/')[0].toLowerCase()}@hms-pro.com`,
      role: activeRole,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop'
    };

    onLogin(mockUser);
    // Route each role to their appropriate landing page
    switch (activeRole) {
      case UserRole.GUEST:
        navigate('/guest-portal');
        break;
      case UserRole.HOUSEKEEPING:
        navigate('/housekeeping');
        break;
      case UserRole.RECEPTIONIST:
        navigate('/front-desk');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="h-screen flex w-full overflow-hidden">
      {/* Left Side: Hero Image */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtxFxApEp52-Uv2Gtq7Gztw5vZ1PprIar7JrR8aqNeMEClWh_zIwrxEf1bz2jFgFZ1NxEpOfb7lC_KLq2iO2Umtudy1Bydqo9fS2yXqzmimuiAjg-A0WkQC07-34rExGO2D8LIuxfgAN1ubdztZ4YuNiIOpIRlwLi9ORc1MbLUw78OggesvD3y8r2bVd3pb9Cq9XuJdayx3vQ8DFUnmDKUOuoeMRlCrYtUW4SrP7_IgO3TdOK_dbPnJKeZzQNsJTKbZEqlDro_OoU" 
          alt="Luxury hotel lobby" 
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-20 text-white z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <span className="material-symbols-outlined text-sm text-yellow-400">star</span>
              <span className="text-xs font-medium tracking-wide uppercase">Hospitality Excellence</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
              Manage your hotel operations with elegance and efficiency.
            </h2>
            <p className="text-lg text-slate-200/90">
              Streamline check-ins, housekeeping, and reservations all in one unified platform designed for modern hoteliers.
            </p>
            <div className="mt-8 flex items-center gap-8 border-t border-white/10 pt-8">
              <div>
                <p className="text-3xl font-bold">98%</p>
                <p className="text-sm text-slate-300">Guest Satisfaction</p>
              </div>
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-slate-300">System Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full lg:w-[45%] xl:w-[40%] relative z-10 shadow-xl overflow-hidden">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header / Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">hotel</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              HMS <span className="text-slate-400 font-medium">Pro</span>
            </h1>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              {([UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST, UserRole.GUEST, UserRole.HOUSEKEEPING] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`flex-1 pb-4 text-center text-xs sm:text-sm font-semibold focus:outline-none transition-colors border-b-2 ${
                    activeRole === role
                      ? 'text-primary border-primary'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border-transparent hover:border-slate-300'
                  }`}
                >
                  {role === UserRole.ADMIN_MANAGER ? 'Admin' : 
                   role === UserRole.RECEPTIONIST ? 'Front Desk' : 
                   role === UserRole.GUEST ? 'Guest' : 'Staff'}
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">Email Address</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                </div>
                <input
                  required
                  type="email"
                  defaultValue={
                    activeRole === UserRole.GUEST 
                      ? 'michael.chen@gmail.com' 
                      : `${activeRole.split('/')[0].toLowerCase()}@hms-pro.com`
                  }
                  className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white dark:bg-slate-800"
                  placeholder="name@hotel.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">Password</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                </div>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  defaultValue="password"
                  className="block w-full rounded-lg border-0 py-3 pl-10 pr-10 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white dark:bg-slate-800"
                  placeholder="••••••••"
                />
                <div 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer group"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800" />
                <label htmlFor="remember" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">Remember me</label>
              </div>
              <a href="#" className="text-sm font-medium text-primary hover:text-blue-500 transition-colors">Forgot password?</a>
            </div>

            <button type="submit" className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-bold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200">
              Sign in as {activeRole === UserRole.ADMIN_MANAGER ? 'Admin' : 
                          activeRole === UserRole.RECEPTIONIST ? 'Front Desk' : 
                          activeRole === UserRole.GUEST ? 'Guest' : 'Housekeeping'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white dark:bg-slate-900 px-6 text-slate-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                New employee? <a className="font-semibold text-primary hover:text-blue-500 transition-colors" href="#">Contact IT Support</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
