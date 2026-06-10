import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const cards = [
  { to: '/connections', title: 'Connections',     desc: 'Connect your MongoDB or MySQL database', icon: '🔌' },
  { to: '/query',       title: 'Query Builder',   desc: 'Visually build and run DB queries',       icon: '🔍' },
  { to: '/generate',    title: 'Route Generator', desc: 'Auto-generate Express.js route files',    icon: '⚡' },
  { to: '/history',     title: 'Query History',   desc: 'See all your past queries',               icon: '📋' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Load connections and history counts in parallel
    Promise.all([
      api.get('/connections'),
      api.get('/query/history'),
    ])
      .then(([connRes, histRes]) => {
        setStats({
          connections: connRes.data.length,
          queries:     histRes.data.length,
          lastQuery:   histRes.data[0]
            ? new Date(histRes.data[0].createdAt).toLocaleString()
            : null,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          What would you like to build today?
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {loading ? (
          <div className="col-span-3 flex justify-center py-4">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Connections</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats?.connections ?? 0}
              </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Queries run</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats?.queries ?? 0}
              </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Last query</p>
              <p className="text-sm text-gray-400 mt-1">
                {stats?.lastQuery ?? 'None yet'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="bg-gray-900/50 border border-gray-800 hover:border-purple-800/50 rounded-lg p-6 transition-colors group"
          >
            <div className="text-2xl mb-3">{card.icon}</div>
            <h2 className="text-gray-200 font-medium mb-1 group-hover:text-white">
              {card.title}
            </h2>
            <p className="text-gray-600 text-sm">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Getting started guide */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-medium text-gray-400 mb-3">
          Getting started
        </h2>
        <ol className="text-sm text-gray-500 flex flex-col gap-2 list-decimal list-inside">
          <li>
            Go to{' '}
            <Link to="/connections" className="text-purple-400 hover:underline">
              Connections
            </Link>{' '}
            and add your MongoDB or MySQL database
          </li>
          <li>
            Head to{' '}
            <Link to="/query" className="text-purple-400 hover:underline">
              Query Builder
            </Link>{' '}
            and run your first visual query
          </li>
          <li>
            Use{' '}
            <Link to="/generate" className="text-purple-400 hover:underline">
              Route Generator
            </Link>{' '}
            to get ready-to-use Express route code
          </li>
        </ol>
      </div>
    </div>
  );
}