
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { mockBackend } from './services/mockBackend';
import { User, UserRole } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ActivityLogging from './pages/ActivityLogging';
import Approvals from './pages/Approvals';
import TargetControl from './pages/TargetControl';
import Certificates from './pages/Certificates';
import AuditTrail from './pages/AuditTrail';
import UserManagement from './pages/UserManagement';
import Leaderboard from './pages/Leaderboard';
import Reports from './pages/Reports';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockBackend.init();
    const session = localStorage.getItem('ecotrack_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('ecotrack_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ecotrack_session');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-indigo-600 animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-2xl animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        {user ? (
          <AuthenticatedLayout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              
              {/* Employee Menu */}
              <Route path="/activity" element={
                user.role === UserRole.EMPLOYEE ? <ActivityLogging user={user} /> : <Navigate to="/" />
              } />
              
              {/* Manager & Admin Menu */}
              <Route path="/approvals" element={
                (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) 
                ? <Approvals user={user} /> 
                : <Navigate to="/" />
              } />
              
              {/* Shared Menus */}
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/certificates" element={<Certificates user={user} />} />
              
              {/* Manager & Admin Reports */}
              <Route path="/reports" element={
                (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) 
                ? <Reports user={user} /> 
                : <Navigate to="/" />
              } />
              
              {/* Admin Menu Only */}
              <Route path="/target-control" element={
                user.role === UserRole.ADMIN ? <TargetControl user={user} /> : <Navigate to="/" />
              } />
              <Route path="/users" element={
                user.role === UserRole.ADMIN ? <UserManagement /> : <Navigate to="/" />
              } />
              <Route path="/audit" element={
                user.role === UserRole.ADMIN ? <AuditTrail /> : <Navigate to="/" />
              } />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AuthenticatedLayout>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

const AuthenticatedLayout: React.FC<{ user: User; onLogout: () => void; children: React.ReactNode }> = ({ user, onLogout, children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const NavItem = ({ to, label, icon }: { to: string, label: string, icon: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center px-6 py-4 rounded-2xl group transition-all duration-300 ${isActive ? 'bg-indigo-50/50' : ''}`}
      >
        <span className={`p-3 rounded-xl transition-all shadow-sm ${isActive ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white'}`}>
          {icon}
        </span>
        <span className={`ml-4 font-bold text-sm tracking-wide ${isActive ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-600'}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-100 shadow-2xl shadow-slate-200/50 p-8 z-40">
        <div className="flex items-center space-x-3 mb-12 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
            E+
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">EcoTrack+</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem to="/" label="Dashboard" icon={<IconDashboard />} />
          
          {user.role === UserRole.EMPLOYEE && (
            <NavItem to="/activity" label="Activity Logs" icon={<IconActivity />} />
          )}

          {(user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) && (
            <NavItem to="/approvals" label="Approvals" icon={<IconChecklist />} />
          )}

          <NavItem to="/leaderboard" label="Leaderboard" icon={<IconLeaderboard />} />

          {user.role === UserRole.ADMIN && (
            <NavItem to="/target-control" label="Target Control" icon={<IconTarget />} />
          )}

          {user.role === UserRole.ADMIN && (
            <NavItem to="/users" label="User Governance" icon={<IconUsers />} />
          )}

          {(user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) && (
            <NavItem to="/reports" label="Reports" icon={<IconReports />} />
          )}

          <NavItem to="/certificates" label="Certificates" icon={<IconCert />} />

          {user.role === UserRole.ADMIN && (
            <NavItem to="/audit" label="Audit Trail" icon={<IconAudit />} />
          )}
        </nav>

        <div className="mt-auto space-y-8">
           <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-lg font-black text-indigo-600 border border-slate-100 uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest">{user.role}</p>
              </div>
           </div>
           <button 
             onClick={onLogout}
             className="w-full flex items-center justify-center space-x-2 py-4 text-xs font-black tracking-widest text-rose-500 uppercase hover:text-rose-600 transition-colors"
           >
             <span>Logout</span>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
           </button>
        </div>
      </aside>

      {/* Main Content with Top Header for extra visibility */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-10 py-4 flex items-center justify-between lg:justify-end z-30">
          <div className="lg:hidden flex items-center space-x-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">E+</div>
             <span className="font-black text-slate-900">EcoTrack+</span>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={onLogout}
              className="flex items-center space-x-2 px-6 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 hover:border-rose-100 group shadow-sm"
            >
              <span>Logout to Home</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 md:p-14">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// SVG Icons
const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconActivity = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconChecklist = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const IconLeaderboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const IconTarget = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const IconReports = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconCert = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const IconAudit = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

export default App;
