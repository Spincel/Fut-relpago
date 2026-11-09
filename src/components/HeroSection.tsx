import React from 'react';
import { Calendar, Clock, User, Award, Users, CheckCircle2, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onGoToRegister: () => void;
  onGoToTeams: () => void;
  onGoToAdmin: () => void;
  registeredTeamsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGoToRegister,
  onGoToTeams,
  onGoToAdmin,
  registeredTeamsCount,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800">
      
      {/* Top Banner Notice: Organized by Axel */}
      <div className="bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm py-2 px-4 text-center flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
        <Trophy className="w-4 h-4 text-slate-950 shrink-0" />
        <span>
          ¡Torneo Relámpago de Fútbol Oficial! · Jueves 12 de Noviembre · Organiza: <strong>Axel Javier González Salas</strong>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Big Title, Bases & Giant Action Button */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Counter Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm sm:text-base shadow-sm">
              <Users className="w-5 h-5 text-amber-400" />
              <span>
                Equipos Ya Registrados: <strong className="font-mono text-white text-lg sm:text-xl underline decoration-amber-500 decoration-2">{registeredTeamsCount} Equipos</strong>
              </span>
            </div>

            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                TORNEO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
                  RELÁMPAGO
                </span> <br />
                DE FÚTBOL
              </h1>
              
              <p className="mt-3 text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
                ¡Arma tu equipo con tus amigos de la escuela y compite por el <strong>Premio Sorpresa</strong>!
                Revisa las bases oficiales y registra a tu escuadra antes de que se agoten los lugares.
              </p>
            </div>

            {/* Giant Register Button */}
            <div className="pt-2">
              <button
                onClick={onGoToRegister}
                className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg sm:text-xl rounded-2xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span className="text-2xl">⚽</span>
                <span>REGISTRAR EQUIPO AHORA</span>
                <ArrowRight className="w-6 h-6 text-slate-950" />
              </button>
              <span className="text-xs text-slate-400 block mt-2 font-medium">
                ⚡ Registro rápido y gratuito · Se genera tu cédula de inmediato
              </span>
            </div>

            {/* Bases Resumidas para Chicos de 12 a 15 Años */}
            <div className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/40 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span className="font-display font-extrabold text-base text-white uppercase tracking-wide">
                    Bases Oficiales Obligatorias
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                  Plantilla de 6
                </span>
              </div>

              {/* 2-2-2 Visual Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Alumnos de</span>
                  <span className="text-2xl font-black font-display text-amber-400 block my-0.5">3er Año</span>
                  <span className="text-xs text-emerald-400 font-bold">✓ 2 Jugadores</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Alumnos de</span>
                  <span className="text-2xl font-black font-display text-amber-400 block my-0.5">2do Año</span>
                  <span className="text-xs text-emerald-400 font-bold">✓ 2 Jugadores</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 font-bold block uppercase">Alumnos de</span>
                  <span className="text-2xl font-black font-display text-amber-400 block my-0.5">1er Año</span>
                  <span className="text-xs text-emerald-400 font-bold">✓ 2 Jugadores</span>
                </div>
              </div>

              {/* Requirements row */}
              <div className="text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Todos deben presentar credencial escolar vigente
                </span>
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Un jugador no puede repetir en 2 equipos
                </span>
              </div>
            </div>

            {/* Key Information Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Día del Torneo:</span>
                  <strong className="text-white text-sm">Jueves 12 de Noviembre</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Inscripciones:</span>
                  <strong className="text-white text-sm">De Lunes a Miércoles</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <User className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Coordinador:</span>
                  <strong className="text-white text-sm">Axel Javier G. S.</strong>
                </div>
              </div>
            </div>

            {/* Surprise Award */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/40 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="text-xs">
                <strong className="text-amber-300 block text-sm font-bold uppercase">
                  ¡El equipo ganador tendrá un Premio Sorpresa!
                </strong>
                <span className="text-slate-300">
                  Se dará a conocer y se entregará durante la ceremonia el día del torneo.
                </span>
              </div>
            </div>

            {/* Secondary navigation */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGoToTeams}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Ver los {registeredTeamsCount} Equipos Inscritos</span>
              </button>
            </div>

          </div>

          {/* Right Column: Poster Image */}
          <div className="lg:col-span-5 flex flex-col justify-center items-center">
            <div className="relative group rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-slate-900 max-w-sm w-full">
              <img
                src="/assets/aistudio/1794175219156_bba2b4f1.jpg"
                alt="Póster Oficial Torneo Relámpago de Fútbol"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain bg-slate-950 transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold text-amber-400">Póster Oficial del Torneo</span>
                <span>Axel Javier González Salas</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
