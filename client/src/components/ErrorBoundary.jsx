import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center">
          <div className="bg-gray-900/50 border border-red-800/50 rounded-lg p-8 max-w-md text-center">
            <p className="text-red-400 font-medium mb-2">Something went wrong</p>
            <p className="text-gray-600 text-sm mb-4">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded px-4 py-2 text-sm transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}