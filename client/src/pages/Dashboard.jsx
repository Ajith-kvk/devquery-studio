import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const cards = [
  { to: '/connections', title: 'Connections', desc: 'Connect your MongoDB or MySQL database', icon: '🔌' },
  { to: '/query', title: 'Query Builder', desc: 'Visually build and run DB queries', icon: '🔍' },
  { to: '/generate', title: 'Route Generator', desc: 'Auto-generate Express.js route files', icon: '⚡' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          What would you like to build today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
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
          <li>Head to Query Builder and run a visual query</li>
          <li>Use Route Generator to get ready-to-use Express code</li>
        </ol>
      </div>
    </div>
  );
}