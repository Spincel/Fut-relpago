import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  UserPlus,
  Trash2,
  FileText,
  Download,
  RotateCcw,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Award,
  MessageCircle,
  Bell,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Team, Player, GradeYear, PlayerPosition } from '../types/tournament';
import { evaluateTeamRules, canSubstitutePlayer } from '../utils/rulesValidator';
import { exportTeamsToCSV, resetTeamsToDefault } from '../utils/storage';
import { createMockCredential } from '../data/initialTeams';
import { generateWhatsAppApprovalLink, generateWhatsAppObservationsLink } from '../utils/whatsappHelper';

interface AdminPanelProps {
  teams: Team[];
  onUpdateTeams: (updated: Team[]) => void;
  onOpenDocumentModal: (player: Player, team: Team) => void;
  onOpenGameSheetModal: (team: Team) => void;
  onOpenNewRegistration: () => void;
  newRegistrationsCount?: number;
  onClearNewNotification?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  teams,
  onUpdateTeams,
  onOpenDocumentModal,
  onOpenGameSheetModal,
  onOpenNewRegistration,
  newRegistrationsCount = 0,
  onClearNewNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'compliant' | 'irregular' | 'disqualified'>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id || null);

  // Substitution modal state
  const [substitutionModal, setSubstitutionModal] = useState<{
    isOpen: boolean;
    teamId: string;
    player: Player | null;
  }>({
    isOpen: false,
    teamId: '',
    player: null,
  });

  const [subName, setSubName] = useState('');
  const [subCurp, setSubCurp] = useState('');
  const [subPosition, setSubPosition] = useState<PlayerPosition>('Medio');
  const [subJersey, setSubJersey] = useState('10');
  const [subGrade, setSubGrade] = useState<GradeYear>(2);
  const [subError, setSubError] = useState<string | null>(null);

  // Calculate summary metrics
  const totalTeams = teams.length;
  let compliantCount = 0;
  let irregularCount = 0;
  let pendingDocsCount = 0;
  let totalActivePlayers = 0;
  let grade3Total = 0;
  let grade2Total = 0;
  let grade1Total = 0;

  teams.forEach((t) => {
    const check = evaluateTeamRules(t);
    if (check.isFullyCompliant) compliantCount++;
    if (!check.isGradeDistributionValid || !check.isTotalCountValid) irregularCount++;
    pendingDocsCount += check.pendingDocumentsCount;

    t.players.forEach((p) => {
      if (p.isActive) {
        totalActivePlayers++;
        if (p.grade === 3) grade3Total++;
        if (p.grade === 2) grade2Total++;
        if (p.grade === 1) grade1Total++;
      }
    });
  });

  // Filtered teams list
  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.captain.fullName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const check = evaluateTeamRules(t);
    if (filterStatus === 'compliant') return check.isFullyCompliant;
    if (filterStatus === 'irregular') return !check.isFullyCompliant && t.status !== 'disqualified';
    if (filterStatus === 'disqualified') return t.status === 'disqualified';
    return true;
  });

  const activeSelectedTeam = teams.find((t) => t.id === selectedTeamId) || filteredTeams[0] || null;

  // 1-Click Complete Validation for Team (Axel's shortcut)
  const handleValidateEntireTeam = (team: Team) => {
    const updatedPlayers = team.players.map((p) => ({
      ...p,
      document: {
        ...(p.document || {}),
        status: 'approved' as const,
        rejectionReason: undefined,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Axel Javier González Salas',
      },
    }));

    const updated = teams.map((t) =>
      t.id === team.id
        ? {
            ...t,
            status: 'approved' as const,
            players: updatedPlayers,
            updatedAt: new Date().toISOString(),
            notes: `${t.notes || ''} | Validado al 100% por Axel Javier González Salas.`,
          }
        : t
    );

    onUpdateTeams(updated);

    // Prompt Axel to send WhatsApp confirmation
    const waLink = generateWhatsAppApprovalLink({ ...team, players: updatedPlayers, status: 'approved' });
    if (window.confirm(`¡Equipo "${team.name}" validado con éxito! 🏆\n\n¿Deseas abrir WhatsApp ahora para enviarle la confirmación al capitán (${team.captain.phone})?`)) {
      window.open(waLink, '_blank');
    }
  };

  // Actions for teams (Altas / Bajas / Reactivación)
  const handleDisqualifyTeam = (teamId: string) => {
    const reason = window.prompt(
      'Motivo de la baja o descalificación del equipo (ej. "Incumplimiento de bases", "Baja voluntaria"):'
    );
    if (reason === null) return;

    const updated = teams.map((t) =>
      t.id === teamId
        ? {
            ...t,
            status: 'disqualified' as const,
            disqualificationReason: reason || 'Baja administrativa por mesa directiva.',
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    onUpdateTeams(updated);
  };

  const handleReactivateTeam = (teamId: string) => {
    const updated = teams.map((t) =>
      t.id === teamId
        ? {
            ...t,
            status: 'approved' as const,
            disqualificationReason: undefined,
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    onUpdateTeams(updated);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (!window.confirm('¿Confirmas eliminar permanentemente el registro de este equipo?')) {
      return;
    }
    const updated = teams.filter((t) => t.id !== teamId);
    onUpdateTeams(updated);
    if (selectedTeamId === teamId) {
      setSelectedTeamId(updated[0]?.id || null);
    }
  };

  // Player substitution preserving Grade
  const handleOpenSubstitution = (teamId: string, player: Player) => {
    setSubstitutionModal({
      isOpen: true,
      teamId,
      player,
    });
    setSubGrade(player.grade);
    setSubName('');
    setSubCurp('');
    setSubPosition(player.position || 'Delantero');
    setSubJersey(String(player.jerseyNumber || 10));
    setSubError(null);
  };

  const handleConfirmSubstitution = () => {
    if (!substitutionModal.player) return;
    const { player, teamId } = substitutionModal;

    const subCheck = canSubstitutePlayer(player, subGrade);
    if (!subCheck.allowed) {
      setSubError(subCheck.reason || 'Grado no permitido');
      return;
    }

    if (!subName.trim() || !subCurp.trim()) {
      setSubError('Completa el nombre y la matrícula del alumno sustituto.');
      return;
    }

    const newDocUrl = createMockCredential(subName.trim(), subGrade, subCurp.trim());

    const newPlayer: Player = {
      id: `p-${Date.now()}`,
      fullName: subName.trim(),
      grade: subGrade,
      studentIdOrCurp: subCurp.trim(),
      position: subPosition,
      jerseyNumber: parseInt(subJersey, 10) || 10,
      isActive: true,
      document: {
        id: `doc-${Date.now()}`,
        name: `credencial_sustituto_${subGrade}ano.svg`,
        type: 'credencial',
        fileUrl: newDocUrl,
        status: 'approved',
        uploadedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Axel Javier González Salas',
      },
    };

    const updated = teams.map((t) => {
      if (t.id === teamId) {
        const updatedPlayers = t.players.map((p) =>
          p.id === player.id
            ? { ...p, isActive: false, deactivationReason: `Sustituido por ${subName.trim()} (${subGrade}º Año)` }
            : p
        );
        return {
          ...t,
          players: [...updatedPlayers, newPlayer],
          updatedAt: new Date().toISOString(),
          notes: `${t.notes || ''} | Sustitución: ${player.fullName} reemplazado por ${subName.trim()} (${subGrade}º Año).`,
        };
      }
      return t;
    });

    onUpdateTeams(updated);
    setSubstitutionModal({ isOpen: false, teamId: '', player: null });
  };

  const handleQuickApproveDoc = (teamId: string, playerId: string) => {
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        const updatedPlayers = t.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                document: {
                  ...p.document,
                  status: 'approved' as const,
                  rejectionReason: undefined,
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: 'Axel Javier González Salas',
                },
              }
            : p
        );
        return { ...t, players: updatedPlayers, updatedAt: new Date().toISOString() };
      }
      return t;
    });
    onUpdateTeams(updated);
  };

  const handleDownloadCSV = () => {
    const csvContent = exportTeamsToCSV(teams);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `equipos_torneo_relampago_axel_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = () => {
    if (window.confirm('¿Restablecer equipos iniciales de prueba?')) {
      const reset = resetTeamsToDefault();
      onUpdateTeams(reset);
      setSelectedTeamId(reset[0]?.id || null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* New Registrations Alert Banner for Axel */}
      {newRegistrationsCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-bold flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-amber-500/20 animate-bounce-once">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-black uppercase tracking-tight block">
                ¡Axel, tienes {newRegistrationsCount} nuevo(s) equipo(s) registrado(s)!
              </span>
              <span className="text-xs text-slate-900 font-medium">
                Revisa que cumplan la regla 2-2-2, valida sus documentos y confírmales por WhatsApp.
              </span>
            </div>
          </div>

          {onClearNewNotification && (
            <button
              onClick={onClearNewNotification}
              className="min-h-[40px] px-3.5 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors shrink-0"
            >
              Marcar como Visto
            </button>
          )}
        </div>
      )}

      {/* Organizer Header Profile */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl font-bold">
            ⚽
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Panel Oficial del Organizador (14 Años)
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-bold">Mesa de Control Activa</span>
            </div>
            <h2 className="text-2xl font-black font-display text-white mt-0.5">
              Axel Javier González Salas
            </h2>
            <p className="text-xs text-slate-300">
              Torneo Relámpago de Fútbol · Jueves 12 de Noviembre · Validador de Regla 2-2-2
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewRegistration}
            className="min-h-[44px] px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>+ Alta Presencial</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="min-h-[44px] px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Descargar lista de equipos en Excel / CSV"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Descargar Excel</span>
          </button>
          <button
            onClick={handleResetData}
            className="min-w-[44px] min-h-[44px] p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 border border-slate-700 transition-colors flex items-center justify-center"
            title="Restablecer equipos de prueba"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simple Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-bold">Equipos Totales</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black font-mono text-white tabular-nums">
            {totalTeams}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Padrón oficial</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-bold">Cumplen Regla 2-2-2</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black font-mono text-emerald-400 tabular-nums">
            {compliantCount}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Listos para el Jueves 12</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-bold">Por Corregir / Irregulares</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-black font-mono text-amber-400 tabular-nums">
            {irregularCount}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Faltan o sobran de algún grado</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-bold">Credenciales Pendientes</span>
            <FileCheck2 className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-3xl font-black font-mono text-sky-400 tabular-nums">
            {pendingDocsCount}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Por cotejar con Axel</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Team Selector List */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-lg">
          
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-base text-white">
              Lista de Equipos ({filteredTeams.length})
            </h3>
            <span className="text-xs text-slate-400">Selecciona uno para gestionar</span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por equipo, folio o capitán..."
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 min-h-[36px] py-1.5 px-1 sm:px-2 text-[11px] sm:text-xs rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('compliant')}
              className={`flex-1 min-h-[36px] py-1.5 px-1 sm:px-2 text-[11px] sm:text-xs rounded-lg transition-colors ${
                filterStatus === 'compliant'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Válidos
            </button>
            <button
              onClick={() => setFilterStatus('irregular')}
              className={`flex-1 min-h-[36px] py-1.5 px-1 sm:px-2 text-[11px] sm:text-xs rounded-lg transition-colors ${
                filterStatus === 'irregular'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Observados
            </button>
            <button
              onClick={() => setFilterStatus('disqualified')}
              className={`flex-1 min-h-[36px] py-1.5 px-1 sm:px-2 text-[11px] sm:text-xs rounded-lg transition-colors ${
                filterStatus === 'disqualified'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bajas
            </button>
          </div>

          {/* Teams list */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredTeams.map((team) => {
              const check = evaluateTeamRules(team);
              const isSelected = selectedTeamId === team.id;

              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-amber-400 font-bold">{team.folio}</span>
                    
                    {team.status === 'disqualified' ? (
                      <span className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Baja
                      </span>
                    ) : check.isFullyCompliant ? (
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        ✓ Regla 2-2-2 Válida
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Revisar Composición
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white">
                    {team.name}
                  </h4>

                  <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
                    <span>Capitán: <strong className="text-slate-300">{team.captain.fullName}</strong></span>
                    <span className="font-mono text-slate-300 font-bold">
                      {check.totalPlayers}/6 Jugadores
                    </span>
                  </div>

                  {/* 2-2-2 mini row */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className={check.grade3Count === 2 ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                      3º: {check.grade3Count}/2
                    </span>
                    <span className={check.grade2Count === 2 ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                      2º: {check.grade2Count}/2
                    </span>
                    <span className={check.grade1Count === 2 ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                      1º: {check.grade1Count}/2
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right: Team Management & WhatsApp Actions */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-lg">
          {activeSelectedTeam ? (
            (() => {
              const team = activeSelectedTeam;
              const check = evaluateTeamRules(team);
              const activePlayers = team.players.filter((p) => p.isActive);
              const inactivePlayers = team.players.filter((p) => !p.isActive);

              const waApprovalLink = generateWhatsAppApprovalLink(team);
              const waObservationsLink = generateWhatsAppObservationsLink(team, check.issues);

              return (
                <div className="space-y-6">
                  
                  {/* Team Identity Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-bold">{team.folio}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs text-slate-400">
                          {team.registeredBy === 'admin_desk' ? 'Inscrito en mesa presencial' : 'Inscripción vía web'}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
                        {team.name}
                      </h2>
                      <span className="text-xs text-slate-300">
                        Uniforme / Color: <strong className="text-amber-400">{team.uniformColor}</strong>
                      </span>
                    </div>

                    {/* Operational Top Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onOpenGameSheetModal(team)}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shadow"
                        title="Ver e imprimir cédula oficial de partido"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Imprimir Cédula</span>
                      </button>

                      {team.status === 'disqualified' ? (
                        <button
                          onClick={() => handleReactivateTeam(team.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Reactivar</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDisqualifyTeam(team.id)}
                          className="px-3.5 py-2 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                          title="Dar de baja o descalificar equipo"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Dar de Baja</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Primary WhatsApp Direct Communication Card */}
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-600/50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-emerald-400" />
                        <span className="font-bold text-sm text-emerald-300">
                          Notificación Oficial por WhatsApp al Capitán
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {team.captain.phone}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Axel, con un solo clic puedes abrir WhatsApp con el mensaje oficial redactado
                      para enviárselo directamente a <strong>{team.captain.fullName}</strong>:
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {check.isFullyCompliant ? (
                        <a
                          href={waApprovalLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Enviar WhatsApp de EQUIPO VALIDADO ✓</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <a
                          href={waObservationsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                        >
                          <Send className="w-4 h-4 text-slate-950" />
                          <span>Enviar WhatsApp con OBSERVACIONES DE REGLAS ⚠️</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {!check.areAllDocumentsApproved && (
                        <button
                          onClick={() => handleValidateEntireTeam(team)}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Aprobar Todos los Documentos de este Equipo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rules Diagnostic Box */}
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      check.isFullyCompliant
                        ? 'bg-emerald-950/25 border-emerald-800 text-emerald-200'
                        : 'bg-amber-950/25 border-amber-800 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span className="flex items-center gap-2">
                        {check.isFullyCompliant ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        )}
                        <span>
                          {check.isFullyCompliant
                            ? '¡Plantilla perfecta! Cumple 100% con las bases oficiales 2-2-2.'
                            : 'Observaciones de Reglas Oficiales:'}
                        </span>
                      </span>

                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span>3º: {check.grade3Count}/2</span>
                        <span>2º: {check.grade2Count}/2</span>
                        <span>1º: {check.grade1Count}/2</span>
                      </div>
                    </div>

                    {check.issues.length > 0 && (
                      <div className="mt-2 space-y-1 text-slate-200">
                        {check.issues.map((issue, idx) => (
                          <p key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">·</span>
                            <span>{issue}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {team.disqualificationReason && (
                      <div className="mt-2 p-2 rounded bg-rose-950/80 border border-rose-800 text-rose-200">
                        <strong>Motivo de baja:</strong> {team.disqualificationReason}
                      </div>
                    )}
                  </div>

                  {/* Captain Contact Information */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs break-words">
                    <div>
                      <span className="text-slate-400 block font-semibold">Capitán:</span>
                      <strong className="text-white text-sm">{team.captain.fullName}</strong>
                      <span className="text-slate-400 block">{team.captain.groupOrClass}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">WhatsApp de contacto:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{team.captain.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Correo:</span>
                      <strong className="text-slate-200">{team.captain.email}</strong>
                    </div>
                  </div>

                  {/* Active 6 Players Roster */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>Plantilla de Jugadores ({activePlayers.length} / 6)</span>
                      </h4>
                      <span className="text-xs text-slate-400">
                        Haz clic en "Ver Doc" para inspeccionar credencial con zoom
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activePlayers.map((player) => (
                        <div
                          key={player.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 font-mono font-bold text-white flex items-center justify-center">
                              #{player.jerseyNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {player.fullName}
                                </span>
                                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                  {player.grade}º Año
                                </span>
                                <span className="text-slate-400 font-medium">
                                  {player.position}
                                </span>
                              </div>
                              <span className="text-slate-400 font-mono text-[11px] block mt-0.5">
                                Matrícula: {player.studentIdOrCurp}
                              </span>
                            </div>
                          </div>

                          {/* Document Status & Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onOpenDocumentModal(player, team)}
                              className={`min-h-[40px] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors border ${
                                player.document?.status === 'approved'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                                  : player.document?.status === 'rejected'
                                  ? 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/60'
                                  : 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                              }`}
                              title="Inspeccionar credencial con zoom"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>
                                {player.document?.status === 'approved'
                                  ? 'Doc. Aprobado'
                                  : player.document?.status === 'rejected'
                                  ? 'Doc. Rechazado'
                                  : 'Doc. Pendiente'}
                              </span>
                            </button>

                            {player.document?.status !== 'approved' && (
                              <button
                                onClick={() => handleQuickApproveDoc(team.id, player.id)}
                                className="min-w-[40px] min-h-[40px] p-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                title="Aprobar inmediatamente documento"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenSubstitution(team.id, player)}
                              className="min-h-[40px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors flex items-center"
                              title="Dar de baja y sustituir respetando el grado escolar"
                            >
                              Sustituir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Substitution History */}
                  {inactivePlayers.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Bajas y Sustituciones Previas:
                      </span>
                      {inactivePlayers.map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between"
                        >
                          <span className="line-through">{p.fullName} ({p.grade}º Año)</span>
                          <span className="text-rose-400 text-[11px]">
                            {p.deactivationReason || 'Baja de plantilla'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })()
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm">
              Selecciona un equipo de la lista de la izquierda para comenzar a gestionarlo.
            </div>
          )}
        </div>

      </div>

      {/* Substitution Modal */}
      {substitutionModal.isOpen && substitutionModal.player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
            
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-amber-400 font-bold block">
                Sustitución en Mesa de Control · Axel Javier
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Sustituir Jugador de {substitutionModal.player.grade}º Año
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                El jugador saliente <strong>{substitutionModal.player.fullName}</strong> es de{' '}
                <strong className="text-amber-400">{substitutionModal.player.grade}º Año</strong>.
                Para no violar la regla 2-2-2, el nuevo alumno debe ser forzosamente de ese mismo grado.
              </p>
            </div>

            {subError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
                {subError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo del Nuevo Alumno *
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Ej. Andrés Navarro López"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Matrícula / CURP *
                  </label>
                  <input
                    type="text"
                    required
                    value={subCurp}
                    onChange={(e) => setSubCurp(e.target.value)}
                    placeholder="MAT-2026-..."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Grado Obligatorio
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${substitutionModal.player.grade}º Año (Regla 2-2-2)`}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-amber-500/40 rounded-lg text-amber-400 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Posición
                  </label>
                  <select
                    value={subPosition}
                    onChange={(e) => setSubPosition(e.target.value as PlayerPosition)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Portero">Portero</option>
                    <option value="Defensa">Defensa</option>
                    <option value="Medio">Medio</option>
                    <option value="Delantero">Delantero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dorsal
                  </label>
                  <input
                    type="number"
                    value={subJersey}
                    onChange={(e) => setSubJersey(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSubstitutionModal({ isOpen: false, teamId: '', player: null })}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSubstitution}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow"
              >
                Confirmar Sustitución
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
