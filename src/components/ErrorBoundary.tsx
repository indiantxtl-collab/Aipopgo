import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCcw className="w-8 h-8" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 mb-2">Oops! Something went wrong.</h1>
             <p className="text-slate-500 text-sm mb-6 max-h-32 overflow-y-auto">
               {this.state.error?.message || "An unexpected error occurred."}
             </p>
             <button 
               onClick={() => window.location.reload()}
               className="bg-slate-900 text-white font-bold py-3 px-6 rounded-full w-full hover:bg-slate-800 transition-colors"
             >
               Reload Application
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
