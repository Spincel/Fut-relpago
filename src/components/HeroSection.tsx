import React, { useState } from 'react';
import { Calendar, Award, Users, Trophy, ArrowRight, ShieldCheck, Smartphone, Eye, X } from 'lucide-react';

interface HeroSectionProps {
  onGoToRegister: () => void;
  onGoToTeams: () => void;
  onGoToRules: () => void;
  onGoToFixture?: () => void;
  onOpenInstallModal?: () => void;
  registeredTeamsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGoToRegister,
  onGoToTeams,
  onGoToRules,
  onOpenInstallModal,
  registeredTeamsCount,
}) => {
  const [showPosterModal, setShowPosterModal] = useState(false);

  return (
    <div className="relative overflow-hidden bg-slate-950 pb-6 pt-3 sm:pt-5">
      
      {/* Decorative ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto px-3.5 sm:px-6 space-y-3 sm:space-y-3.5">

        {/* =========================================================
            CARD 1: MATCHDAY HERO CARD (Tarjeta Principal)
            ========================================================= */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 p-4 sm:p-5 shadow-xl shadow-black/50 overflow-hidden">
          
          <div className="relative z-10 space-y-3">
            
            {/* Top Status & Date */}
            <div className="flex items-center justify-between gap-1 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Inscripciones Abiertas
              </span>
              
              <span className="inline-flex items-center gap-1 text-slate-300 font-semibold bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800">
                <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Jueves 12 de Nov</span>
              </span>
            </div>

            {/* Tournament Title */}
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 font-extrabold">
                Copa Escolar Oficial · 6 vs 6
              </p>
              <h1 className="font-display text-xl sm:text-3xl font-black text-white tracking-tight leading-tight mt-0.5">
                Torneo Relámpago de Fútbol
              </h1>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Regla de plantilla <strong>2-2-2</strong> obligatoria por grado escolar.
              </p>
            </div>

            {/* Metrics Bar (Compact Single Row, No wrapping in Galaxy 384px) */}
            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800/80 text-center">
              <div>
                <span className="text-[9px] uppercase font-semibold text-slate-400 block">Equipos</span>
                <span className="font-mono text-base sm:text-xl font-black text-amber-400">
                  {registeredTeamsCount}
                </span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-[9px] uppercase font-semibold text-slate-400 block">Plantilla</span>
                <span className="font-mono text-base sm:text-xl font-black text-white">
                  6v6
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-semibold text-slate-400 block">Premio</span>
                <span className="text-xs sm:text-sm font-black text-amber-400">
                  🏆 Sorpresa
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-0.5">
              <button
                onClick={onGoToRegister}
                className="w-full h-11 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <span>⚽</span>
                <span>Inscribir mi Equipo Ahora</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>

          </div>
        </div>

        {/* =========================================================
            CARD 2: RESUMEN REGLA 2-2-2 (Acceso a la pestaña Reglas)
            ========================================================= */}
        <button
          onClick={onGoToRules}
          className="w-full text-left p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 shadow-lg space-y-2 transition-all active:scale-98 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-black text-xs sm:text-sm text-white">
                  Formación Obligatoria 2-2-2
                </h2>
                <span className="text-[10px] text-slate-400">Toca para ver la cancha táctica y bases completas</span>
              </div>
            </div>
            <span className="text-xs text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Ver ➔
            </span>
          </div>

          {/* Mini 3 badges strip */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[9px]">3er Año</span>
              <strong className="text-amber-400">2 Ataque</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[9px]">2do Año</span>
              <strong className="text-blue-400">2 Medio</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[9px]">1er Año</span>
              <strong className="text-purple-400">2 Defensa</strong>
            </div>
          </div>
        </button>

        {/* =========================================================
            CARD 3: ACCESOS RÁPIDOS (Cuadrícula compacta de 4)
            ========================================================= */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            onClick={onGoToRegister}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center"
          >
            <span className="text-base mb-0.5">⚽</span>
            <span className="text-[10px] font-bold text-white leading-tight">Inscribir</span>
          </button>

          <button
            onClick={onGoToRules}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 mb-0.5" />
            <span className="text-[10px] font-bold text-white leading-tight">Reglas</span>
          </button>

          <button
            onClick={onGoToTeams}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center"
          >
            <Users className="w-4 h-4 text-blue-400 mb-0.5" />
            <span className="text-[10px] font-bold text-white leading-tight">Equipos ({registeredTeamsCount})</span>
          </button>

          {onOpenInstallModal ? (
            <button
              onClick={onOpenInstallModal}
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center"
            >
              <Smartphone className="w-4 h-4 text-amber-400 mb-0.5" />
              <span className="text-[10px] font-bold text-amber-300 leading-tight">Instalar</span>
            </button>
          ) : (
            <button
              onClick={() => setShowPosterModal(true)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center"
            >
              <Eye className="w-4 h-4 text-purple-400 mb-0.5" />
              <span className="text-[10px] font-bold text-white leading-tight">Póster</span>
            </button>
          )}
        </div>

        {/* =========================================================
            CARD 4: ORGANIZADOR & PÓSTER OFICIAL
            ========================================================= */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Organizador: <strong className="text-white">Axel Javier G. S.</strong></span>
          </div>

          <button
            onClick={() => setShowPosterModal(true)}
            className="text-[11px] font-bold text-amber-400 hover:text-white bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Póster</span>
          </button>
        </div>

      </div>

      {/* Modal Desplegable para el Póster */}
      {showPosterModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="fixed inset-0" onClick={() => setShowPosterModal(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl space-y-2.5 z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>⚽</span> Póster Oficial Torneo Relámpago
              </span>
              <button
                onClick={() => setShowPosterModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-800 max-h-[70vh] flex items-center justify-center bg-slate-950">
              <img
                src="/assets/aistudio/1794175219156_bba2b4f1.jpg"
                alt="Póster Oficial Torneo Relámpago"
                className="w-full h-auto object-contain max-h-[68vh]"
              />
            </div>
            <button
              onClick={() => setShowPosterModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
