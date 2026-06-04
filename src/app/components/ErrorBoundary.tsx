'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Client error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Bilinmeyen hata';
      const errorStack = this.state.error?.stack || '';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="h-screen bg-black flex items-center justify-center p-10 text-center overflow-auto">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl font-black italic">BİR HATA OLUŞTU</h1>
            <p className="text-white/40">Sayfayı yenilemeyi deneyin veya yöneticiye başvurun.</p>
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 text-left text-xs font-mono text-red-300 overflow-auto max-h-60">
              <p className="font-bold text-red-400 mb-2">Hata: {errorMsg}</p>
              {errorStack && <pre className="whitespace-pre-wrap mb-2">{errorStack.split('\n').slice(0, 5).join('\n')}</pre>}
              {componentStack && <pre className="whitespace-pre-wrap text-yellow-300">{componentStack}</pre>}
            </div>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black font-bold uppercase rounded-lg hover:bg-white/90 transition-colors">YENİLE</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
