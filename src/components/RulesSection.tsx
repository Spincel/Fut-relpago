import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Award, Calendar, Trophy, ArrowRight, Eye, X, Users } from 'lucide-react';

interface RulesSectionProps {
  onGoToRegister: () => void;
  registeredTeamsCount: number;
}

export const RulesSection: React.FC<RulesSectionProps> = ({
  onGoToRegister,
  registeredTeamsCount,
}) => {
  const [showPosterModal, setShowPosterModal] = useState(false);

  return (
    <div className="relative overflow-hidden bg-slate-950 pb-8 pt-3 sm:pt-5">
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-3.5 sm:px-6 space-y-3.5 sm:space-y-4">
        
        {/* Section Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-black text-base sm:text-lg text-white leading-tight">
                Reglas y Bases Oficiales
              </h1>
              <p className="text-[11px] text-amber-400 font-medium">
                Torneo Relámpago · Formato Escolar 2-2-2
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
            6 Jugadores
          </span>
        </div>

        {/* =========================================================
            CANCHA TÁCTICA VISUAL: REGLA 2-2-2
            ========================================================= */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-emerald-500/30 p-3.5 sm:p-4 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between text-xs">
            <strong className="text-white font-bold flex items-center gap-1.5">
              <span>⚽</span> Plantilla Obligatoria por Grado Escolar
            </strong>
            <span className="text-[10px] text-emerald-400 font-bold">2 + 2 + 2 = 6</span>
          </div>

          {/* Mini Tactical Pitch Lineup */}
          <div className="rounded-xl bg-gradient-to-b from-emerald-950/60 via-slate-950 to-emerald-950/60 border border-emerald-500/30 p-2.5 space-y-2">
            
            {/* Zone 1: Ataque (3er Año) */}
            <div className="px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs">
                  ⚽
                </span>
                <div>
                  <strong className="text-white text-xs block leading-tight">Alumnos de 3er Año</strong>
                  <span className="text-[10px] text-slate-400">Línea de Ataque / Delanteros</span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                2 Jugadores
              </span>
            </div>

            {/* Zone 2: Medio Campo (2do Año) */}
            <div className="px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-black flex items-center justify-center text-xs">
                  ⚡
                </span>
                <div>
                  <strong className="text-white text-xs block leading-tight">Alumnos de 2do Año</strong>
                  <span className="text-[10px] text-slate-400">Medio Campo / Creación</span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                2 Jugadores
              </span>
            </div>

            {/* Zone 3: Defensa y Portería (1er Año) */}
            <div className="px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-black flex items-center justify-center text-xs">
                  🛡
                </span>
                <div>
                  <strong className="text-white text-xs block leading-tight">Alumnos de 1er Año</strong>
                  <span className="text-[10px] text-slate-400">Defensa y Portero</span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                2 Jugadores
              </span>
            </div>

          </div>
        </div>

        {/* =========================================================
            REQUISITOS OFICIALES
            ========================================================= */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 sm:p-4 space-y-2.5">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Requisitos para Participar</span>
          </h2>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
              <span className="text-emerald-400 font-bold">1.</span>
              <span><strong>Credencial escolar vigente:</strong> Todo jugador debe presentarla antes de iniciar el partido.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
              <span className="text-emerald-400 font-bold">2.</span>
              <span><strong>Un solo equipo:</strong> Un jugador no puede jugar ni registrarse en dos equipos distintos.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
              <span className="text-emerald-400 font-bold">3.</span>
              <span><strong>Color de uniforme:</strong> Cada escuadra debe registrar y portar su color de uniforme para distinguirse en cancha.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
              <span className="text-emerald-400 font-bold">4.</span>
              <span><strong>Puntualidad:</strong> Los juegos inician a la hora programada en el rol. 5 minutos de tolerancia máxima.</span>
            </div>
          </div>
        </div>

        {/* =========================================================
            PREMIACIÓN & COORDINACIÓN
            ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/40 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Premio Sorpresa al Campeón</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Se revelará y entregará en la ceremonia oficial al finalizar el torneo.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-200 text-xs font-bold">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Fecha del Torneo</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Jueves 12 de Noviembre</strong> · En las instalaciones de la escuela.
            </p>
          </div>
        </div>

        {/* Organizer & Poster Button */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Organizador: <strong className="text-white">Axel Javier González Salas</strong></span>
          </div>

          <button
            onClick={() => setShowPosterModal(true)}
            className="text-[11px] font-bold text-amber-400 hover:text-white bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Póster</span>
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="pt-1">
          <button
            onClick={onGoToRegister}
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <span>⚽</span>
            <span>Inscribir mi Equipo Ahora</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

      </div>

      {/* Poster Modal */}
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
