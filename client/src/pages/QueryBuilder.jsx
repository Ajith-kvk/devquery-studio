import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { buildQueryHint } from '../utils/queryHint';

const OPERATIONS = ['find', 'insert', 'update', 'delete'];

const FIELD_CONFIG = {
  find:   { showFilter: true,  showData: false },
  insert: { showFilter: false, showData: true  },
  update: { showFilter: true,  showData: true  },
  delete: { showFilter: true,  showData: false },
};

const OP_DESC = {
  find:   'Fetch documents matching the filter. Returns up to 50 results.',
  insert: 'Insert a new document with the given field and value.',
  update: 'Update all documents matching the filter with the new data.',
  delete: 'Delete all documents matching the filter.',
};

export default function QueryBuilder() {
  const [connections, setConnections]   = useState([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [selectedConn, setSelectedConn] = useState('');
  const [collection, setCollection]     = useState('');
  const [operation, setOperation]       = useState('find');
  const [filterField, setFilterField]   = useState('');
  const [filterValue, setFilterValue]   = useState('');
  const [dataField, setDataField]       = useState('');
  const [dataValue, setDataValue]       = useState('');
  const [result, setResult]             = useState(null);
  const [running, setRunning]           = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    api.get('/connections')
      .then(({ data }) => {
        setConnections(data);
        if (data.length > 0) {
          setSelectedConn(data[0]._id);
          setCollection(data[0].collections[0] || '');
        }
      })
      .catch(console.error)
      .finally(() => setLoadingConns(false));
  }, []);

  const handleConnChange = (connId) => {
    setSelectedConn(connId);
    const conn = connections.find((c) => c._id === connId);
    setCollection(conn?.collections[0] || '');
    setResult(null);
    setError('');
  };

  const handleOperationChange = (op) => {
    setOperation(op);
    setResult(null);
    setError('');
  };

  const activeConn = connections.find((c) => c._id === selectedConn);

  const queryPreview = buildQueryHint(
    activeConn?.type || 'mongodb',
    collection,
    operation,
    filterField,
    filterValue,
    dataField,
    dataValue
  );

  const { showFilter, showData } = FIELD_CONFIG[operation] || {};

  const handleRun = async () => {
    if (!selectedConn || !collection) return;
    setError('');
    setResult(null);
    setRunning(true);
    try {
      const params = {
        filter: filterField ? { [filterField]: filterValue } : {},
        data:   dataField   ? { [dataField]: dataValue }     : {},
      };
      const { data } = await api.post('/query/run', {
        connectionId: selectedConn,
        collection,
        operation,
        params,
      });
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Query failed');
    } finally {
      setRunning(false);
    }
  };

  if (!loadingConns && connections.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-100 mb-6">Query Builder</h1>
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
      <h1 className="text-xl font-bold text-gray-100 mb-6">Query Builder</h1>

      <div className="flex flex-col gap-5">

        {/* Step 1 — Connection and collection */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            1 — Choose database and collection
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
                  onChange={(e) => { setCollection(e.target.value); setResult(null); }}
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

        {/* Step 2 — Operation */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            2 — Pick operation
          </p>
          <div className="flex gap-2 flex-wrap">
            {OPERATIONS.map((op) => (
              <button
                key={op}
                onClick={() => handleOperationChange(op)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  operation === op
                    ? 'bg-purple-900/60 border-purple-600 text-purple-300'
                    : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
                }`}
              >
                {op}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">{OP_DESC[operation]}</p>
        </div>

        {/* Step 3 — Fields */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            3 — Set fields
          </p>
          <div className="flex flex-col gap-4">
            {showFilter && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">
                  Filter — which document(s) to target
                </label>
                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                    placeholder="field name — e.g. email"
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-purple-600 w-48"
                  />
                  <span className="text-gray-600 text-xs">=</span>
                  <input
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="value — e.g. john@example.com"
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-purple-600 w-56"
                  />
                  {filterField && (
                    <button
                      onClick={() => { setFilterField(''); setFilterValue(''); }}
                      className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                    >
                      clear
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-700">Leave blank to target all documents</p>
              </div>
            )}
            {showData && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">Data — field to set</label>
                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    value={dataField}
                    onChange={(e) => setDataField(e.target.value)}
                    placeholder="field name — e.g. role"
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-purple-600 w-48"
                  />
                  <span className="text-gray-600 text-xs">=</span>
                  <input
                    value={dataValue}
                    onChange={(e) => setDataValue(e.target.value)}
                    placeholder="value — e.g. admin"
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-purple-600 w-56"
                  />
                  {dataField && (
                    <button
                      onClick={() => { setDataField(''); setDataValue(''); }}
                      className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                    >
                      clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 4 — Live preview */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            4 — Query preview (updates live)
          </p>
          <div className="rounded overflow-hidden border border-gray-700">
            <Editor
              height="120px"
              language={activeConn?.type === 'mysql' ? 'sql' : 'javascript'}
              theme="vs-dark"
              value={queryPreview}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'off',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 10, bottom: 10 },
              }}
            />
          </div>
        </div>

        {/* Run button */}
        <div className="flex gap-3 items-center">
          <button
            onClick={handleRun}
            disabled={running || !collection || loadingConns}
            className="bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded px-6 py-2 text-sm font-medium transition-colors"
          >
            {running ? 'Running...' : 'Run Query'}
          </button>
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>

        {/* Result */}
        {result !== null && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Result</p>
              <span className="text-xs text-green-400">
                {Array.isArray(result) ? `${result.length} document(s)` : 'Success'}
              </span>
            </div>
            <div className="rounded overflow-hidden border border-gray-700">
              <Editor
                height="300px"
                language="json"
                theme="vs-dark"
                value={JSON.stringify(result, null, 2)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}