import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register service worker for offline caching of travel documents & Quran
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('Nouvelle version EVA Voyages disponible');
    },
    onOfflineReady() {
      console.log('Application EVA Voyages prête pour consultation hors-ligne');
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
