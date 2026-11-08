import React from 'react';
import { Calendar, Clock, User, Award, ShieldAlert, Users, FileCheck2, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onGoToRegister: () => void;
  onGoToTeams: () => void;
  onGoToAdmin: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGoToRegister,
  onGoToTeams,
  onGoToAdmin,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800">
      {/* Decorative soccer grid overlay */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#f59e0b_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Official Convocatoria & Bases Information */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Kickers / Unboxed metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-3">
                <span>Convocatoria Oficial Escolar</span>
                <span aria-hidden="true">·</span>
                <span>Edición 2026</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">Inscripciones Abiertas</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                TORNEO RELÁMPAGO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                  DE FÚTBOL
                </span>
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                ¡Inscribe a tu equipo ya! Competencia relámpago con integración de grados escolares.
                Arma tu escuadra cumpliendo la estricta regla de composición por años y compite por el premio sorpresa.
              </p>

              {/* Bases Summary Card */}
              <div className="mt-6 p-5 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-sm uppercase tracking-wide mb-3">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Bases Oficiales Obligatorias</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">3er Año</span>
                    <span className="text-lg font-bold font-mono text-amber-400 block tabular-nums">2 Jugadores</span>
                    <span className="text-xs text-slate-400 mt-1 block">Credencial vigente</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">2do Año</span>
                    <span className="text-lg font-bold font-mono text-amber-400 block tabular-nums">2 Jugadores</span>
                    <span className="text-xs text-slate-400 mt-1 block">Credencial vigente</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block font-medium">1er Año</span>
                    <span className="text-lg font-bold font-mono text-amber-400 block tabular-nums">2 Jugadores</span>
                    <span className="text-xs text-slate-400 mt-1 block">Credencial vigente</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-300 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Total exacto: <strong className="text-white">6 jugadores por equipo</strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Documentación validada
                  </span>
                </div>
              </div>

              {/* Key Dates & Organizer Strip */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 text-xs">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">Día del Torneo</span>
                    <strong className="text-white font-semibold">Jueves 12 de Noviembre</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">Inscripciones</span>
                    <strong className="text-white font-semibold">De Lunes a Miércoles</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <User className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">Organizador</span>
                    <strong className="text-white font-semibold">Axel Javier González Salas</strong>
                  </div>
                </div>
              </div>

              {/* Surprise Prize Alert */}
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-amber-300 uppercase">¡El equipo ganador tendrá un Premio Sorpresa!</span>
                  <span className="text-slate-300 block">Se dará a conocer y se premiará en la ceremonia oficial el día del torneo.</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onGoToRegister}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <span>Inscribir a mi Equipo Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onGoToTeams}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-lg border border-slate-700 transition-colors"
              >
                Ver Equipos Registrados
              </button>
              <button
                onClick={onGoToAdmin}
                className="px-4 py-3 text-slate-400 hover:text-amber-400 text-xs font-medium transition-colors"
              >
                Mesa de Control (Axel Javier)
              </button>
            </div>
          </div>

          {/* Right Column: Visual Poster Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative group rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-slate-900">
              <img
                src="/assets/aistudio/1794175219156_bba2b4f1.jpg"
                alt="Póster Oficial del Torneo Relámpago de Fútbol"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[580px] object-contain mx-auto bg-slate-950 transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Póster Oficial del Torneo</span>
                <span className="text-amber-400 font-medium">Axel Javier González Salas</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
