import React, { useState } from 'react';
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
} from 'lucide-react';
import { Team, Player, TournamentMatch, GradeYear, PlayerPosition } from '../types/tournament';
import { evaluateTeamRules, findTeamDuplicatePlayers, canSubstitutePlayer } from '../utils/rulesValidator';
import { generateWhatsAppApprovalLink, generateWhatsAppDuplicatePlayerLink, generateWhatsAppObservationsLink } from '../utils/whatsappHelper';
import { exportTeamsToCSV } from '../utils/storage';
import { SorteoLiveStudio } from './SorteoLiveStudio';

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
  const [subCurp, setSubCurp] = useState('');
  const [subError, setSubError] = useState<string | null>(null);

  // Metrics
  const approvedTeams = teams.filter((t) => t.status === 'approved');
  const pendingTeams = teams.filter((t) => t.status !== 'approved' && t.status !== 'disqualified');

  // Handle Team Authorization
  const handleApproveTeam = (teamId: string) => {
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
  };

  // Handle Delete Team
  const handleConfirmDelete = () => {
    if (!teamToDelete) return;
    const updated = teams.filter((t) => t.id !== teamToDelete.id);
    onUpdateTeams(updated);
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
      studentIdOrCurp: subCurp.trim() || undefined,
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
    setSubCurp('');
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
    <div className="min-h-full bg-slate-950 text-slate-100 pb-16">
      
      {/* =========================================================
          TOP ADMIN EXCLUSIVE APP BAR
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
                  Panel de Control Organizador
                </span>
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 shrink-0">
                  Axel Javier G. S.
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                {teams.length} Equipos ({approvedTeams.length} Aprobados · {pendingTeams.length} Pendientes)
              </span>
            </div>
          </div>

          {/* Logout / Exit Admin Portal */}
          <button
            onClick={onLogoutAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>

        </div>

        {/* Admin Navigation Pills */}
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 pb-2 pt-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setAdminTab('validacion')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              adminTab === 'validacion'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Validar y Autorizar</span>
            {pendingTeams.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-mono flex items-center justify-center">
                {pendingTeams.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('sorteo')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              adminTab === 'sorteo'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Sorteo y Formato</span>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1 rounded">
              {approvedTeams.length} listos
            </span>
          </button>

          <button
            onClick={() => setAdminTab('directorio')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              adminTab === 'directorio'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Equipos y Bajas/Altas ({teams.length})</span>
          </button>
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
                        <div className="min-w-0">
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
                        <div className="flex items-center gap-2">
                          {!isApproved && (
                            <button
                              onClick={() => handleApproveTeam(team.id)}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Check className="w-4 h-4" />
                              <span>Autorizar y Aprobar Equipo</span>
                            </button>
                          )}

                          {/* WhatsApp pre-designed message: Approved team waiting for draw */}
                          <a
                            href={generateWhatsAppApprovalLink(team)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95"
                            title="Enviar mensaje prediseñado: Tu equipo quedó registrado, espera el sorteo..."
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp: Equipo Aprobado (Espera Sorteo)</span>
                            <ExternalLink className="w-3 h-3" />
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

              {/* Big Draw Studio Trigger */}
              <div className="pt-2">
                <button
                  disabled={approvedTeams.length < 2}
                  onClick={() => setIsSorteoStudioOpen(true)}
                  className={`w-full py-4 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all ${
                    approvedTeams.length >= 2
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>
                    {approvedTeams.length >= 2
                      ? '🎬 ABRIR ESTUDIO DE SORTEO EN VIVO (GRABAR PANTALLA)'
                      : 'SE REQUIEREN AL MENOS 2 EQUIPOS APROBADOS PARA EL SORTEO'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Genera la tómbola y las animaciones de cruces en pantalla completa para que puedas grabar video con tu teléfono.
                </p>
              </div>
            </div>

            {/* Current Matches & Score Input */}
            {matches.length > 0 && (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-display font-black text-sm text-white">
                    Rol Oficial Generado ({matches.length} Partidos)
                  </h4>
                  <button
                    onClick={() => onUpdateMatches([])}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Borrar Rol Actual
                  </button>
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
                          <span>{m.timeSlot} · {m.pitch}</span>
                        </div>

                        {/* Match & Score Input */}
                        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-bold">
                          <div className="flex-1 text-right truncate">
                            <span className="text-white block truncate">{teamA ? teamA.name : m.teamAId}</span>
                            {teamA && <span className="text-[10px] text-slate-400 font-normal">{teamA.uniformColor}</span>}
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

                          <div className="flex-1 text-left truncate">
                            <span className="text-white block truncate">{teamB ? teamB.name : m.teamBId}</span>
                            {teamB && <span className="text-[10px] text-slate-400 font-normal">{teamB.uniformColor}</span>}
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
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{team.folio}</span>
                        <h4 className="font-bold text-white text-sm sm:text-base">{team.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        Capitán: {team.captain.fullName} ({team.captain.phone}) · Uniforme: {team.uniformColor}
                      </p>
                    </div>

                    <button
                      onClick={() => setTeamToDelete(team)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                      title="Eliminar equipo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

    </div>
  );
};
