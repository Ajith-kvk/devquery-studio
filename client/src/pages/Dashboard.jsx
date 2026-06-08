import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-purple-400 mb-2">Welcome, {user?.name}! 👋</h1>
        <p className="text-gray-500 text-sm mb-6">You are logged in as {user?.email}</p>
        <button
          onClick={handleLogout}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-4 py-2 text-sm transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}