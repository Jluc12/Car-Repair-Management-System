import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MdDirectionsCar, MdDashboard, MdBuild, MdAssignment,
  MdPayment, MdBarChart, MdLogout, MdMenu, MdClose, MdHome,
} from 'react-icons/md';
import { FiUser } from 'react-icons/fi';

const navItems = [
  { to: '/app/dashboard',       label: 'Dashboard',       icon: MdDashboard    },
  { to: '/app/cars',            label: 'Cars',             icon: MdDirectionsCar },
  { to: '/app/services',        label: 'Services',         icon: MdBuild        },
  { to: '/app/service-records', label: 'Service Records',  icon: MdAssignment   },
  { to: '/app/payments',        label: 'Payments',         icon: MdPayment      },
  { to: '/app/reports',         label: 'Reports',          icon: MdBarChart     },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white shrink-0">
        <SidebarContent user={user} onLogout={handleLogout} onClose={null} />
      </aside>

      {/* ── Mobile Overlay ── */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex flex-col w-72 h-full bg-gradient-to-b from-purple-900 to-purple-800 text-white">
            <SidebarContent user={user} onLogout={handleLogout} onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center gap-4 shadow-sm shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden text-gray-500 hover:text-purple-600">
            <MdMenu size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Car Repair Management System</h2>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Online</span>
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
      {/* Logo */}
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

      {/* Nav links */}
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

      {/* Home button */}
      <div className="px-4 py-2 border-t border-purple-700">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-purple-200 hover:bg-purple-700 hover:text-white transition-all duration-150"
        >
          <MdHome size={18} />
          Home
        </NavLink>
      </div>

      {/* User + Logout */}
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
