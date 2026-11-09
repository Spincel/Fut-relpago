import React from 'react';
import { Trophy, ShieldCheck, Users, Calendar } from 'lucide-react';

export type TournamentTab = 'inicio' | 'reglas' | 'registro' | 'equipos' | 'fixture' | 'admin';

interface MobileBottomNavProps {
  currentTab: TournamentTab;
  setCurrentTab: (tab: TournamentTab) => void;
  teamsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  teamsCount,
}) => {
  return (
    <nav className="no-print lg:hidden shrink-0 w-full z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-1 shadow-2xl safe-area-bottom select-none">
      {/* 5 Columnas Simétricas: 2 a la izquierda, Balón en el CENTRO EXACTO, 2 a la derecha */}
      <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto h-15">
        
        {/* Tab 1: Inicio */}
        <button
          aria-label="Ir a Inicio"
          onClick={() => setCurrentTab('inicio')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
            currentTab === 'inicio' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Trophy className="w-5 h-5 mb-0.5" />
            {currentTab === 'inicio' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">Inicio</span>
        </button>

        {/* Tab 2: Reglas / Cancha 2-2-2 */}
        <button
          aria-label="Ver bases y reglas 2-2-2"
          onClick={() => setCurrentTab('reglas')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
            currentTab === 'reglas' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            {currentTab === 'reglas' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">Reglas</span>
        </button>

        {/* Tab 3: Balón Central Destacado (CENTRO EXACTO DE 5) */}
        <button
          aria-label="Inscribir equipo"
          onClick={() => setCurrentTab('registro')}
          className="flex flex-col items-center justify-center -mt-5 group focus:outline-none cursor-pointer active:scale-90 transition-transform"
        >
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-all border-2 ${
            currentTab === 'registro'
              ? 'bg-amber-400 text-slate-950 border-white shadow-amber-500/50 scale-105 ring-4 ring-amber-500/20'
              : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-amber-500/30'
          }`}>
            <span className="text-2xl filter drop-shadow">⚽</span>
          </div>
          <span className={`text-[10px] font-black mt-1 tracking-tight ${
            currentTab === 'registro' ? 'text-amber-400' : 'text-slate-300'
          }`}>
            Inscribir
          </span>
        </button>

        {/* Tab 4: Equipos */}
        <button
          aria-label="Ver equipos registrados"
          onClick={() => setCurrentTab('equipos')}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
            currentTab === 'equipos' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5 mb-0.5" />
            {teamsCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono font-bold bg-amber-500 text-slate-950 px-1 py-0.2 rounded-full leading-none shadow-sm">
                {teamsCount}
              </span>
            )}
            {currentTab === 'equipos' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">Equipos</span>
        </button>

        {/* Tab 5: Rol / Fixture */}
        <button
          aria-label="Ver rol de juegos"
          onClick={() => setCurrentTab('fixture')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
            currentTab === 'fixture' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Calendar className="w-5 h-5 mb-0.5" />
            {currentTab === 'fixture' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">Rol</span>
        </button>

      </div>
    </nav>
  );
};
