import React from 'react';
import { Trophy, Users, Calendar, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'bases' | 'registro' | 'equipos' | 'fixture' | 'admin';
  setCurrentTab: (tab: 'bases' | 'registro' | 'equipos' | 'fixture' | 'admin') => void;
  teamsCount: number;
  newRegistrationsCount: number;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  teamsCount,
  newRegistrationsCount,
  isAdmin,
}) => {
  return (
    <nav className="no-print lg:hidden shrink-0 w-full z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 shadow-2xl safe-area-bottom select-none">
      <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} items-center justify-around max-w-md mx-auto h-15`}>
        
        {/* Tab 1: Bases / Inicio */}
        <button
          aria-label="Ir a Inicio"
          onClick={() => setCurrentTab('bases')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
            currentTab === 'bases' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Trophy className="w-5 h-5 mb-0.5" />
            {currentTab === 'bases' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">Inicio</span>
        </button>

        {/* Tab 2: Equipos */}
        <button
          aria-label="Ver equipos registrados"
          onClick={() => setCurrentTab('equipos')}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
            currentTab === 'equipos' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-1 -right-2 text-[8px] font-mono font-bold bg-amber-500/20 text-amber-400 px-1 rounded-full border border-amber-500/40">
              {teamsCount}
            </span>
            {currentTab === 'equipos' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">Equipos</span>
        </button>

        {/* Tab 3: Central Highlight: Inscribir */}
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

        {/* Tab 4: Rol / Fixture */}
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
          <span className="text-[10px] tracking-tight leading-tight mt-0.5">Rol Jueves</span>
        </button>

        {/* Tab 5: Admin Panel (ONLY visible when Axel is logged in) */}
        {isAdmin && (
          <button
            aria-label="Abrir panel del organizador"
            onClick={() => setCurrentTab('admin')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
              currentTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <ShieldCheck className="w-5 h-5 mb-0.5" />
              {newRegistrationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
              )}
              {currentTab === 'admin' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-tight mt-0.5">Axel</span>
          </button>
        )}

      </div>
    </nav>
  );
};
