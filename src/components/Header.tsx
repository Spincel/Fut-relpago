import React from 'react';
import { ShieldCheck, LogOut, Trophy, Lock } from 'lucide-react';

interface HeaderProps {
  currentTab: 'bases' | 'registro' | 'equipos' | 'fixture' | 'admin';
  setCurrentTab: (tab: 'bases' | 'registro' | 'equipos' | 'fixture' | 'admin') => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  totalTeamsCount: number;
  onOpenAdminLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isAdmin,
  onLogoutAdmin,
  totalTeamsCount,
  onOpenAdminLogin,
}) => {
  return (
    <header className="app-header no-print shrink-0 z-30 w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        
        {/* Zone 1: Wordmark / Brand Title */}
        <button
          onClick={() => setCurrentTab('bases')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none cursor-pointer active:scale-95 transition-transform"
          aria-label="Ir a Inicio"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-sm">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm sm:text-base tracking-tight text-white whitespace-nowrap block truncate">
                Torneo Relámpago
              </span>
              <span className="lg:hidden text-[9px] font-bold font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20">
                2-2-2
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium block -mt-0.5 truncate">
              Jueves 12 Nov · 6 Jugadores por Equipo
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop only) */}
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

        {/* Zone 3: Actions (Mobile App Bar Right Side) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* If Axel is logged in, show his admin banner and logout */}
          {isAdmin ? (
            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 px-2 py-1 rounded-xl">
              <button
                onClick={() => setCurrentTab('admin')}
                className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] sm:text-xs">Axel</span>
              </button>
              <button
                onClick={onLogoutAdmin}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors rounded cursor-pointer flex items-center justify-center"
                title="Cerrar sesión de organizador"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Quick pill to view teams */}
              <button
                onClick={() => setCurrentTab('equipos')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-bold text-amber-400 active:scale-95 transition-transform cursor-pointer"
                title="Ver equipos inscritos"
              >
                <span>⚽</span>
                <span>{totalTeamsCount}</span>
                <span className="hidden min-[380px]:inline text-slate-400 font-normal">equipos</span>
              </button>

              {/* Discreet organizer lock access */}
              {onOpenAdminLogin && (
                <button
                  onClick={onOpenAdminLogin}
                  aria-label="Acceso Organizador"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-900 transition-colors cursor-pointer active:scale-95"
                  title="Acceso exclusivo Axel"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
