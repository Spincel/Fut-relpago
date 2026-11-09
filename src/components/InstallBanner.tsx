import React, { useEffect, useState } from 'react';
import { Download, Share, X, Trophy } from 'lucide-react';

/** Evento que el navegador dispara cuando la app es instalable (Chrome/Android). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'torneo-relampago-install-dismissed';

function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Banner de instalación de la PWA.
 * - Android/escritorio con Chrome: captura beforeinstallprompt y ofrece
 *   el botón "Instalar app".
 * - iOS (sin beforeinstallprompt): muestra las instrucciones
 *   Compartir > Agregar a inicio.
 * - Descartable: al cerrar no vuelve a aparecer en la misma sesión.
 * - No se muestra si la app ya está instalada (standalone).
 */
export const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;

  const showAndroidPrompt = deferredPrompt !== null;
  const showIosPrompt = !showAndroidPrompt && isIosDevice() && !isStandalone();
  // Si no hay evento instalable ni es iOS, no hay nada que ofrecer todavía.
  if (!showAndroidPrompt && !showIosPrompt) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* sessionStorage no disponible: solo se oculta en este render. */
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div
      role="region"
      aria-label="Instalar la aplicación del Torneo Relámpago"
      className="no-print fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
    >
      <div className="rounded-2xl bg-slate-900 border border-amber-500/50 shadow-2xl shadow-black/60 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Instala la app del Torneo Relámpago</p>
            <p className="text-xs text-slate-300 mt-0.5">
              Acceso directo en tu inicio, a pantalla completa y sin barra del navegador.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Cerrar aviso de instalación"
            className="min-w-[44px] min-h-[44px] -m-2 p-2.5 text-slate-400 hover:text-white rounded-lg shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showAndroidPrompt ? (
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full min-h-[48px] py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-5 h-5" />
            <span>Instalar app</span>
          </button>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowIosHelp((v) => !v)}
              aria-expanded={showIosHelp}
              className="w-full min-h-[48px] py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Share className="w-5 h-5" />
              <span>Cómo instalar en iPhone</span>
            </button>
            {showIosHelp && (
              <ol className="text-xs text-slate-200 space-y-1.5 rounded-xl bg-slate-950 border border-slate-800 p-3 list-none">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-400 shrink-0">1.</span>
                  <span>
                    Toca el botón <strong>Compartir</strong> de Safari (el cuadrado con la flecha).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-400 shrink-0">2.</span>
                  <span>
                    Elige <strong>Agregar a inicio</strong> y luego{' '}
                    <strong>Agregar</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-400 shrink-0">3.</span>
                  <span>Abre la app desde el icono “Relámpago” en tu pantalla de inicio.</span>
                </li>
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
