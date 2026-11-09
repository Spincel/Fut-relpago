import React, { useState } from 'react';
import { X, Download, Share, Smartphone, Check, Sparkles } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  canPromptNative: boolean;
  onTriggerNativeInstall: () => Promise<void>;
  isIos: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  canPromptNative,
  onTriggerNativeInstall,
  isIos,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIos ? 'ios' : 'android');

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-amber-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto no-scrollbar z-10">
        
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/25">
              ⚽
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white leading-tight">
                Instalar App en Celular
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                Torneo Relámpago Oficial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Native One-Click Install Button (When available in Chrome / Android) */}
        {canPromptNative && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Instalación Directa Disponible</span>
            </div>
            <button
              onClick={async () => {
                await onTriggerNativeInstall();
                onClose();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Instalar Ahora en Este Dispositivo</span>
            </button>
          </div>
        )}

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Samsung / Android</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Tab 1: Android / Samsung Galaxy Guide */}
        {activeTab === 'android' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-slate-300 leading-relaxed">
              Compatible con <strong>Samsung Galaxy</strong>, Xiaomi, Motorola y cualquier dispositivo Android usando Chrome o Samsung Internet:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white block">Abre el menú del navegador</strong>
                  <span className="text-slate-400 text-[11px]">
                    Toca los <strong>tres puntos (⋮)</strong> arriba a la derecha en Chrome, o las <strong>tres líneas (≡)</strong> abajo en Samsung Internet.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white block">Toca "Instalar aplicación" o "Agregar a inicio"</strong>
                  <span className="text-slate-400 text-[11px]">
                    En Samsung Internet aparece como <em>"Añadir página a &gt; Pantalla de inicio"</em>.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-white block">Confirma la instalación</strong>
                  <span className="text-slate-400 text-[11px]">
                    Se agregará el icono ⚽ <strong>Relámpago</strong> a tu menú de aplicaciones, abriendo en pantalla completa como app nativa.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: iPhone / Safari Guide */}
        {activeTab === 'ios' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-slate-300 leading-relaxed">
              En tu iPhone o iPad usando el navegador <strong>Safari</strong>:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white block">Toca el botón Compartir</strong>
                  <span className="text-slate-400 text-[11px]">
                    Es el icono del cuadrado con una flecha hacia arriba (⬆) en la barra inferior de Safari.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white block">Elige "Agregar al inicio"</strong>
                  <span className="text-slate-400 text-[11px]">
                    Desliza un poco hacia abajo en el menú de opciones y toca el botón <strong>+ Agregar a pantalla de inicio</strong>.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-white block">Toca "Agregar" arriba a la derecha</strong>
                  <span className="text-slate-400 text-[11px]">
                    ¡Listo! La app quedará guardada con su icono ⚽ y abrirá sin barra de navegación.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Pill */}
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-around text-[10px] text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Sin descargas pesadas
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Pantalla completa
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Siempre actualizada
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer active:scale-98"
        >
          Entendido
        </button>

      </div>
    </div>
  );
};
