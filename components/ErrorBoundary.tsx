
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-slate-500 text-sm mb-6">
              The application encountered an unexpected error. This might be due to a configuration issue or a temporary failure.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left overflow-auto max-h-40">
              <code className="text-[10px] text-red-600 font-mono">
                {this.state.error?.toString()}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    // Fix: Accessing children from props in class component
    return this.props.children;
  }
}

export default ErrorBoundary;
