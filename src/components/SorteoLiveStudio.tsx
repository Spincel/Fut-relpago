import React, { useState, useEffect } from 'react';
import { Trophy, Play, CheckCircle2, X, Sparkles, Shuffle, ShieldCheck } from 'lucide-react';
import { Team, TournamentMatch } from '../types/tournament';

interface SorteoLiveStudioProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  format: 'eliminacion' | 'grupos';
  onPublishFixture: (matches: TournamentMatch[]) => void;
}

export const SorteoLiveStudio: React.FC<SorteoLiveStudioProps> = ({
  isOpen,
  onClose,
  teams,
  format,
  onPublishFixture,
}) => {
  const [phase, setPhase] = useState<'ready' | 'spinning' | 'revealing' | 'completed'>('ready');
  const [currentStep, setCurrentStep] = useState(0);
  const [tickerName, setTickerName] = useState('');
  const [generatedMatches, setGeneratedMatches] = useState<TournamentMatch[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);

  // Generate randomized matches based on format
  const generateDraw = () => {
    // Shuffle teams
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const matches: TournamentMatch[] = [];

    if (format === 'eliminacion') {
      const matchCount = Math.floor(shuffled.length / 2);
      const roundName =
        shuffled.length >= 8
          ? 'Cuartos de Final'
          : shuffled.length >= 4
          ? 'Semifinales'
          : 'Partido Oficial';

      const timeSlots = [
        '09:00 - 09:35 AM',
        '09:45 - 10:20 AM',
        '10:30 - 11:05 AM',
        '11:15 - 11:50 AM',
        '12:00 - 12:35 PM',
      ];
      const pitches = ['Cancha 1 (Pasto Sintético)', 'Cancha 2', 'Cancha Principal'];

      for (let i = 0; i < matchCount; i++) {
        const teamA = shuffled[i * 2];
        const teamB = shuffled[i * 2 + 1];
        if (teamA && teamB) {
          matches.push({
            id: `m-draw-${Date.now()}-${i + 1}`,
            matchNumber: i + 1,
            round: roundName,
            teamAId: teamA.id,
            teamBId: teamB.id,
            timeSlot: timeSlots[i % timeSlots.length],
            pitch: pitches[i % pitches.length],
            status: 'programado',
          });
        }
      }

      // Add final placeholder
      if (matchCount > 1) {
        matches.push({
          id: `m-draw-${Date.now()}-final`,
          matchNumber: matchCount + 1,
          round: 'Gran Final',
          teamAId: 'Por Definir',
          teamBId: 'Por Definir',
          timeSlot: '12:30 - 01:15 PM',
          pitch: 'Cancha Principal (Ceremonia de Premiación)',
          status: 'programado',
        });
      }
    } else {
      // Fase de grupos
      const mid = Math.ceil(shuffled.length / 2);
      const groupA = shuffled.slice(0, mid);
      const groupB = shuffled.slice(mid);

      let mNum = 1;
      // Group A matches
      for (let i = 0; i < groupA.length; i++) {
        for (let j = i + 1; j < groupA.length; j++) {
          matches.push({
            id: `m-group-a-${mNum}`,
            matchNumber: mNum++,
            round: 'Fase de Grupos',
            groupName: 'Grupo A',
            teamAId: groupA[i].id,
            teamBId: groupA[j].id,
            timeSlot: `09:${(mNum * 20).toString().padStart(2, '0')} AM`,
            pitch: 'Cancha 1',
            status: 'programado',
          });
        }
      }
      // Group B matches
      for (let i = 0; i < groupB.length; i++) {
        for (let j = i + 1; j < groupB.length; j++) {
          matches.push({
            id: `m-group-b-${mNum}`,
            matchNumber: mNum++,
            round: 'Fase de Grupos',
            groupName: 'Grupo B',
            teamAId: groupB[i].id,
            teamBId: groupB[j].id,
            timeSlot: `10:${(mNum * 15).toString().padStart(2, '0')} AM`,
            pitch: 'Cancha 2',
            status: 'programado',
          });
        }
      }

      // Final match
      matches.push({
        id: `m-final-groups`,
        matchNumber: mNum,
        round: 'Gran Final',
        groupName: 'Final Oficial',
        teamAId: 'Líder Grupo A',
        teamBId: 'Líder Grupo B',
        timeSlot: '12:30 - 01:15 PM',
        pitch: 'Cancha Principal',
        status: 'programado',
      });
    }

    return matches;
  };

  const handleStartDraw = () => {
    const draw = generateDraw();
    setGeneratedMatches(draw);
    setPhase('spinning');
    setRevealedCount(0);
  };

  // Spinning ticker effect
  useEffect(() => {
    if (phase !== 'spinning') return;
    const interval = setInterval(() => {
      const randTeam = teams[Math.floor(Math.random() * teams.length)];
      if (randTeam) setTickerName(randTeam.name);
    }, 70);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setPhase('revealing');
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [phase, teams]);

  // Revealing matches step by step with cinematic pause
  useEffect(() => {
    if (phase !== 'revealing') return;
    if (revealedCount < generatedMatches.length) {
      const timer = setTimeout(() => {
        setRevealedCount((prev) => prev + 1);
      }, 1600);
      return () => clearTimeout(timer);
    } else {
      setPhase('completed');
    }
  }, [phase, revealedCount, generatedMatches.length]);

  if (!isOpen) return null;

  const getTeamObj = (id: string) => teams.find((t) => t.id === id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300 select-none overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-5 text-center my-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Studio Broadcast Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Transmisión de Sorteo en Vivo · Grabación
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Sorteo Oficial de Enfrentamientos
          </h2>
          <p className="text-xs text-amber-400 font-semibold">
            Torneo Relámpago de Fútbol · Organiza: Axel Javier González Salas
          </p>
          <div className="text-[11px] text-slate-400">
            Formato:{' '}
            <strong className="text-white">
              {format === 'eliminacion' ? '⚡ Eliminación Directa' : '🏆 Fase de Grupos'}
            </strong>{' '}
            · {teams.length} Equipos participantes
          </div>
        </div>

        {/* STAGE 1: READY */}
        {phase === 'ready' && (
          <div className="py-6 space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-amber-500/20">
              ⚽
            </div>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Inicia la animación del sorteo para asignar los cruces de forma 100% aleatoria y transparente. Puedes comenzar a grabar la pantalla de tu celular antes de presionar el botón.
            </p>
            <button
              onClick={handleStartDraw}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 mx-auto cursor-pointer active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
              <span>INICIAR SORTEO OFICIAL (GRABAR PANTALLA)</span>
            </button>
          </div>
        )}

        {/* STAGE 2: SPINNING TOMBOLA */}
        {phase === 'spinning' && (
          <div className="py-8 space-y-4">
            <div className="w-24 h-24 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto flex items-center justify-center text-4xl shadow-2xl">
              ⚽
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
                Mezclando bombos oficiales...
              </span>
              <div className="font-display font-black text-2xl sm:text-3xl text-amber-400 animate-pulse">
                {tickerName || 'Sorteando...'}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: REVEALING & COMPLETED */}
        {(phase === 'revealing' || phase === 'completed') && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {phase === 'completed'
                  ? '¡Sorteo concluido con éxito!'
                  : `Revelando enfrentamiento ${revealedCount} de ${generatedMatches.length}...`}
              </span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
              {generatedMatches.slice(0, revealedCount).map((match, idx) => {
                const teamA = getTeamObj(match.teamAId);
                const teamB = getTeamObj(match.teamBId);

                return (
                  <div
                    key={match.id}
                    className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow-lg space-y-2 animate-in zoom-in-95 duration-300"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1">
                      <span className="font-bold text-amber-400">
                        {match.round} {match.groupName ? `· ${match.groupName}` : ''} · Partido #{match.matchNumber}
                      </span>
                      <span>{match.timeSlot} · {match.pitch}</span>
                    </div>

                    {/* Matchup row */}
                    <div className="flex items-center justify-between gap-3 text-sm sm:text-base font-black">
                      <div className="flex-1 text-right truncate">
                        <span className="text-white block truncate">{teamA ? teamA.name : match.teamAId}</span>
                        {teamA && (
                          <span className="text-[10px] text-slate-400 font-normal block truncate">
                            Uniforme: {teamA.uniformColor}
                          </span>
                        )}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xs font-black shrink-0">
                        VS
                      </div>

                      <div className="flex-1 text-left truncate">
                        <span className="text-white block truncate">{teamB ? teamB.name : match.teamBId}</span>
                        {teamB && (
                          <span className="text-[10px] text-slate-400 font-normal block truncate">
                            Uniforme: {teamB.uniformColor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion Actions */}
            {phase === 'completed' && (
              <div className="pt-3 space-y-2 animate-in fade-in duration-300">
                <button
                  onClick={() => {
                    onPublishFixture(generatedMatches);
                    onClose();
                  }}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>PUBLICAR ROL OFICIAL DE JUEGOS PARA TODOS</span>
                </button>

                <button
                  onClick={() => {
                    setPhase('ready');
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Volver a Sortear</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
