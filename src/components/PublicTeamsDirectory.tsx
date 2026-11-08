import React, { useState } from 'react';
import { Search, ShieldCheck, AlertTriangle, Users, Trophy, Eye, CheckCircle2, FileText } from 'lucide-react';
import { Team, Player } from '../types/tournament';
import { evaluateTeamRules } from '../utils/rulesValidator';

interface PublicTeamsDirectoryProps {
  teams: Team[];
  onGoToRegister: () => void;
  onOpenDocumentModal: (player: Player, team: Team) => void;
  onOpenGameSheetModal: (team: Team) => void;
}

export const PublicTeamsDirectory: React.FC<PublicTeamsDirectoryProps> = ({
  teams,
  onGoToRegister,
  onOpenDocumentModal,
  onOpenGameSheetModal,
}) => {
  const [search, setSearch] = useState('');
  const [activeGradeFilter, setActiveGradeFilter] = useState<'all' | 'compliant' | 'review'>('all');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.folio.toLowerCase().includes(search.toLowerCase()) ||
      t.uniformColor.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const check = evaluateTeamRules(t);
    if (activeGradeFilter === 'compliant') return check.isFullyCompliant;
    if (activeGradeFilter === 'review') return !check.isFullyCompliant;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span>Padrón Oficial de Convocatoria</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Equipos Registrados
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Consulta los equipos inscritos, la composición de 6 jugadores (2 de 3º, 2 de 2º y 2 de 1º)
            y el estado de validación con el comité organizador.
          </p>
        </div>

        <button
          onClick={onGoToRegister}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/20 whitespace-nowrap self-start md:self-auto"
        >
          + Inscribir Nuevo Equipo
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de equipo, folio o uniforme..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveGradeFilter('all')}
            className={`py-1.5 px-3 rounded-md font-medium transition-colors ${
              activeGradeFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({teams.length})
          </button>
          <button
            onClick={() => setActiveGradeFilter('compliant')}
            className={`py-1.5 px-3 rounded-md font-medium transition-colors ${
              activeGradeFilter === 'compliant'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            100% Reglas Válidas
          </button>
          <button
            onClick={() => setActiveGradeFilter('review')}
            className={`py-1.5 px-3 rounded-md font-medium transition-colors ${
              activeGradeFilter === 'review'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            En Revisión / Irregulares
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => {
          const check = evaluateTeamRules(team);
          const isExpanded = expandedTeamId === team.id;
          const activePlayers = team.players.filter((p) => p.isActive);

          return (
            <div
              key={team.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-amber-400 font-bold">{team.folio}</span>
                  
                  {team.status === 'disqualified' ? (
                    <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Baja
                    </span>
                  ) : check.isFullyCompliant ? (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Reglas Oficiales Cumplidas
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Revisión de Bases
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold font-display text-white">
                  {team.name}
                </h3>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Uniforme: <strong className="text-slate-300">{team.uniformColor}</strong>
                </span>

                {/* Rules 2-2-2 badge indicators */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Composición 2-2-2:</span>
                    <span className="font-mono text-[11px] text-slate-300">
                      {activePlayers.length}/6 Jugadores
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono">
                    <div
                      className={`p-1.5 rounded ${
                        check.grade3Count === 2
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60'
                          : 'bg-amber-950/40 text-amber-400 border border-amber-900/60 font-bold'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block font-sans">3er Año</span>
                      <span>{check.grade3Count}/2</span>
                    </div>

                    <div
                      className={`p-1.5 rounded ${
                        check.grade2Count === 2
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60'
                          : 'bg-amber-950/40 text-amber-400 border border-amber-900/60 font-bold'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block font-sans">2do Año</span>
                      <span>{check.grade2Count}/2</span>
                    </div>

                    <div
                      className={`p-1.5 rounded ${
                        check.grade1Count === 2
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60'
                          : 'bg-amber-950/40 text-amber-400 border border-amber-900/60 font-bold'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block font-sans">1er Año</span>
                      <span>{check.grade1Count}/2</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Player List */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300 block">
                      Plantilla Registrada:
                    </span>
                    <div className="space-y-1.5">
                      {activePlayers.map((player) => (
                        <div
                          key={player.id}
                          className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-white block">
                              #{player.jerseyNumber} {player.fullName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {player.position} · {player.grade}º Año
                            </span>
                          </div>
                          <button
                            onClick={() => onOpenDocumentModal(player, team)}
                            className="p-1 text-slate-400 hover:text-amber-400"
                            title="Ver credencial"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                  className="text-xs text-slate-400 hover:text-white font-medium"
                >
                  {isExpanded ? 'Ocultar jugadores' : 'Ver 6 jugadores'}
                </button>

                <button
                  onClick={() => onOpenGameSheetModal(team)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs rounded border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Cédula</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
