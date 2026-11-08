import React from 'react';
import { ShieldCheck, UserCheck, ArrowUpRight, Trophy } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Wordmark / Brand Title */}
        <button
          onClick={() => setCurrentTab('bases')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white whitespace-nowrap block">
              Torneo Relámpago de Fútbol
            </span>
            <span className="text-xs text-amber-400 font-medium block -mt-0.5">
              Jueves 12 de Noviembre · Plantilla 6 Jugadores
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
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

        {/* Zone 3: Primary Action / Mode Switch */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (currentTab === 'admin') {
                setCurrentTab('bases');
              } else {
                setIsAdmin(true);
                setCurrentTab('admin');
              }
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              isAdmin && currentTab === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Panel de Axel Javier González Salas"
          >
            {isAdmin && currentTab === 'admin' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Panel Admin Activo</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Acceso Admin (Axel)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
