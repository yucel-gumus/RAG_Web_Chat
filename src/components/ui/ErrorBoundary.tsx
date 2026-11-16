'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#EDF3EE] p-4">
          <div className="max-w-md w-full bg-[#DCE3EA] border border-[#BCC7D2] rounded-2xl shadow-lg p-6 text-center">
            <div className="text-[#AB421C] text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-[#253341] mb-2">
              Beklenmeyen Bir Hata Oluştu
            </h2>
            <p className="text-[#3E5164] mb-4">
              Üzgünüz, uygulama beklenmeyen bir hata ile karşılaştı.
            </p>
            <button
              onClick={this.resetError}
              className="bg-[#EC7D55] hover:bg-[#AB421C] text-[#253341] hover:text-[#F5F9F5] font-semibold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Tekrar Dene
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-[#3E5164] hover:text-[#253341] transition-colors duration-200">
                  Hata Detayları (Development)
                </summary>
                <pre className="mt-2 text-xs text-[#AB421C] bg-[#F5F9F5] p-2 rounded-lg border border-[#AB421C]/50 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 