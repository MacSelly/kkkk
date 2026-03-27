import React, { useState, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.tsx';
import Navbar from './components/Navbar.tsx';
import { LanguageProvider } from './LanguageContext.tsx';
import { DataProvider } from './DataContext.tsx';
import { User, UserRole } from './types.ts';

// Lazy loading pages for massive initial payload reductions
const LoginPage = React.lazy(() => import('./pages/LoginPage.tsx'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage.tsx'));
const BookingsPage = React.lazy(() => import('./pages/BookingsPage.tsx'));
const RoomsPage = React.lazy(() => import('./pages/RoomsPage.tsx'));
const GuestsPage = React.lazy(() => import('./pages/GuestsPage.tsx'));
const FinancePage = React.lazy(() => import('./pages/FinancePage.tsx'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage.tsx'));
const FrontDeskPage = React.lazy(() => import('./pages/FrontDeskPage.tsx'));
const HousekeepingPage = React.lazy(() => import('./pages/HousekeepingPage.tsx'));
const GuestPortalPage = React.lazy(() => import('./pages/GuestPortalPage.tsx'));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-slate-900 z-50">
    <div className="size-10 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-primary animate-spin"></div>
  </div>
);

const DashboardLayout: React.FC<{ children: React.ReactNode; user: User | null; onLogout: () => void }> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (!user) return null;
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar isOpen={sidebarOpen} userRole={user.role} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark">
        <Navbar user={user} onLogout={onLogout} onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const FrontDeskLayout: React.FC<{ children: React.ReactNode; user: User | null }> = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (!user) return null;
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar isOpen={sidebarOpen} userRole={user.role} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
};

// RBAC Protected Route Component
const ProtectedRoute: React.FC<{ 
  user: User | null; 
  allowedRoles: UserRole[]; 
  children: React.ReactElement 
}> = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    // Redirect cleanly depending on token
    if (user.role === UserRole.GUEST) return <Navigate to="/guest-portal" replace />;
    if (user.role === UserRole.HOUSEKEEPING) return <Navigate to="/housekeeping" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  return (
    <LanguageProvider>
      <DataProvider>
        <HashRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute user={currentUser} allowedRoles={[UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST]}>
                  <DashboardLayout user={currentUser} onLogout={handleLogout}>
                    <DashboardPage userRole={currentUser?.role} />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/bookings" element={
                <ProtectedRoute user={currentUser} allowedRoles={[UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST]}>
                  <DashboardLayout user={currentUser} onLogout={handleLogout}>
                    <BookingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/rooms" element={
                <ProtectedRoute user={currentUser} allowedRoles={[UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST]}>
                  <DashboardLayout user={currentUser} onLogout={handleLogout}>
                    <RoomsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/guests" element={
                <ProtectedRoute user={currentUser} allowedRoles={[UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST]}>
                  <DashboardLayout user={currentUser} onLogout={handleLogout}>
                    <GuestsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/finance" element={
                <ProtectedRoute user={currentUser} allowedRoles={[UserRole.ADMIN_MANAGER]}>
                  <DashboardLayout user={currentUser} onLogout={handleLogout}>
                    <FinancePage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute user={currentUser} allowedRoles={[UserRole.ADMIN_MANAGER]}>
                  <DashboardLayout user={currentUser} onLogout={handleLogout}>
                    <SettingsPage userRole={currentUser?.role} />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/front-desk" element={
                <ProtectedRoute user={currentUser} allowedRoles={[UserRole.ADMIN_MANAGER, UserRole.RECEPTIONIST]}>
                  <FrontDeskLayout user={currentUser}>
                    <FrontDeskPage onLogout={handleLogout} />
                  </FrontDeskLayout>
                </ProtectedRoute>
              } />

              <Route path="/housekeeping" element={
                <ProtectedRoute user={currentUser} allowedRoles={[UserRole.ADMIN_MANAGER, UserRole.HOUSEKEEPING]}>
                  <DashboardLayout user={currentUser} onLogout={handleLogout}>
                    <HousekeepingPage onLogout={handleLogout} />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/guest-portal" element={
                <ProtectedRoute user={currentUser} allowedRoles={[UserRole.GUEST]}>
                  <DashboardLayout user={currentUser} onLogout={handleLogout}>
                    <GuestPortalPage user={currentUser} onLogout={handleLogout} />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to={
                currentUser?.role === UserRole.GUEST ? "/guest-portal" :
                currentUser?.role === UserRole.HOUSEKEEPING ? "/housekeeping" :
                currentUser ? "/dashboard" : "/login"
              } replace />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </DataProvider>
    </LanguageProvider>
  );
};

export default App;