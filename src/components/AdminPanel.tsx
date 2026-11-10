import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Shuffle,
  Trash2,
  ExternalLink,
  MessageCircle,
  Download,
  LogOut,
  Sparkles,
  Trophy,
  UserPlus,
  RefreshCw,
  Search,
  Check,
  X,
  Maximize2,
} from 'lucide-react';
import { Team, Player, TournamentMatch, GradeYear, PlayerPosition } from '../types/tournament';
import { evaluateTeamRules, findTeamDuplicatePlayers, canSubstitutePlayer } from '../utils/rulesValidator';
import {
  generateWhatsAppApprovalLink,
  generateWhatsAppDuplicatePlayerLink,
  generateWhatsAppObservationsLink,
  generateWhatsAppFixtureBroadcastLink,
} from '../utils/whatsappHelper';
import { exportTeamsToCSV, deleteTeamFromCloud } from '../utils/storage';
import { generateTeamPosterDataUrl, generateFixturePosterDataUrl } from '../utils/posterGenerator';
import { SorteoLiveStudio } from './SorteoLiveStudio';
import { TeamBadge } from './TeamBadge';

interface AdminPanelProps {
  teams: Team[];
  onUpdateTeams: (updated: Team[]) => void;
  matches: TournamentMatch[];
  onUpdateMatches: (matches: TournamentMatch[]) => void;
  onLogoutAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  teams,
  onUpdateTeams,
  matches,
  onUpdateMatches,
  onLogoutAdmin,
}) => {
  const [adminTab, setAdminTab] = useState<'validacion' | 'sorteo' | 'directorio'>('validacion');
  const [tournamentFormat, setTournamentFormat] = useState<'eliminacion' | 'grupos'>('eliminacion');
  const [isSorteoStudioOpen, setIsSorteoStudioOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  // Substitution modal
  const [substitutionModal, setSubstitutionModal] = useState<{
    isOpen: boolean;
    team: Team | null;
    player: Player | null;
  }>({
    isOpen: false,
    team: null,
    player: null,
  });
  const [subName, setSubName] = useState('');
  const [subGrade, setSubGrade] = useState<GradeYear>(2);
  const [subPosition, setSubPosition] = useState<PlayerPosition>('Medio');
  const [subJersey, setSubJersey] = useState('10');
  const [subError, setSubError] = useState<string | null>(null);
  const [fixturePosterUrl, setFixturePosterUrl] = useState<string>('');
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  // Metrics
  const approvedTeams = teams.filter((t) => t.status === 'approved');
  const pendingTeams = teams.filter((t) => t.status !== 'approved' && t.status !== 'disqualified');

  // Generate Fixture Poster whenever matches change
  useEffect(() => {
    if (matches.length > 0) {
      try {
        const url = generateFixturePosterDataUrl(matches, teams);
        setFixturePosterUrl(url);
      } catch (err) {
        console.error('Error generating fixture poster:', err);
      }
    } else {
      setFixturePosterUrl('');
    }
  }, [matches, teams]);

  // Handle Team Authorization: Aprueba el equipo Y abre WhatsApp automáticamente con el mensaje oficial
  const handleApproveTeam = (teamId: string) => {
    const targetTeam = teams.find((t) => t.id === teamId);
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          status: 'approved' as const,
          players: t.players.map((p) => ({
            ...p,
            document: {
              ...(p.document || {}),
              status: 'approved' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Axel Javier González Salas',
            },
          })),
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    onUpdateTeams(updated);

    // Abrir WhatsApp al capitán notificando que su equipo quedó registrado y aprobado oficialmente
    if (targetTeam) {
      const approvedTeam: Team = {
        ...targetTeam,
        status: 'approved',
      };
      const waUrl = generateWhatsAppApprovalLink(approvedTeam);
      window.open(waUrl, '_blank');
    }
  };

  // Realizar Sorteo Rápido Directo
  const handleQuickDraw = () => {
    if (approvedTeams.length < 2) return;
    const shuffled = [...approvedTeams].sort(() => Math.random() - 0.5);
    const newMatches: TournamentMatch[] = [];

    if (tournamentFormat === 'eliminacion') {
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

      for (let i = 0; i < matchCount; i++) {
        const teamA = shuffled[i * 2];
        const teamB = shuffled[i * 2 + 1];
        if (teamA && teamB) {
          newMatches.push({
            id: `m-draw-${Date.now()}-${i + 1}`,
            matchNumber: i + 1,
            round: roundName,
            teamAId: teamA.id,
            teamBId: teamB.id,
            timeSlot: timeSlots[i % timeSlots.length],
            status: 'programado',
          });
        }
      }

      if (matchCount > 1) {
        newMatches.push({
          id: `m-draw-${Date.now()}-final`,
          matchNumber: matchCount + 1,
          round: 'Gran Final',
          teamAId: 'Por Definir',
          teamBId: 'Por Definir',
          timeSlot: '12:30 - 01:15 PM',
          status: 'programado',
        });
      }
    } else {
      // Fase de grupos
      const mid = Math.ceil(shuffled.length / 2);
      const groupA = shuffled.slice(0, mid);
      const groupB = shuffled.slice(mid);
      let mNum = 1;
      for (let i = 0; i < groupA.length; i++) {
        for (let j = i + 1; j < groupA.length; j++) {
          newMatches.push({
            id: `m-group-a-${mNum}`,
            matchNumber: mNum++,
            round: 'Fase de Grupos',
            groupName: 'Grupo A',
            teamAId: groupA[i].id,
            teamBId: groupA[j].id,
            timeSlot: `09:${(mNum * 20).toString().padStart(2, '0')} AM`,
            status: 'programado',
          });
        }
      }
      for (let i = 0; i < groupB.length; i++) {
        for (let j = i + 1; j < groupB.length; j++) {
          newMatches.push({
            id: `m-group-b-${mNum}`,
            matchNumber: mNum++,
            round: 'Fase de Grupos',
            groupName: 'Grupo B',
            teamAId: groupB[i].id,
            teamBId: groupB[j].id,
            timeSlot: `10:${(mNum * 15).toString().padStart(2, '0')} AM`,
            status: 'programado',
          });
        }
      }
      newMatches.push({
        id: `m-final-groups`,
        matchNumber: mNum,
        round: 'Gran Final',
        groupName: 'Líder A vs Líder B',
        teamAId: 'Líder Grupo A',
        teamBId: 'Líder Grupo B',
        timeSlot: '12:30 - 01:15 PM',
        status: 'programado',
      });
    }

    onUpdateMatches(newMatches);
  };

  // Handle Delete Team
  const handleConfirmDelete = () => {
    if (!teamToDelete) return;
    const deletedId = teamToDelete.id;
    const updated = teams.filter((t) => t.id !== deletedId);
    onUpdateTeams(updated);
    deleteTeamFromCloud(deletedId).catch(() => {});
    setTeamToDelete(null);
  };

  // Handle Substitution
  const handleConfirmSubstitution = () => {
    if (!substitutionModal.team || !substitutionModal.player) return;
    if (!subName.trim()) {
      setSubError('Debes ingresar el nombre del nuevo jugador.');
      return;
    }

    const check = canSubstitutePlayer(substitutionModal.player, subGrade);
    if (!check.allowed) {
      setSubError(check.reason || 'Sustitución no permitida');
      return;
    }

    const newPlayer: Player = {
      id: `sub-${Date.now()}`,
      fullName: subName.trim(),
      grade: subGrade,
      position: subPosition,
      jerseyNumber: subJersey ? parseInt(subJersey, 10) : undefined,
      isActive: true,
      document: {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Axel Javier González Salas',
      },
    };

    const updated = teams.map((t) => {
      if (t.id === substitutionModal.team?.id) {
        return {
          ...t,
          players: t.players.map((p) =>
            p.id === substitutionModal.player?.id
              ? { ...p, isActive: false, deactivationReason: `Sustituido por ${subName.trim()}` }
              : p
          ).concat(newPlayer),
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    onUpdateTeams(updated);
    setSubstitutionModal({ isOpen: false, team: null, player: null });
    setSubName('');
    setSubError(null);
  };

  // Handle Match Score Update
  const handleScoreChange = (matchId: string, scoreA: number, scoreB: number) => {
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        const winner = scoreA > scoreB ? m.teamAId : scoreB > scoreA ? m.teamBId : undefined;
        return {
          ...m,
          scoreA,
          scoreB,
          status: 'finalizado' as const,
          winnerTeamId: winner,
        };
      }
      return m;
    });
    onUpdateMatches(updated);
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 pb-28">
      
      {/* =========================================================
          TOP ADMIN EXCLUSIVE APP BAR (Limpia estilo App)
          ========================================================= */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-amber-500/30 shadow-lg">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* Admin Identity */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xs sm:text-sm text-white truncate">
                  Panel Organizador
                </span>
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 shrink-0">
                  Axel Javier G. S.
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5 truncate">
                {teams.length} Equipos ({approvedTeams.length} Aprobados · {pendingTeams.length} Pendientes)
              </span>
            </div>
          </div>

          {/* Quick Stats Pill & Exit */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
              <Sparkles className="w-3 h-3" />
              <span>Nube Activa</span>
            </span>
            <button
              onClick={onLogoutAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer active:scale-95"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-xs">Salir</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 pt-4 space-y-4">

        {/* =========================================================
            TAB 1: VALIDACIÓN, COTEJO DE BASES & WHATSAPP
            ========================================================= */}
        {adminTab === 'validacion' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-sm sm:text-base text-white">
                  Revisión y Autorización de Equipos
                </h3>
                <p className="text-xs text-slate-400">
                  Detecta automáticamente si un jugador fue registrado en dos equipos y envía notificaciones directas por WhatsApp.
                </p>
              </div>
            </div>

            {teams.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <Users className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="font-bold text-white text-sm">No hay registros pendientes</h4>
                <p className="text-xs text-slate-400">
                  Los equipos que se registren desde la app aparecerán aquí para que los autorices.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => {
                  const check = evaluateTeamRules(team);
                  const duplicates = findTeamDuplicatePlayers(team, teams);
                  const isApproved = team.status === 'approved';

                  return (
                    <div
                      key={team.id}
                      className={`p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border transition-all space-y-3 shadow-lg ${
                        duplicates.length > 0
                          ? 'border-red-500/60 bg-red-950/10'
                          : isApproved
                          ? 'border-emerald-500/40'
                          : 'border-amber-500/40'
                      }`}
                    >
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <TeamBadge badge={team.badge} teamName={team.name} size={36} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                {team.folio}
                              </span>
                              <h4 className="font-display font-black text-sm sm:text-base text-white leading-tight">
                                {team.name}
                              </h4>
                              <span className="text-[10px] text-slate-300 bg-slate-950 px-2 py-0.2 rounded-full border border-slate-800">
                                Uniforme: {team.uniformColor}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Capitán: <strong className="text-white">{team.captain.fullName}</strong> · WhatsApp:{' '}
                              <strong className="text-emerald-400 font-mono">{team.captain.phone}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isApproved ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Autorizado</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Por Autorizar</span>
                          </span>
                        )}
                      </div>

                      {/* DUPLICATE PLAYERS ALERT (Requisito fundamental solicitado por el usuario) */}
                      {duplicates.length > 0 && (
                        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/60 space-y-2 animate-in zoom-in-95">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>¡ALERTA DE JUGADOR DUPLICADO DETECTADA!</span>
                          </div>
                          <div className="space-y-1 text-xs text-slate-200">
                            {duplicates.map((d, i) => (
                              <p key={i} className="leading-snug">
                                El jugador <strong className="text-white">"{d.player.fullName}"</strong> ({d.player.grade}º año) también está registrado en el equipo <strong className="text-amber-300">"{d.otherTeam.name}"</strong> (Folio: {d.otherTeam.folio}). La regla oficial prohíbe que un alumno juegue en dos equipos.
                              </p>
                            ))}
                          </div>

                          {/* WhatsApp button to notify duplicate to captain */}
                          <div className="pt-1">
                            <a
                              href={generateWhatsAppDuplicatePlayerLink(
                                team,
                                duplicates[0].player.fullName,
                                duplicates[0].otherTeam.name,
                                duplicates[0].player.grade
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer active:scale-95 transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Notificar por WhatsApp a Capitán (Jugador Duplicado)</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Plantilla 2-2-2 Summary */}
                      <div className="grid grid-cols-3 gap-1 text-center text-xs">
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">3er Año (2)</span>
                          <strong className={check.grade3Count === 2 ? 'text-emerald-400' : 'text-amber-400 font-black'}>
                            {check.grade3Count}/2 Jugadores
                          </strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">2do Año (2)</span>
                          <strong className={check.grade2Count === 2 ? 'text-emerald-400' : 'text-amber-400 font-black'}>
                            {check.grade2Count}/2 Jugadores
                          </strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">1er Año (2)</span>
                          <strong className={check.grade1Count === 2 ? 'text-emerald-400' : 'text-amber-400 font-black'}>
                            {check.grade1Count}/2 Jugadores
                          </strong>
                        </div>
                      </div>

                      {/* Players Compact List */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                        {team.players.filter((p) => p.isActive).map((p) => (
                          <div key={p.id} className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                            <span className="truncate text-slate-200 text-[11px]" title={p.fullName}>
                              {p.fullName}
                            </span>
                            <span className={`text-[9px] font-bold px-1 py-0.2 rounded shrink-0 ${
                              p.grade === 3
                                ? 'bg-amber-500/20 text-amber-300'
                                : p.grade === 2
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {p.grade}º
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Actions Toolbar for Axel */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                        <div className="flex flex-wrap items-center gap-2">
                          {!isApproved ? (
                            <button
                              onClick={() => handleApproveTeam(team.id)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                              title="Aprobar este equipo y abrir WhatsApp para notificar al capitán que quedó registrado oficialmente"
                            >
                              <Check className="w-4 h-4" />
                              <span>✓ Aprobar y Enviar WhatsApp (Confirmar Registro)</span>
                            </button>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>Equipo Aprobado Oficialmente</span>
                              </span>
                              <a
                                href={generateWhatsAppApprovalLink(team)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                                title="Reenviar confirmación oficial de registro por WhatsApp al capitán"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>💬 Reenviar WhatsApp (Registro Confirmado)</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {/* Botón para descargar póster oficial del equipo */}
                          <a
                            href={generateTeamPosterDataUrl(team)}
                            download={`Póster_Oficial_${team.name.replace(/\s+/g, '_')}.png`}
                            className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                            title="Descargar imagen en alta resolución de este equipo para publicarla"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                            <span>Descargar Póster del Equipo</span>
                          </a>
                        </div>

                        {/* Delete registration */}
                        <button
                          onClick={() => setTeamToDelete(team)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar este equipo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: GESTIÓN DEL TORNEO, FORMATO & SORTEO EN VIVO
            ========================================================= */}
        {adminTab === 'sorteo' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4">
              <div>
                <h3 className="font-display font-black text-base text-white">
                  Configuración del Torneo y Sorteo Oficial
                </h3>
                <p className="text-xs text-slate-300">
                  Selecciona la modalidad de juego. Hay <strong className="text-amber-400">{approvedTeams.length} equipos autorizados</strong> listos para entrar al sorteo.
                </p>
              </div>

              {/* Format selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setTournamentFormat('eliminacion')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    tournamentFormat === 'eliminacion'
                      ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-black text-sm text-white">
                      ⚡ Eliminación Directa (Playoffs)
                    </span>
                    {tournamentFormat === 'eliminacion' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Cruces directos: Cuartos de final, Semifinales y Gran Final. El equipo que pierde queda eliminado.
                  </p>
                </button>

                <button
                  onClick={() => setTournamentFormat('grupos')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    tournamentFormat === 'grupos'
                      ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-black text-sm text-white">
                      🏆 Fase de Grupos
                    </span>
                    {tournamentFormat === 'grupos' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Divide a los equipos en Grupo A y Grupo B (todos contra todos), y los líderes avanzan a la Gran Final.
                  </p>
                </button>
              </div>

              {/* Big Draw Studio Trigger & Quick Draw Option */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    disabled={approvedTeams.length < 2}
                    onClick={() => setIsSorteoStudioOpen(true)}
                    className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all ${
                      approvedTeams.length >= 2
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>🎬 ESTUDIO EN VIVO (GRABAR PANTALLA)</span>
                  </button>

                  <button
                    disabled={approvedTeams.length < 2}
                    onClick={handleQuickDraw}
                    className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all ${
                      approvedTeams.length >= 2
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 shadow-emerald-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Shuffle className="w-4 h-4 text-slate-950" />
                    <span>⚡ SORTEO RÁPIDO Y CREAR PÓSTER</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Elige el estudio animado para grabar la tómbola con tu celular, o el sorteo rápido para generar los cruces y el póster al instante.
                </p>
              </div>
            </div>

            {/* PÓSTER OFICIAL DE ENFRENTAMIENTOS (VISTA PREVIA Y DESCARGA) */}
            {matches.length > 0 && fixturePosterUrl && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 p-4 sm:p-5 space-y-3.5 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-sm sm:text-base text-white">
                        Póster Oficial de Enfrentamientos (Rol de Juegos)
                      </h4>
                      <span className="text-[11px] text-amber-400 font-semibold block">
                        {matches.length} Partidos Programados · Listo para descargar y compartir en WhatsApp
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={fixturePosterUrl}
                      download={`Rol_Oficial_Torneo_Relampago_${new Date().toISOString().slice(0, 10)}.png`}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      title="Descargar póster en alta resolución (.png)"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-950" />
                      <span>Descargar Póster HD (.PNG)</span>
                    </a>

                    <a
                      href={generateWhatsAppFixtureBroadcastLink(matches, teams)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      title="Enviar rol de partidos a grupos de WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Difundir por WhatsApp</span>
                    </a>

                    <button
                      onClick={() => setIsPosterModalOpen(true)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                      title="Ver póster en pantalla completa"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Visible Poster Preview */}
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black/60 flex flex-col items-center justify-center p-2.5 sm:p-4">
                  <img
                    src={fixturePosterUrl}
                    alt="Póster Oficial de Enfrentamientos"
                    className="max-h-96 w-auto rounded-lg shadow-2xl object-contain border border-amber-500/30 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => setIsPosterModalOpen(true)}
                    title="Clic para ampliar póster"
                  />
                  <p className="text-[11px] text-slate-400 mt-2 text-center">
                    🔍 Haz clic sobre la imagen para verla en grande o usa el botón dorado para descargar el PNG oficial.
                  </p>
                </div>
              </div>
            )}

            {/* Current Matches & Score Input */}
            {matches.length > 0 && (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="font-display font-black text-sm text-white">
                      Marcadores y Resultados en Cancha ({matches.length} Partidos)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Jueves 12 de Noviembre · Registra los goles de cada encuentro
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateMatches([])}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      Borrar Rol
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {matches.map((m) => {
                    const teamA = teams.find((t) => t.id === m.teamAId);
                    const teamB = teams.find((t) => t.id === m.teamBId);

                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-bold text-amber-400">
                            {m.round} {m.groupName ? `· ${m.groupName}` : ''} · Partido #{m.matchNumber}
                          </span>
                          <span>{m.timeSlot}</span>
                        </div>

                        {/* Match & Score Input */}
                        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-bold">
                          <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                            <div className="text-right truncate">
                              <span className="text-white block truncate">{teamA ? teamA.name : m.teamAId}</span>
                              {teamA && <span className="text-[10px] text-slate-400 font-normal">{teamA.uniformColor}</span>}
                            </div>
                            <TeamBadge badge={teamA?.badge} teamName={teamA ? teamA.name : m.teamAId} size={28} />
                          </div>

                          {/* Score input fields */}
                          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 bg-slate-900 rounded-lg border border-slate-700">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              defaultValue={m.scoreA ?? ''}
                              placeholder="0"
                              className="w-8 h-7 text-center font-mono font-black text-amber-400 bg-slate-950 rounded border border-slate-700 focus:outline-none"
                              onBlur={(e) => {
                                const valA = parseInt(e.target.value, 10);
                                const valB = m.scoreB ?? 0;
                                if (!isNaN(valA)) handleScoreChange(m.id, valA, valB);
                              }}
                            />
                            <span className="text-slate-500 font-black">-</span>
                            <input
                              type="number"
                              min="0"
                              max="30"
                              defaultValue={m.scoreB ?? ''}
                              placeholder="0"
                              className="w-8 h-7 text-center font-mono font-black text-amber-400 bg-slate-950 rounded border border-slate-700 focus:outline-none"
                              onBlur={(e) => {
                                const valB = parseInt(e.target.value, 10);
                                const valA = m.scoreA ?? 0;
                                if (!isNaN(valB)) handleScoreChange(m.id, valA, valB);
                              }}
                            />
                          </div>

                          <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                            <TeamBadge badge={teamB?.badge} teamName={teamB ? teamB.name : m.teamBId} size={28} />
                            <div className="text-left truncate">
                              <span className="text-white block truncate">{teamB ? teamB.name : m.teamBId}</span>
                              {teamB && <span className="text-[10px] text-slate-400 font-normal">{teamB.uniformColor}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 3: DIRECTORIO DE EQUIPOS, BAJAS/ALTAS Y EXPORTAR
            ========================================================= */}
        {adminTab === 'directorio' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-black text-base text-white">
                  Padrón Completo y Control de Plantillas
                </h3>
                <p className="text-xs text-slate-400">
                  Gestiona altas y bajas de jugadores respetando la regla oficial de 2-2-2.
                </p>
              </div>

              <button
                onClick={() => {
                  const csv = exportTeamsToCSV(teams);
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Torneo_Relampago_Equipos_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Excel / CSV</span>
              </button>
            </div>

            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <TeamBadge badge={team.badge} teamName={team.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400">{team.folio}</span>
                          <h4 className="font-bold text-white text-sm sm:text-base">{team.name}</h4>
                        </div>
                        <p className="text-xs text-slate-400">
                          Capitán: {team.captain.fullName} ({team.captain.phone}) · Uniforme: {team.uniformColor}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={generateTeamPosterDataUrl(team)}
                        download={`Póster_Oficial_${team.name.replace(/\s+/g, '_')}.png`}
                        className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="Descargar póster oficial de este equipo"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline text-[11px]">Póster</span>
                      </a>
                      <button
                        onClick={() => setTeamToDelete(team)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Players with Substitution Button */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Jugadores Registrados (Bajas y Altas):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {team.players.map((player) => (
                        <div
                          key={player.id}
                          className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                            player.isActive
                              ? 'bg-slate-950 border-slate-800'
                              : 'bg-red-950/20 border-red-900/40 opacity-60'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-white block truncate">
                              {player.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {player.grade}º Año · {player.position || 'Jugador'} · {player.isActive ? 'Activo' : 'Baja'}
                            </span>
                          </div>

                          {player.isActive && (
                            <button
                              onClick={() => {
                                setSubstitutionModal({
                                  isOpen: true,
                                  team,
                                  player,
                                });
                                setSubGrade(player.grade);
                              }}
                              className="px-2 py-1 text-[10px] font-bold text-amber-400 hover:bg-amber-500/10 rounded border border-amber-500/30 cursor-pointer active:scale-95 shrink-0"
                            >
                              Sustituir
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sorteo Live Studio Modal */}
      <SorteoLiveStudio
        isOpen={isSorteoStudioOpen}
        onClose={() => setIsSorteoStudioOpen(false)}
        teams={approvedTeams}
        format={tournamentFormat}
        onPublishFixture={(newMatches) => {
          onUpdateMatches(newMatches);
        }}
      />

      {/* Confirmation Modal to Delete Team */}
      {teamToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto text-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-display font-black text-lg text-white">
                ¿Eliminar equipo definitivamente?
              </h4>
              <p className="text-xs text-slate-300">
                Estás a punto de borrar al equipo <strong className="text-white">"{teamToDelete.name}"</strong> (Folio: {teamToDelete.folio}). Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setTeamToDelete(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Substitution Modal (Baja de jugador y alta de sustituto de mismo grado) */}
      {substitutionModal.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-sm">
                Sustitución de Jugador
              </span>
              <button
                onClick={() => setSubstitutionModal({ isOpen: false, team: null, player: null })}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Se dará de baja a <strong className="text-white">{substitutionModal.player?.fullName}</strong>. Para mantener la regla oficial 2-2-2, el sustituto debe ser obligatoriamente de <strong className="text-amber-400">{substitutionModal.player?.grade}º año</strong>.
            </p>

            {subError && (
              <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-300">
                {subError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nombre Completo del Sustituto *</label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Ej. Luis Fernando Mora"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Grado Escolar Obligatorio</label>
                <input
                  type="text"
                  readOnly
                  value={`${substitutionModal.player?.grade}º Año de Secundaria`}
                  className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-amber-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Posición</label>
                  <select
                    value={subPosition}
                    onChange={(e) => setSubPosition(e.target.value as PlayerPosition)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Delantero">Delantero</option>
                    <option value="Medio">Medio</option>
                    <option value="Defensa">Defensa</option>
                    <option value="Portero">Portero</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Dorsal</label>
                  <input
                    type="number"
                    value={subJersey}
                    onChange={(e) => setSubJersey(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setSubstitutionModal({ isOpen: false, team: null, player: null })}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSubstitution}
                className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow"
              >
                Registrar Sustitución
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: VISTA PREVIA FULLSCREEN DEL PÓSTER OFICIAL
          ========================================================= */}
      {isPosterModalOpen && fixturePosterUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl flex items-center justify-between mb-3">
            <span className="text-white font-display font-black text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Póster Oficial de Enfrentamientos
            </span>
            <div className="flex items-center gap-2">
              <a
                href={fixturePosterUrl}
                download={`Rol_Oficial_Torneo_Relampago_${new Date().toISOString().slice(0, 10)}.png`}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PNG</span>
              </a>
              <button
                onClick={() => setIsPosterModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Cerrar vista previa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="max-h-[82vh] overflow-y-auto rounded-2xl border-2 border-amber-500/40 shadow-2xl bg-slate-950 p-1 flex justify-center">
            <img
              src={fixturePosterUrl}
              alt="Póster Oficial en Alta Resolución"
              className="max-w-full h-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* =========================================================
          BARRA DE NAVEGACIÓN INFERIOR ESTILO APP (ADMIN)
          Botones abajo fijos simulando 100% una aplicación móvil
          ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 shadow-2xl safe-area-bottom select-none">
        <div className="grid grid-cols-4 items-center justify-around max-w-lg mx-auto h-16">
          
          {/* Botón 1: Validar y Autorizar */}
          <button
            aria-label="Validar equipos"
            onClick={() => setAdminTab('validacion')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
              adminTab === 'validacion' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <CheckCircle2 className="w-5 h-5 mb-0.5" />
              {pendingTeams.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-md animate-pulse">
                  {pendingTeams.length}
                </span>
              )}
              {adminTab === 'validacion' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-tight mt-0.5">Validar</span>
          </button>

          {/* Botón 2: Sorteo en Vivo (Centro destacado) */}
          <button
            aria-label="Sorteo en vivo"
            onClick={() => setAdminTab('sorteo')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
              adminTab === 'sorteo' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Shuffle className="w-5 h-5 mb-0.5" />
              {approvedTeams.length > 0 && (
                <span className="absolute -top-1 -right-2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1 rounded-full border border-amber-500/30 leading-none">
                  {approvedTeams.length}
                </span>
              )}
              {adminTab === 'sorteo' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-tight mt-0.5">Sorteo</span>
          </button>

          {/* Botón 3: Equipos y Bajas/Altas */}
          <button
            aria-label="Padrón general de equipos"
            onClick={() => setAdminTab('directorio')}
            className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all cursor-pointer active:scale-90 ${
              adminTab === 'directorio' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Users className="w-5 h-5 mb-0.5" />
              {teams.length > 0 && (
                <span className="absolute -top-1 -right-2 text-[9px] font-mono font-bold bg-slate-800 text-amber-400 px-1 rounded-full border border-slate-700 leading-none">
                  {teams.length}
                </span>
              )}
              {adminTab === 'directorio' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-tight mt-0.5">Equipos</span>
          </button>

          {/* Botón 4: Salir del Modo Admin */}
          <button
            aria-label="Cerrar sesión de administrador"
            onClick={onLogoutAdmin}
            className="flex flex-col items-center justify-center min-h-[48px] py-1 text-slate-400 hover:text-rose-400 transition-all cursor-pointer active:scale-90"
          >
            <LogOut className="w-5 h-5 mb-0.5 text-rose-400/80" />
            <span className="text-[10px] tracking-tight leading-tight mt-0.5 text-rose-300">Salir</span>
          </button>

        </div>
      </nav>

    </div>
  );
};
