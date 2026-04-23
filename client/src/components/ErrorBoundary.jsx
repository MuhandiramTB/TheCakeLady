import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden px-4">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-red-500 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Something Went Wrong
            </h1>
            <p className="text-white/70 mb-8 leading-relaxed">
              An unexpected error occurred. Don't worry, your data is safe.
              Please reload the page to continue.
            </p>

            {this.state.error?.message && (
              <details className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
                <summary className="text-white/60 text-xs cursor-pointer hover:text-white/80">
                  Technical details
                </summary>
                <pre className="text-red-400 text-xs mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReload}
              className="bg-gradient-gold text-primary font-semibold px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-[0.97] min-h-[48px]"
            >
              Reload Page
            </button>

            <p className="text-white/40 text-sm mt-6">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
