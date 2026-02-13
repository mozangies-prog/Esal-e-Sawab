
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary class component to catch and handle rendering errors in its child components.
 * Explicitly extends React.Component to ensure proper inheritance of state and props.
 */
class ErrorBoundary extends React.Component<Props, State> {
  // Add constructor to properly initialize props and state, ensuring 'this.props' is recognized by TypeScript
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state so the next render will show the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Log error information to the console or an external service.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error and the component stack
    console.error("Uncaught error:", error, errorInfo);
  }

  // Render method returns the fallback UI if an error occurred, otherwise the children
  public render(): ReactNode {
    // Access state properties through this.state
    if (this.state.hasError) {
      // Fallback UI when an error occurs
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

    // Accessing children from props inherited from React.Component
    return this.props.children;
  }
}

export default ErrorBoundary;
