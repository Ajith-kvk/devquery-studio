import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [type, setType] = useState('mongodb');
  const [name, setName] = useState('');
  const [mongoUri, setMongoUri] = useState('');
  const [mysqlForm, setMysqlForm] = useState({
    host: '', port: '3306', user: '', password: '', database: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load saved connections when page opens
  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data } = await api.get('/connections');
      setConnections(data);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const credentials =
        type === 'mongodb' ? { uri: mongoUri } : mysqlForm;

      const { data } = await api.post('/connections', {
        name,
        type,
        credentials
      });

      // Add to list without refetching
      setConnections((prev) => [...prev, data]);
      setSuccess(
        `Connected! Found ${data.collections.length} collection(s): ${data.collections.slice(0, 3).join(', ')}${data.collections.length > 3 ? '...' : ''}`
      );

      // Reset the form
      setName('');
      setMongoUri('');
      setMysqlForm({ host: '', port: '3306', user: '', password: '', database: '' });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this connection?')) return;
    try {
      await api.delete(`/connections/${id}`);
      setConnections((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert('Failed to delete connection');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] p-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-xl font-bold text-gray-100 mb-6">
          🔌 Connections
        </h1>

        {/* ── Add Connection Form ── */}
        <form
          onSubmit={handleAdd}
          className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 mb-8 flex flex-col gap-4"
        >
          <h2 className="text-sm font-medium text-gray-400">
            Add new connection
          </h2>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/50 rounded p-3">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 text-sm bg-green-900/20 border border-green-800/50 rounded p-3">
              ✅ {success}
            </div>
          )}

          {/* Name + Type row */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-500">Connection name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-600"
                placeholder="e.g. My App DB"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-600"
              >
                <option value="mongodb">MongoDB</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>
          </div>

          {/* MongoDB fields */}
          {type === 'mongodb' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">MongoDB URI</label>
              <input
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-600 font-mono"
                placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
                required
              />
              <p className="text-xs text-gray-600">
                Get this from MongoDB Atlas → Connect → Drivers
              </p>
            </div>
          )}

          {/* MySQL fields */}
          {type === 'mysql' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ['host', 'Host', 'localhost'],
                ['port', 'Port', '3306'],
                ['user', 'Username', 'root'],
                ['password', 'Password', ''],
                ['database', 'Database name', 'mydb']
              ].map(([key, label, placeholder]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{label}</label>
                  <input
                    type={key === 'password' ? 'password' : 'text'}
                    value={mysqlForm[key]}
                    onChange={(e) =>
                      setMysqlForm({ ...mysqlForm, [key]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-600"
                    required
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded px-4 py-2 text-sm font-medium transition-colors self-start"
          >
            {loading ? 'Testing connection...' : 'Test & save connection'}
          </button>
        </form>

        {/* ── Saved Connections List ── */}
        <h2 className="text-sm font-medium text-gray-400 mb-3">
          Saved connections
        </h2>

        {fetching ? (
          <p className="text-gray-600 text-sm">Loading...</p>
        ) : connections.length === 0 ? (
          <p className="text-gray-600 text-sm">
            No connections yet. Add one above.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {connections.map((conn) => (
              <div
                key={conn._id}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        conn.type === 'mongodb'
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-blue-900/50 text-blue-400'
                      }`}
                    >
                      {conn.type}
                    </span>
                    <span className="text-sm font-medium text-gray-200">
                      {conn.name}
                    </span>
                    <span className="text-xs text-green-400">
                      ● {conn.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {conn.collections.length} collection
                    {conn.collections.length !== 1 ? 's' : ''}:{' '}
                    {conn.collections.slice(0, 5).join(', ')}
                    {conn.collections.length > 5 ? '...' : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(conn._id)}
                  className="text-gray-600 hover:text-red-400 text-xs transition-colors ml-4 shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}