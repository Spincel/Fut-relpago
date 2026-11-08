import React from 'react';
import { ShieldCheck, UserCheck, ArrowUpRight, Trophy, GitBranch } from 'lucide-react';

interface HeaderProps {
  currentTab: 'bases' | 'registro' | 'equipos' | 'fixture' | 'admin';
  setCurrentTab: (tab: 'bases' | 'registro' | 'equipos' | 'fixture' | 'admin') => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onOpenGitModal: () => void;
  totalTeamsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isAdmin,
  setIsAdmin,
  onOpenGitModal,
  totalTeamsCount,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark / Brand Title */}
        <button
          onClick={() => setCurrentTab('bases')}
          className="flex items-center gap-2 text-left group shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="font-display font-black text-sm sm:text-base tracking-tight text-white whitespace-nowrap block">
              Torneo Relámpago
            </span>
            <span className="text-[10px] sm:text-xs text-amber-400 font-medium block -mt-0.5">
              Jueves 12 Nov · 6 Jugadores
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('bases')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'bases' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Bases Oficiales
          </button>
          <button
            onClick={() => setCurrentTab('registro')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'registro' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Inscribir Equipo
          </button>
          <button
            onClick={() => setCurrentTab('equipos')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              currentTab === 'equipos' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Equipos Registrados
            <span className="text-xs font-mono text-slate-400">({totalTeamsCount})</span>
          </button>
          <button
            onClick={() => setCurrentTab('fixture')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              currentTab === 'fixture' ? 'text-amber-400 font-semibold border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Rol de Juegos
          </button>
          <button
            onClick={onOpenGitModal}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1 text-slate-400"
          >
            GitHub Repo
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </nav>

        {/* Zone 3: Primary Action / Mode Switch / GitHub quick access */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenGitModal}
            className="p-2 sm:px-2.5 sm:py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1 text-xs"
            title="Ver repositorio GitHub"
          >
            <GitBranch className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">GitHub</span>
          </button>

          <button
            onClick={() => {
              if (currentTab === 'admin') {
                setCurrentTab('bases');
              } else {
                setIsAdmin(true);
                setCurrentTab('admin');
              }
            }}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              isAdmin && currentTab === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
            }`}
            title="Panel de Axel Javier González Salas"
          >
            {isAdmin && currentTab === 'admin' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Admin Activo</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Axel</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
