'use client';

import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-black flex items-center justify-center p-10 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-black italic">BİR HATA OLUŞTU</h1>
            <p className="text-white/40">Sayfayı yenilemeyi deneyin veya yöneticiye başvurun.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black font-bold uppercase rounded-lg">YENİLE</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
