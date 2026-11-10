import React, { useState } from 'react';
import { Calendar, Search, Trophy, CheckCircle2, X, Users, MapPin, Clock } from 'lucide-react';
import { Team, TournamentMatch } from '../types/tournament';
import { getUniformColors } from '../utils/colorHelper';

interface FixtureGeneratorProps {
  teams: Team[];
  matches: TournamentMatch[];
  isAdmin?: boolean;
}

export const FixtureGenerator: React.FC<FixtureGeneratorProps> = ({
  teams,
  matches,
}) => {
  const [searchTeam, setSearchTeam] = useState('');

  const getTeam = (id: string) => teams.find((t) => t.id === id);

  // Search for the user's specific team match
  const userTeamMatches = searchTeam.trim()
    ? matches.filter((m) => {
        const teamA = getTeam(m.teamAId);
        const teamB = getTeam(m.teamBId);
        const q = searchTeam.toLowerCase().trim();
        const aMatches = teamA && teamA.name.toLowerCase().includes(q);
        const bMatches = teamB && teamB.name.toLowerCase().includes(q);
        return aMatches || bMatches;
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-black text-base sm:text-lg text-white leading-tight">
                Rol Oficial de Juegos
              </h1>
              <p className="text-[11px] text-amber-400 font-medium">
                Torneo Relámpago · Jueves 12 de Noviembre
              </p>
            </div>
          </div>
        </div>

        {/* Quick Search for user's team */}
        {matches.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTeam}
              onChange={(e) => setSearchTeam(e.target.value)}
              placeholder="Busca tu equipo para ver tu rival..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchTeam && (
              <button
                onClick={() => setSearchTeam('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* HIGHLIGHT SEARCH RESULT: Contra quién juega tu equipo */}
      {searchTeam.trim() && userTeamMatches.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/40 border-2 border-amber-500/60 shadow-xl space-y-2.5 animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Tu Enfrentamiento Oficial</span>
            </span>
            <span className="text-[10px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
              {userTeamMatches[0].round}
            </span>
          </div>

          {userTeamMatches.map((m) => {
            const teamA = getTeam(m.teamAId);
            const teamB = getTeam(m.teamBId);
            const colorsA = teamA ? getUniformColors(teamA.uniformColor) : [];
            const colorsB = teamB ? getUniformColors(teamB.uniformColor) : [];

            return (
              <div key={m.id} className="space-y-2">
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3 text-sm font-black">
                  
                  {/* Team A */}
                  <div className="flex-1 text-right truncate">
                    <span className="text-white block truncate">{teamA ? teamA.name : m.teamAId}</span>
                    {teamA && (
                      <span className="text-[10px] font-normal text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                        <span className="flex items-center -space-x-1">
                          {colorsA.map((c, i) => (
                            <span key={i} className="w-2 h-2 rounded-full border border-slate-900" style={{ backgroundColor: c }} />
                          ))}
                        </span>
                        <span>{teamA.uniformColor}</span>
                      </span>
                    )}
                  </div>

                  {/* VS Badge or Score */}
                  <div className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-sm font-black shrink-0">
                    {m.status === 'finalizado' ? `${m.scoreA ?? 0} - ${m.scoreB ?? 0}` : 'VS'}
                  </div>

                  {/* Team B */}
                  <div className="flex-1 text-left truncate">
                    <span className="text-white block truncate">{teamB ? teamB.name : m.teamBId}</span>
                    {teamB && (
                      <span className="text-[10px] font-normal text-slate-400 flex items-center justify-start gap-1 mt-0.5">
                        <span className="flex items-center -space-x-1">
                          {colorsB.map((c, i) => (
                            <span key={i} className="w-2 h-2 rounded-full border border-slate-900" style={{ backgroundColor: c }} />
                          ))}
                        </span>
                        <span>{teamB.uniformColor}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 px-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <strong>Horario:</strong> {m.timeSlot}
                  </span>
                  <span className="font-mono text-amber-400 font-bold text-[11px]">
                    Jueves 12 Nov
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Matches Found in Search */}
      {searchTeam.trim() && userTeamMatches.length === 0 && (
        <div className="p-3 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          No se encontró ningún enfrentamiento para "{searchTeam}". Verifica el nombre de tu equipo.
        </div>
      )}

      {/* STATE 1: NO MATCHES GENERATED YET */}
      {matches.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl">
            ⚽
          </div>
          <h2 className="font-display font-black text-lg text-white">
            El Sorteo Oficial está en Preparación
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            El coordinador <strong className="text-white">Axel Javier González Salas</strong> realizará el sorteo oficial y publicará los enfrentamientos una vez cerradas las inscripciones.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-amber-400 font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{teams.length} Equipos registrados hasta el momento</span>
          </div>
        </div>
      ) : (
        /* STATE 2: FULL SCHEDULE LIST */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Todos los Enfrentamientos ({matches.length})</span>
            <span>Jueves 12 de Noviembre</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matches.map((m) => {
              const teamA = getTeam(m.teamAId);
              const teamB = getTeam(m.teamBId);
              const colorsA = teamA ? getUniformColors(teamA.uniformColor) : [];
              const colorsB = teamB ? getUniformColors(teamB.uniformColor) : [];

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5 shadow-md"
                >
                  {/* Round & Match Details */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
                    <span className="font-bold text-amber-400">
                      {m.round} {m.groupName ? `· ${m.groupName}` : ''} · Partido #{m.matchNumber}
                    </span>
                    <span className={`px-2 py-0.2 rounded-full font-bold text-[9px] ${
                      m.status === 'finalizado'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}>
                      {m.status === 'finalizado' ? 'Finalizado' : 'Programado'}
                    </span>
                  </div>

                  {/* Matchup row */}
                  <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-black">
                    {/* Team A */}
                    <div className="flex-1 text-right truncate">
                      <span className="text-white block truncate">{teamA ? teamA.name : m.teamAId}</span>
                      {teamA && (
                        <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] font-normal text-slate-400">
                          <div className="flex items-center -space-x-1 shrink-0">
                            {colorsA.map((c, i) => (
                              <span key={i} className="w-2 h-2 rounded-full border border-slate-900" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="truncate">{teamA.uniformColor}</span>
                        </div>
                      )}
                    </div>

                    {/* Score / VS Box */}
                    <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs font-black shrink-0">
                      {m.status === 'finalizado' ? `${m.scoreA ?? 0} - ${m.scoreB ?? 0}` : 'VS'}
                    </div>

                    {/* Team B */}
                    <div className="flex-1 text-left truncate">
                      <span className="text-white block truncate">{teamB ? teamB.name : m.teamBId}</span>
                      {teamB && (
                        <div className="flex items-center justify-start gap-1 mt-0.5 text-[10px] font-normal text-slate-400">
                          <div className="flex items-center -space-x-1 shrink-0">
                            {colorsB.map((c, i) => (
                              <span key={i} className="w-2 h-2 rounded-full border border-slate-900" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="truncate">{teamB.uniformColor}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {m.timeSlot}
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      Jueves 12 Nov
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
