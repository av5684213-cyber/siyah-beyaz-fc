'use client';

import React from 'react';
import { FootballLoaderScreen } from '@/components/ui/FootballLoader';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  autoReloading: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, autoReloading: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null, autoReloading: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Client error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    this.setState({ errorInfo });

    // #310 ("Rendered fewer hooks than expected") — otomatik reload
    // Bu hata SSR/CSR hook uyumsuzluğundan gelir ve tek seferlik reload ile
    // çözülür. Kullanıcıya hata ekranı göstermek yerine otomatik reload yap.
    const isHookError =
      error?.message?.includes('310') ||
      error?.message?.includes('Rendered fewer hooks') ||
      error?.message?.includes('Rendered more hooks') ||
      error?.message?.includes('Minified React error');

    if (isHookError) {
      // Aynı oturumda tekrar tekrar reload olmasını önle
      const reloadKey = `error_reloaded_${Date.now()}`;
      const lastReload = sessionStorage.getItem('last_hook_error_reload');
      const now = Date.now();

      // Son 10 saniye içinde reload yapıldıysa tekrar reload yapma
      // (sonsuz döngüyü önle)
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('last_hook_error_reload', String(now));
        this.setState({ autoReloading: true });
        // 500ms bekle ki loading ekranı görünsün, sonra reload
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
  }

  render() {
    // #310 otomatik reload yapılıyorsa loading ekranı göster
    if (this.state.autoReloading) {
      return <FootballLoaderScreen label="Sayfa Yenileniyor" />;
    }

    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Bilinmeyen hata';
      const errorStack = this.state.error?.stack || '';
      const componentStack = this.state.errorInfo?.componentStack || '';

      // #310 hatasıysa özel mesaj
      const isHookError =
        errorMsg.includes('310') ||
        errorMsg.includes('Rendered fewer hooks') ||
        errorMsg.includes('Rendered more hooks') ||
        errorMsg.includes('Minified React error');

      if (isHookError) {
        return (
          <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-zinc-900 border border-amber-500/20 rounded-2xl p-6 text-center space-y-4">
              <FootballLoaderScreen label="Sayfa Yenileniyor" />
              <p className="text-xs text-white/40 mt-4">
                Sayfa otomatik yenileniyor. Bu bir render uyumluluk sorunudur,
                yenileme sonrası düzelecektir.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Manuel Yenile
              </button>
            </div>
          </div>
        );
      }

      // Diğer hatalar — tam hata ekranı
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
