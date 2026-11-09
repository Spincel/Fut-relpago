import React from 'react';
import { ShieldCheck, LogOut, Trophy } from 'lucide-react';

interface HeaderProps {
  currentTab: 'bases' | 'registro' | 'equipos' | 'fixture' | 'admin';
  setCurrentTab: (tab: 'bases' | 'registro' | 'equipos' | 'fixture' | 'admin') => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  totalTeamsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isAdmin,
  onLogoutAdmin,
  totalTeamsCount,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark / Brand Title */}
        <button
          onClick={() => setCurrentTab('bases')}
          className="flex items-center gap-2 text-left group shrink-0 focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="font-display font-black text-sm sm:text-base tracking-tight text-white whitespace-nowrap block">
              Torneo Relámpago
            </span>
            <span className="text-[10px] sm:text-xs text-amber-400 font-medium block -mt-0.5">
              Jueves 12 Nov · 6 Jugadores (2-2-2)
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('bases')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentTab === 'bases' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Bases Oficiales
          </button>
          <button
            onClick={() => setCurrentTab('registro')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentTab === 'registro' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Inscribir Equipo
          </button>
          <button
            onClick={() => setCurrentTab('equipos')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'equipos' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Equipos Registrados
            <span className="text-xs font-mono text-slate-400">({totalTeamsCount})</span>
          </button>
          <button
            onClick={() => setCurrentTab('fixture')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              currentTab === 'fixture' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Rol de Juegos
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* If Axel is logged in, show his admin banner and logout */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 p-1 sm:p-1.5 rounded-xl">
              <button
                onClick={() => setCurrentTab('admin')}
                className="px-2 py-1 text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Panel Axel</span>
              </button>
              <button
                onClick={onLogoutAdmin}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors rounded cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
