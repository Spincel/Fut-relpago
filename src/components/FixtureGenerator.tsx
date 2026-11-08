import React, { useState } from 'react';
import { Calendar, Clock, Trophy, MapPin, CheckCircle, Shield } from 'lucide-react';
import { Team, TournamentMatch } from '../types/tournament';

interface FixtureGeneratorProps {
  teams: Team[];
  isAdmin: boolean;
}

export const FixtureGenerator: React.FC<FixtureGeneratorProps> = ({ teams, isAdmin }) => {
  // Only teams that comply with the rules or are approved participate
  const validTeams = teams.filter((t) => t.status !== 'disqualified');

  const [matches, setMatches] = useState<TournamentMatch[]>([
    {
      id: 'm-1',
      matchNumber: 1,
      round: 'Cuartos de Final',
      teamAId: teams[0]?.id || '',
      teamBId: teams[1]?.id || '',
      scoreA: 2,
      scoreB: 1,
      timeSlot: '09:00 - 09:30 AM',
      pitch: 'Cancha 1 (Pasto Sintético)',
      status: 'finalizado',
      winnerTeamId: teams[0]?.id || '',
    },
    {
      id: 'm-2',
      matchNumber: 2,
      round: 'Cuartos de Final',
      teamAId: teams[2]?.id || '',
      teamBId: teams[3]?.id || '',
      scoreA: 0,
      scoreB: 3,
      timeSlot: '09:40 - 10:10 AM',
      pitch: 'Cancha 2',
      status: 'finalizado',
      winnerTeamId: teams[3]?.id || '',
    },
    {
      id: 'm-3',
      matchNumber: 3,
      round: 'Semifinales',
      teamAId: teams[0]?.id || '',
      teamBId: teams[3]?.id || '',
      scoreA: undefined,
      scoreB: undefined,
      timeSlot: '11:00 - 11:35 AM',
      pitch: 'Cancha Principal',
      status: 'programado',
    },
    {
      id: 'm-4',
      matchNumber: 4,
      round: 'Gran Final',
      teamAId: teams[0]?.id || '',
      teamBId: 'Por Definir',
      scoreA: undefined,
      scoreB: undefined,
      timeSlot: '12:30 - 01:15 PM',
      pitch: 'Cancha Principal (Ceremonia de Premiación)',
      status: 'programado',
    },
  ]);

  const getTeamName = (id: string) => {
    if (id === 'Por Definir') return 'Por Definir (Ganador Semis)';
    const found = teams.find((t) => t.id === id);
    return found ? found.name : 'Equipo por asignar';
  };

  const getTeamColor = (id: string) => {
    const found = teams.find((t) => t.id === id);
    return found ? found.uniformColor : 'Por asignar';
  };

  const handleUpdateScore = (matchId: string, scoreA: number, scoreB: number) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          const winnerTeamId = scoreA > scoreB ? m.teamAId : scoreB > scoreA ? m.teamBId : undefined;
          return {
            ...m,
            scoreA,
            scoreB,
            status: 'finalizado',
            winnerTeamId,
          };
        }
        return m;
      })
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>Jueves 12 de Noviembre · Formato Eliminación Relámpago</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Rol de Juegos Oficial
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Programación de partidos para la jornada relámpago. Solamente equipos con regla 2-2-2 y
          documentos aprobados por Axel Javier González Salas avanzan en el rol.
        </p>
      </div>

      {/* Info Pill / Notice */}
      <div className="mb-8 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">
            Duración de partidos: <strong>2 tiempos de 15 minutos</strong> con 5 min de descanso.
          </span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>Equipos en competencia: {validTeams.length}</span>
        </div>
      </div>

      {/* Matches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match) => (
          <div
            key={match.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
          >
            {/* Match Header */}
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-display font-bold text-amber-400 uppercase tracking-wide">
                Partido #{match.matchNumber} · {match.round}
              </span>
              <span className="text-slate-400 font-mono">{match.timeSlot}</span>
            </div>

            {/* Pitch Location */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{match.pitch}</span>
            </div>

            {/* Teams Confrontation */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              {/* Team A */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                    A
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">
                      {getTeamName(match.teamAId)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {getTeamColor(match.teamAId)}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xl font-bold text-white tabular-nums">
                  {match.scoreA !== undefined ? match.scoreA : '-'}
                </span>
              </div>

              <div className="border-t border-slate-800 my-1" />

              {/* Team B */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                    B
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">
                      {getTeamName(match.teamBId)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {getTeamColor(match.teamBId)}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xl font-bold text-white tabular-nums">
                  {match.scoreB !== undefined ? match.scoreB : '-'}
                </span>
              </div>
            </div>

            {/* Status / Winner */}
            <div className="flex items-center justify-between text-xs pt-1">
              {match.status === 'finalizado' ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Ganador: {getTeamName(match.winnerTeamId || '')}</span>
                </div>
              ) : (
                <span className="text-amber-400 font-medium">Programado para el Jueves 12</span>
              )}

              {/* Score recording for Axel / Admin */}
              {isAdmin && match.status !== 'finalizado' && (
                <button
                  onClick={() => handleUpdateScore(match.id, 2, 1)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-[11px] font-semibold border border-slate-700 transition-colors"
                >
                  Registrar Marcador
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Tournament Final Award reminder */}
      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 text-center space-y-2">
        <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold font-display text-white">
          Gran Final y Entrega del Premio Sorpresa
        </h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Al término del último partido, el coordinador general <strong>Axel Javier González Salas</strong>{' '}
          hará la entrega del trofeo oficial y revelará el <strong>Premio Sorpresa</strong> a la escuadra campeona.
        </p>
      </div>

    </div>
  );
};
