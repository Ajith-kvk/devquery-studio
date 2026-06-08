import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-purple-400 tracking-widest">DEVQUERY</h1>
          <p className="text-gray-600 text-sm mt-1">Studio</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 flex flex-col gap-4"
        >
          <h2 className="text-lg font-medium text-gray-200">Sign in</h2>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-600"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium transition-colors mt-1"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-xs text-gray-600 text-center">
            No account?{' '}
            <Link to="/register" className="text-purple-400 hover:underline">
              Register
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}