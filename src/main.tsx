import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registro del service worker de la PWA (manual, public/sw.js).
// Si falla (navegador sin soporte, modo desarrollo, etc.) la app sigue
// funcionando normal: nunca debe romper el arranque.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* Sin service worker: la app sigue usable desde la web. */
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
