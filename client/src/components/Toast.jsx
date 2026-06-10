import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  // Auto-close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-900/80 border-green-700 text-green-300',
    error:   'bg-red-900/80 border-red-700 text-red-300',
    info:    'bg-purple-900/80 border-purple-700 text-purple-300',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 border rounded-lg px-4 py-3 text-sm shadow-lg flex items-center gap-3 ${colors[type]}`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="opacity-60 hover:opacity-100 transition-opacity text-xs"
      >
        x
      </button>
    </div>
  );
}