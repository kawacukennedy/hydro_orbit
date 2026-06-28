import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Cpu,
  Droplets,
  History,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  Sprout,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useAlertsStore } from '../stores/alertsStore';
import { useAlerts, useSolarStatus } from '../hooks/useApi';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', shortcut: '1' },
  { label: 'My Farm', icon: Map, path: '/dashboard/farm/farm-1', shortcut: '2' },
  { label: 'Create Farm', icon: Sprout, path: '/dashboard/create-farm', shortcut: '3' },
  { label: 'Sensors', icon: Cpu, path: '/dashboard/sensors', shortcut: '4' },
  { label: 'Irrigation', icon: Droplets, path: '/dashboard/irrigation', shortcut: '5' },
  { label: 'History', icon: History, path: '/dashboard/history', shortcut: '6' },
  { label: 'Alerts', icon: Bell, path: '/dashboard/alerts', shortcut: '7' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings', shortcut: '8' },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount, setAlerts } = useAlertsStore();
  const { data: alertsData } = useAlerts();
  const { data: solar } = useSolarStatus();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (alertsData?.alerts) {
      setAlerts(alertsData.alerts as any);
    }
  }, [alertsData, setAlerts]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 to-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-emerald-600">Hydro-Orbit</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white/95 backdrop-blur-sm border-r transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b bg-gradient-to-r from-emerald-600 to-emerald-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">Hydro-Orbit</h1>
                <p className="text-xs text-emerald-200">Smart Irrigation System</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="text-sm">{item.label}</span>
                    {item.label === 'Alerts' && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-breathe">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                    {!isActive && item.shortcut && (
                      <span className="ml-auto text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ⌘{item.shortcut}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t bg-gray-50/80">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center ring-2 ring-emerald-200">
                <span className="text-emerald-700 font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.phone || ''}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-white hover:text-red-600 rounded-xl transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="hidden lg:flex items-center justify-between px-8 py-3 bg-white/95 backdrop-blur-sm border-b sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50">
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${isOnline ? 'text-emerald-600' : 'text-red-600'}`}>
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
            {solar?.isCharging && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-medium text-amber-600">Charging {solar?.power}W</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/alerts')}
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-bold items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <div className="text-right">
              <p className="text-xs font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500">Farmer</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center ml-1">
              <span className="text-emerald-700 font-bold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 pt-16 lg:pt-8 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
