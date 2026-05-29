import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MdDirectionsCar, MdDashboard, MdBuild, MdAssignment,
  MdPayment, MdBarChart, MdLogout, MdMenu, MdClose, MdHome,
  MdChevronRight, MdNotifications, MdCheckCircle, MdWarning,
  MdAttachMoney, MdInfo,
} from 'react-icons/md';
import { FiUser, FiAlertTriangle } from 'react-icons/fi';

const navItems = [
  { to: '/app/dashboard',       label: 'Dashboard',       icon: MdDashboard    },
  { to: '/app/cars',            label: 'Cars',             icon: MdDirectionsCar },
  { to: '/app/services',        label: 'Services',         icon: MdBuild        },
  { to: '/app/service-records', label: 'Service Records',  icon: MdAssignment   },
  { to: '/app/payments',        label: 'Payments',         icon: MdPayment      },
  { to: '/app/reports',         label: 'Reports',          icon: MdBarChart     },
];

const pageTitles = {
  '/app/dashboard': 'Dashboard',
  '/app/cars': 'Cars',
  '/app/services': 'Services',
  '/app/service-records': 'Service Records',
  '/app/payments': 'Payments',
  '/app/reports': 'Reports',
};

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: MdCheckCircle, color: 'text-green-400', text: 'Payment received — RAB 123B', time: '2m ago' },
  { id: 2, icon: MdWarning, color: 'text-yellow-400', text: 'Service record #SRV004 is unpaid', time: '15m ago' },
  { id: 3, icon: MdAttachMoney, color: 'text-purple-400', text: 'Daily report: RWF 125,000 collected', time: '1h ago' },
  { id: 4, icon: MdInfo, color: 'text-blue-400', text: 'New car registered — RDF 456C', time: '2h ago' },
];

function NotiBell() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-700 transition-all"
      >
        <MdNotifications size={22} />
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-[10px] font-bold text-white flex items-center justify-center">
          {MOCK_NOTIFICATIONS.length}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50" onClick={e => e.stopPropagation()}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Notifications</p>
            <span className="text-xs text-purple-600 font-medium cursor-pointer hover:underline">{MOCK_NOTIFICATIONS.length} new</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {MOCK_NOTIFICATIONS.map(n => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                <div className={`mt-0.5 ${n.color}`}><n.icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100 text-center">
            <button className="text-xs text-purple-600 font-medium hover:underline">View all notifications</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [open, setOpen]  = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const title = pageTitles[location.pathname] || 'SmartPark CRPMS';
    document.title = `${title} · SmartPark CRPMS`;
  }, [location.pathname]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const breadcrumbs = (() => {
    const crumbs = [{ label: 'Home', to: '/' }];
    const title = pageTitles[location.pathname];
    if (title) {
      crumbs.push({ label: title, to: location.pathname });
    }
    return crumbs;
  })();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <FiAlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">Confirm Logout</h3>
                <p className="text-sm text-gray-500">Are you sure you want to sign out?</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <MdLogout size={16} /> Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white shrink-0">
        <SidebarContent user={user} onLogout={() => setShowLogoutModal(true)} onClose={null} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex flex-col w-72 h-full bg-gradient-to-b from-purple-900 to-purple-800 text-white">
            <SidebarContent user={user} onLogout={() => { setOpen(false); setShowLogoutModal(true); }} onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 shadow-sm shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden text-gray-500 hover:text-purple-600">
            <MdMenu size={24} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.to} className="flex items-center gap-1.5">
                  {i > 0 && <MdChevronRight size={14} className="text-gray-300" />}
                  {i < breadcrumbs.length - 1 ? (
                    <button onClick={() => navigate(crumb.to)} className="hover:text-purple-600 transition-colors">{crumb.label}</button>
                  ) : (
                    <span className="text-gray-600 font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">{pageTitles[location.pathname] || 'Car Repair Management System'}</h2>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <NotiBell />
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 rounded-full pl-3 pr-1 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="hidden sm:inline text-xs font-medium">Online</span>
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center ml-1">
                <FiUser size={14} className="text-white" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ user, onLogout, onClose }) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-6 border-b border-purple-700">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
          <MdDirectionsCar className="text-white text-2xl" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-lg leading-tight">SmartPark</h1>
          <p className="text-purple-300 text-xs">CRPMS v1.0</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-purple-300 hover:text-white">
            <MdClose size={22} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose || undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-purple-800 shadow-md'
                  : 'text-purple-200 hover:bg-purple-700 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-2 border-t border-purple-700">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-200 hover:bg-purple-700 hover:text-white transition-all duration-150"
        >
          <MdHome size={18} />
          Home
        </NavLink>
      </div>

      <div className="px-4 py-4 border-t border-purple-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <FiUser size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username}</p>
            <p className="text-purple-300 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-200 hover:bg-red-500 hover:text-white transition-all duration-150"
        >
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </>
  );
}
