import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import api from '../api/axios';

const ALL_OPS = [
  { key: 'getAll',   label: 'GET all',     desc: 'Fetch all records'         },
  { key: 'getById',  label: 'GET by ID',   desc: 'Fetch one record by ID'    },
  { key: 'create',   label: 'POST create', desc: 'Insert a new record'       },
  { key: 'update',   label: 'PUT update',  desc: 'Update a record by ID'     },
  { key: 'delete',   label: 'DELETE',      desc: 'Delete a record by ID'     },
];

export default function RouteGenerator() {
  const [connections, setConnections]   = useState([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [selectedConn, setSelectedConn] = useState('');
  const [collection, setCollection]     = useState('');
  const [operations, setOperations]     = useState(['getAll', 'getById', 'create']);
  const [code, setCode]                 = useState('');
  const [filename, setFilename]         = useState('');
  const [dbType, setDbType]             = useState('');
  const [generating, setGenerating]     = useState(false);
  const [error, setError]               = useState('');
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    api.get('/connections')
      .then(({ data }) => {
        setConnections(data);
        if (data.length > 0) {
          setSelectedConn(data[0]._id);
          setCollection(data[0].collections[0] || '');
          setDbType(data[0].type);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingConns(false));
  }, []);

  const handleConnChange = (connId) => {
    setSelectedConn(connId);
    const conn = connections.find((c) => c._id === connId);
    setCollection(conn?.collections[0] || '');
    setDbType(conn?.type || '');
    setCode('');
    setError('');
  };

  const toggleOperation = (key) => {
    setOperations((prev) =>
      prev.includes(key)
        ? prev.filter((o) => o !== key)
        : [...prev, key]
    );
    setCode('');
  };

  const handleGenerate = async () => {
    if (!selectedConn || !collection || operations.length === 0) return;
    setError('');
    setGenerating(true);
    try {
      const { data } = await api.post('/generate/route', {
        connectionId: selectedConn,
        collection,
        operations,
      });
      setCode(data.code);
      setFilename(data.filename);
      setDbType(data.dbType);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeConn = connections.find((c) => c._id === selectedConn);

  if (!loadingConns && connections.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-100 mb-6">Route Generator</h1>
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-sm mb-3">No connections found.</p>
          <a href="/connections" className="text-purple-400 hover:underline text-sm">
            Add a connection first
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100 mb-2">Route Generator</h1>
      <p className="text-gray-500 text-sm mb-6">
        Pick a collection and operations — get a ready-to-use Express route file instantly.
      </p>

      <div className="flex flex-col gap-5">

        {/* Step 1 — Connection and collection */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            1 — Choose connection and collection
          </p>
          {loadingConns ? (
            <p className="text-gray-600 text-sm">Loading connections...</p>
          ) : (
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Connection</label>
                <select
                  value={selectedConn}
                  onChange={(e) => handleConnChange(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-600"
                >
                  {connections.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">
                  {activeConn?.type === 'mysql' ? 'Table' : 'Collection'}
                </label>
                <select
                  value={collection}
                  onChange={(e) => { setCollection(e.target.value); setCode(''); }}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-600"
                >
                  {activeConn?.collections.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              {activeConn && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  activeConn.type === 'mongodb'
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-blue-900/50 text-blue-400'
                }`}>
                  {activeConn.type}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Step 2 — Select operations */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            2 — Select operations to generate
          </p>
          <div className="flex flex-col gap-2">
            {ALL_OPS.map((op) => (
              <label
                key={op.key}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  onClick={() => toggleOperation(op.key)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    operations.includes(op.key)
                      ? 'bg-purple-700 border-purple-600'
                      : 'bg-transparent border-gray-600 group-hover:border-gray-400'
                  }`}
                >
                  {operations.includes(op.key) && (
                    <span className="text-white text-xs leading-none">✓</span>
                  )}
                </div>
                <div onClick={() => toggleOperation(op.key)}>
                  <span className="text-sm text-gray-300">{op.label}</span>
                  <span className="text-xs text-gray-600 ml-2">{op.desc}</span>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-700 mt-3">
            {operations.length} operation{operations.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Generate button */}
        <div className="flex gap-3 items-center">
          <button
            onClick={handleGenerate}
            disabled={generating || !collection || operations.length === 0 || loadingConns}
            className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded px-6 py-2 text-sm font-medium transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Route'}
          </button>
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>

        {/* Step 3 — Generated code */}
        {code && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Generated file
                </p>
                <p className="text-sm text-purple-400 font-mono mt-0.5">
                  routes/{filename}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className={`text-xs border rounded px-3 py-1.5 transition-colors ${
                  copied
                    ? 'border-green-700 text-green-400'
                    : 'border-gray-700 text-gray-500 hover:text-gray-200 hover:border-gray-500'
                }`}
              >
                {copied ? 'Copied!' : 'Copy code'}
              </button>
            </div>

            <div className="rounded overflow-hidden border border-gray-700">
              <Editor
                height="450px"
                language="javascript"
                theme="vs-dark"
                value={code}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>

            {/* How to use instructions */}
            <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded p-4">
              <p className="text-xs text-gray-400 font-medium mb-2">
                How to use this in your project
              </p>
              <ol className="text-xs text-gray-500 flex flex-col gap-1.5 list-decimal list-inside">
                <li>
                  Copy the code and save it as{' '}
                  <code className="text-gray-400 bg-gray-800 px-1 rounded">
                    routes/{filename}
                  </code>{' '}
                  in your Express project
                </li>
                <li>
                  In your{' '}
                  <code className="text-gray-400 bg-gray-800 px-1 rounded">
                    server.js
                  </code>{' '}
                  or{' '}
                  <code className="text-gray-400 bg-gray-800 px-1 rounded">
                    index.js
                  </code>
                  , add:
                  <br />
                  <code className="text-purple-400 bg-gray-800 px-1 rounded mt-1 inline-block">
                    {`app.use('/${collection}', require('./routes/${filename}'));`}
                  </code>
                </li>
                {dbType === 'mongodb' && (
                  <li>
                    Create a Mongoose model at{' '}
                    <code className="text-gray-400 bg-gray-800 px-1 rounded">
                      models/{collection.charAt(0).toUpperCase() + collection.slice(1)}.js
                    </code>
                  </li>
                )}
                {dbType === 'mysql' && (
                  <li>
                    Make sure your{' '}
                    <code className="text-gray-400 bg-gray-800 px-1 rounded">
                      utils/db.js
                    </code>{' '}
                    exports a mysql2 pool or connection
                  </li>
                )}
              </ol>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}