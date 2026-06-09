import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⬛' },
  { to: '/connections', label: 'Connections', icon: '🔌' },
  { to: '/query', label: 'Query Builder', icon: '🗄️' },
  { to: '/generate', label: 'Route Generator', icon: '⚡' },
  { to: '/history', label: 'History', icon: '📋' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0f0f10] text-gray-200">

      {/* Sidebar */}
      <aside className="w-56 border-r border-gray-800 flex flex-col p-4 shrink-0">
        <div className="mb-8">
          <h1 className="text-sm font-bold text-purple-400 tracking-widest uppercase">
            DevQuery
          </h1>
          <p className="text-xs text-gray-600">Studio</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${isActive
                  ? 'bg-purple-900/40 text-purple-300 border border-purple-800/50'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/50'
                }`
              }
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800 pt-4 mt-4">
          <p className="text-xs text-gray-600 mb-2 px-2 truncate">
            {user?.name}
          </p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:text-red-400 hover:bg-gray-800/50 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

    </div>
  );
}