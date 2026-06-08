import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('pwa-dismissed')) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    if (ios) {
      setIsIOS(true);
      setTimeout(() => setShow(true), 3000);
      return;
    }

    // Android/Desktop - capture install event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 3000);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="pwa-banner">
      <div style={{ fontSize: 28 }}>🎵</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Add MyMusic to Home Screen</div>
        {isIOS
          ? <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Tap the Share button, then "Add to Home Screen"</div>
          : <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Install for the best offline experience</div>
        }
      </div>
      {!isIOS && (
        <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 12 }} onClick={handleInstall}>
          <Download size={14} /> Install
        </button>
      )}
      <button className="btn-icon" onClick={handleDismiss}><X size={16} /></button>
    </div>
  );
}
