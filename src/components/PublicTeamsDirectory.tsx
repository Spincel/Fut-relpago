import React, { useState } from 'react';
import { Search, Trophy, X, Users } from 'lucide-react';
import { Team } from '../types/tournament';
import { getUniformColors } from '../utils/colorHelper';

interface PublicTeamsDirectoryProps {
  teams: Team[];
  onGoToRegister: () => void;
}

export const PublicTeamsDirectory: React.FC<PublicTeamsDirectoryProps> = ({
  teams,
  onGoToRegister,
}) => {
  const [search, setSearch] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const filteredTeams = teams.filter((t) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const matchesName = t.name.toLowerCase().includes(q);
    const matchesFolio = t.folio.toLowerCase().includes(q);
    const matchesColor = t.uniformColor.toLowerCase().includes(q);
    const matchesPlayer = t.players.some((p) => p.fullName.toLowerCase().includes(q));
    return matchesName || matchesFolio || matchesColor || matchesPlayer;
  });

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-3.5 sm:py-5 space-y-3">
      
      {/* Header Bar Ultra-Compacto con Título y Lupa para buscar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        
        {/* Left: Título y contador de equipos */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="font-display font-black text-sm sm:text-base text-white truncate leading-tight">
              Equipos Registrados
            </h1>
            <span className="text-[10px] text-amber-400 font-medium">
              {filteredTeams.length} {filteredTeams.length === 1 ? 'equipo' : 'equipos'}
            </span>
          </div>
        </div>

        {/* Right: Buscador compacto con lupa */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isSearchExpanded || search.length > 0 ? (
            <div className="relative flex items-center animate-in fade-in duration-150">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar equipo, color o jugador..."
                className="w-44 sm:w-64 pl-8 pr-7 py-1 text-xs bg-slate-900 border border-amber-500/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                onClick={() => {
                  setSearch('');
                  setIsSearchExpanded(false);
                }}
                className="absolute right-2 text-slate-400 hover:text-white p-0.5"
                title="Cerrar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 flex items-center gap-1 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
              title="Buscar por equipo, color o jugador"
              aria-label="Buscar equipo"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden min-[360px]:inline text-[11px]">Buscar</span>
            </button>
          )}

          <button
            onClick={onGoToRegister}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            + Inscribir
          </button>
        </div>

      </div>

      {/* Leyenda compacta de grados escolares */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
        <span className="font-semibold text-slate-300">Plantilla 2-2-2:</span>
        <div className="flex items-center gap-1.5 font-bold">
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            3º Año
          </span>
          <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            2º Año
          </span>
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            1º Año
          </span>
        </div>
      </div>

      {/* Grid de Tarjetas Pequeñas de Equipos */}
      {filteredTeams.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
          <Users className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-300 font-medium">
            {search ? `No se encontraron equipos con "${search}"` : 'Aún no hay equipos inscritos.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredTeams.map((team) => {
            const activePlayers = team.players.filter((p) => p.isActive);
            const colors = getUniformColors(team.uniformColor);

            return (
              <div
                key={team.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2 shadow-md"
              >
                {/* Cabecera de la tarjeta: Nombre del equipo, Folio y Color de Uniforme */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 shrink-0">
                        {team.folio}
                      </span>
                      <h2 className="font-display font-black text-sm text-white leading-tight">
                        {team.name}
                      </h2>
                    </div>
                  </div>

                  {/* Color de Uniforme Elegido con puntos de color real */}
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-200 shrink-0">
                    <div className="flex items-center -space-x-1 shrink-0">
                      {colors.map((c, idx) => (
                        <span
                          key={idx}
                          className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span>{team.uniformColor}</span>
                  </span>
                </div>

                {/* Lista de Integrantes con señalización del grado escolar (Grilla de 2 columnas) */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80">
                  {activePlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-1 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        {player.jerseyNumber && (
                          <span className="font-mono text-[9px] text-slate-500 shrink-0">
                            #{player.jerseyNumber}
                          </span>
                        )}
                        <span
                          className="truncate font-medium text-slate-200 text-[11px]"
                          title={player.fullName}
                        >
                          {player.fullName}
                        </span>
                      </div>

                      {/* Pequeña señalización del grado */}
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded shrink-0 ${
                          player.grade === 3
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : player.grade === 2
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                        title={`Alumno de ${player.grade}º Año`}
                      >
                        {player.grade}º
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
