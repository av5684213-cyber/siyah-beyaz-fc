'use client';

import React, { Component, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════
// GlobalErrorBoundary — Tüm uygulamayı React hatalarından korur
// Bir bileşen crash olursa tüm app yerine sadece hata ekranı göster
// ═══════════════════════════════════════════════════════════════

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GlobalErrorBoundary] Yakalanan hata:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-black text-white mb-2">Bir Hata Oluştu</h2>
            <p className="text-xs text-white/40 mb-1">
              Beklenmeyen bir sorun oluştu. Sayfayı yenileyip tekrar deneyebilirsiniz.
            </p>
            {this.state.error && (
              <p className="text-[10px] text-red-400/60 font-mono mt-2 mb-4 break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
              >
                Geri Dön
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 bg-amber-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
