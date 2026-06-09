import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/query/history')
      .then(({ data }) => setHistory(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s) =>
    s === 'success' ? 'text-green-400' : 'text-red-400';

  const opColor = (op) => {
    const map = {
      find:   'bg-blue-900/50 text-blue-400',
      insert: 'bg-green-900/50 text-green-400',
      update: 'bg-amber-900/50 text-amber-400',
      delete: 'bg-red-900/50 text-red-400',
    };
    return map[op] || 'bg-gray-800 text-gray-400';
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100 mb-6">Query History</h1>

      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : history.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm">
            No queries yet. Run one from the Query Builder.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((item) => (
            <div
              key={item._id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {/* Operation badge */}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opColor(item.operation)}`}>
                  {item.operation}
                </span>

                {/* Collection name */}
                <span className="text-sm font-medium text-gray-200">
                  {item.collection}
                </span>

                {/* Connection name */}
                <span className="text-xs text-gray-600">
                  via {item.connection?.name} ({item.connection?.type})
                </span>

                {/* Status */}
                <span className={`text-xs ml-auto ${statusColor(item.status)}`}>
                  {item.status === 'success'
                    ? `${item.resultCount} result(s)`
                    : 'failed'}
                </span>
              </div>

              {/* Error message if failed */}
              {item.errorMessage && (
                <p className="text-xs text-red-400 mt-1 font-mono">
                  {item.errorMessage}
                </p>
              )}

              {/* Timestamp */}
              <p className="text-xs text-gray-700 mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}