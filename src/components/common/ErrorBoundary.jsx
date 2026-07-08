import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Bae Watch error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bae-cream flex flex-col items-center justify-center px-6 text-center">
          <p className="text-5xl mb-4">💔</p>
          <h2 className="text-xl font-bold text-bae-navy mb-2">Something went wrong</h2>
          <p className="text-sm text-bae-navy/60 mb-6">
            We hit an unexpected snag. Your data is safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-bae-coral text-white rounded-full font-semibold text-sm shadow-lg"
          >
            Reload the app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
