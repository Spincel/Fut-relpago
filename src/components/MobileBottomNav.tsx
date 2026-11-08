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
    <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1 shadow-2xl safe-area-bottom">
      <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} items-center justify-around max-w-md mx-auto h-16`}>
        
        {/* Tab 1: Bases / Inicio */}
        <button
          onClick={() => setCurrentTab('bases')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer ${
            currentTab === 'bases' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight leading-tight">Inicio</span>
        </button>

        {/* Tab 2: Equipos */}
        <button
          onClick={() => setCurrentTab('equipos')}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer ${
            currentTab === 'equipos' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight leading-tight">Equipos</span>
          <span className="absolute top-1 right-2 text-[9px] font-mono font-bold bg-slate-800 text-amber-400 px-1 rounded-full border border-slate-700">
            {teamsCount}
          </span>
        </button>

        {/* Tab 3: Central Highlight: Inscribir */}
        <button
          onClick={() => setCurrentTab('registro')}
          className="flex flex-col items-center justify-center -mt-5 group focus:outline-none cursor-pointer"
        >
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 border-2 ${
            currentTab === 'registro'
              ? 'bg-amber-400 text-slate-950 border-white shadow-amber-500/40'
              : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-amber-500/25 group-hover:scale-105'
          }`}>
            <span className="text-xl">⚽</span>
          </div>
          <span className={`text-[10px] font-extrabold mt-1 tracking-tight ${
            currentTab === 'registro' ? 'text-amber-400' : 'text-slate-300'
          }`}>
            Inscribir
          </span>
        </button>

        {/* Tab 4: Rol / Fixture */}
        <button
          onClick={() => setCurrentTab('fixture')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer ${
            currentTab === 'fixture' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight leading-tight">Rol Jueves</span>
        </button>

        {/* Tab 5: Admin Panel (ONLY visible when Axel is logged in!) */}
        {isAdmin && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer ${
              currentTab === 'admin' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight leading-tight">Panel Axel</span>
            {newRegistrationsCount > 0 && (
              <span className="absolute top-1 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>
        )}

      </div>
    </nav>
  );
};
