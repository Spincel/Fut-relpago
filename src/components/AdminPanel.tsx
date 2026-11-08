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
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Award,
} from 'lucide-react';
import { Team, Player, GradeYear, PlayerPosition } from '../types/tournament';
import { evaluateTeamRules, canSubstitutePlayer } from '../utils/rulesValidator';
import { exportTeamsToCSV, resetTeamsToDefault } from '../utils/storage';
import { createMockCredential } from '../data/initialTeams';

interface AdminPanelProps {
  teams: Team[];
  onUpdateTeams: (updated: Team[]) => void;
  onOpenDocumentModal: (player: Player, team: Team) => void;
  onOpenGameSheetModal: (team: Team) => void;
  onOpenNewRegistration: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  teams,
  onUpdateTeams,
  onOpenDocumentModal,
  onOpenGameSheetModal,
  onOpenNewRegistration,
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

  // Actions for teams (Altas / Bajas / Reactivación)
  const handleDisqualifyTeam = (teamId: string) => {
    const reason = window.prompt(
      'Motivo de la baja o descalificación del equipo (ej. "Incumplimiento reiterado de bases escolares", "Baja voluntaria"):'
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
    if (!window.confirm('¿Confirmas eliminar permanentemente el registro de este equipo? Esta acción no se puede deshacer.')) {
      return;
    }
    const updated = teams.filter((t) => t.id !== teamId);
    onUpdateTeams(updated);
    if (selectedTeamId === teamId) {
      setSelectedTeamId(updated[0]?.id || null);
    }
  };

  // Actions for Player deactivation & substitution
  const handleOpenSubstitution = (teamId: string, player: Player) => {
    setSubstitutionModal({
      isOpen: true,
      teamId,
      player,
    });
    setSubGrade(player.grade);
    setSubName('');
    setSubCurp('');
    setSubPosition(player.position);
    setSubJersey(String(player.jerseyNumber || 10));
    setSubError(null);
  };

  const handleConfirmSubstitution = () => {
    if (!substitutionModal.player) return;
    const { player, teamId } = substitutionModal;

    // Validate Grade enforcement!
    const subCheck = canSubstitutePlayer(player, subGrade);
    if (!subCheck.allowed) {
      setSubError(subCheck.reason || 'Grado no permitido');
      return;
    }

    if (!subName.trim() || !subCurp.trim()) {
      setSubError('Debes completar el nombre completo y la matrícula o CURP del nuevo alumno.');
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
        // Deactivate old player and append the new compliant player
        const updatedPlayers = t.players.map((p) =>
          p.id === player.id
            ? { ...p, isActive: false, deactivationReason: `Sustituido por ${subName.trim()} (${subGrade}º Año)` }
            : p
        );
        return {
          ...t,
          players: [...updatedPlayers, newPlayer],
          updatedAt: new Date().toISOString(),
          notes: `${t.notes || ''} | Sustitución realizada: ${player.fullName} fue reemplazado por ${subName.trim()} (${subGrade}º Año).`,
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
    link.setAttribute('download', `padron_torneo_relampago_12nov_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer la lista de equipos a los datos iniciales de demostración?')) {
      const reset = resetTeamsToDefault();
      onUpdateTeams(reset);
      setSelectedTeamId(reset[0]?.id || null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner: Coordinator Badge */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Mesa de Control Oficial
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">Torneo Relámpago</span>
            </div>
            <h2 className="text-xl font-bold font-display text-white mt-0.5">
              Panel del Organizador: Axel Javier González Salas
            </h2>
            <p className="text-xs text-slate-400">
              Gestión centralizada de altas presenciales, bajas de equipos/jugadores y validación documental de las bases 2-2-2.
            </p>
          </div>
        </div>

        {/* Global Admin Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewRegistration}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nueva Alta Presencial</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Exportar plantilla a Excel / CSV"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handleResetData}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-700 transition-colors"
            title="Restablecer datos de prueba"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Equipos Registrados</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalTeams}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Convocatoria oficial</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cumplen Regla 2-2-2</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {compliantCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">100% listos para jugar</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Fuera de Regla / Irregulares</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {irregularCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Requieren ajuste de grado</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Documentos Pendientes</span>
            <FileCheck2 className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
            {pendingDocsCount}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Por validar credencial</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Alumnos por Grado</span>
            <Award className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-center justify-between text-xs font-mono font-bold mt-2">
            <span className="text-amber-400">3º: {grade3Total}</span>
            <span className="text-amber-400">2º: {grade2Total}</span>
            <span className="text-amber-400">1º: {grade1Total}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Total activos: {totalActivePlayers}</span>
        </div>
      </div>

      {/* Main Content Workspace: Teams Sidebar & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Teams List with Search & Filter Tabs */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white">
              Padrón de Equipos
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {filteredTeams.length} de {teams.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por equipo, folio o capitán..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('compliant')}
              className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors ${
                filterStatus === 'compliant'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Válidos
            </button>
            <button
              onClick={() => setFilterStatus('irregular')}
              className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors ${
                filterStatus === 'irregular'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Irregulares
            </button>
            <button
              onClick={() => setFilterStatus('disqualified')}
              className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors ${
                filterStatus === 'disqualified'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bajas
            </button>
          </div>

          {/* Team Cards List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredTeams.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No se encontraron equipos con el filtro seleccionado.
              </div>
            ) : (
              filteredTeams.map((team) => {
                const check = evaluateTeamRules(team);
                const isSelected = selectedTeamId === team.id;

                return (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-950 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-amber-400 font-semibold">{team.folio}</span>
                      
                      {team.status === 'disqualified' ? (
                        <span className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Baja / Descalificado
                        </span>
                      ) : check.isFullyCompliant ? (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Regla 2-2-2 Cumplida
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Revisar Bases
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white leading-tight">
                      {team.name}
                    </h4>

                    <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                      <span>Capitán: {team.captain.fullName}</span>
                      <span className="font-mono text-slate-300">
                        {check.totalPlayers}/6 Jugadores
                      </span>
                    </div>

                    {/* Grade Distribution Micro-indicator */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className={check.grade3Count === 2 ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                        3º Año: {check.grade3Count}/2
                      </span>
                      <span className={check.grade2Count === 2 ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                        2º Año: {check.grade2Count}/2
                      </span>
                      <span className={check.grade1Count === 2 ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                        1er Año: {check.grade1Count}/2
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Selected Team Inspector & Action Suite */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
          {activeSelectedTeam ? (
            (() => {
              const team = activeSelectedTeam;
              const check = evaluateTeamRules(team);
              const activePlayers = team.players.filter((p) => p.isActive);
              const inactivePlayers = team.players.filter((p) => !p.isActive);

              return (
                <div className="space-y-6">
                  
                  {/* Team Header & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-400 font-bold">{team.folio}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs text-slate-400">
                          Registrado: {new Date(team.createdAt).toLocaleDateString('es-MX')}
                        </span>
                        {team.registeredBy === 'admin_desk' && (
                          <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-medium">
                            Ventanilla Axel Javier
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold font-display text-white mt-1">
                        {team.name}
                      </h2>
                      <span className="text-xs text-slate-300">
                        Color / Distintivo: <strong>{team.uniformColor}</strong>
                      </span>
                    </div>

                    {/* Operational Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenGameSheetModal(team)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 shadow"
                        title="Imprimir Cédula de Partido oficial"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Cédula de Juego</span>
                      </button>

                      {team.status === 'disqualified' ? (
                        <button
                          onClick={() => handleReactivateTeam(team.id)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reactivar Equipo</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDisqualifyTeam(team.id)}
                          className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                          title="Dar de baja o descalificar equipo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Dar de Baja</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rules Diagnostic Box */}
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      check.isFullyCompliant
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span className="flex items-center gap-2">
                        {check.isFullyCompliant ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        <span>
                          {check.isFullyCompliant
                            ? 'Plantilla 100% Cumplida con las Bases Oficiales'
                            : 'Observaciones de Reglas Oficiales (Axel Javier González Salas)'}
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

                  {/* Captain & Contact Card */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">Capitán / Contacto:</span>
                      <strong className="text-white text-sm">{team.captain.fullName}</strong>
                      <span className="text-slate-400 block">{team.captain.groupOrClass}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Teléfono / WhatsApp:</span>
                      <strong className="text-slate-200 font-mono">{team.captain.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Correo:</span>
                      <strong className="text-slate-200">{team.captain.email}</strong>
                    </div>
                  </div>

                  {/* Active Roster of Players */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>Plantilla Activa ({activePlayers.length} / 6)</span>
                      </h4>
                      <span className="text-xs text-slate-400">
                        Haz clic en un documento para revisarlo con zoom
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activePlayers.map((player) => (
                        <div
                          key={player.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-wrap items-center justify-between gap-3 text-xs"
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
                            {/* Document badge */}
                            <button
                              onClick={() => onOpenDocumentModal(player, team)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors border ${
                                player.document.status === 'approved'
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                                  : player.document.status === 'pending'
                                  ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                                  : 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/60'
                              }`}
                              title="Inspeccionar credencial con zoom"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>
                                {player.document.status === 'approved'
                                  ? 'Doc. Aprobado'
                                  : player.document.status === 'pending'
                                  ? 'Doc. Pendiente'
                                  : 'Doc. Rechazado'}
                              </span>
                            </button>

                            {/* Quick approve button if pending */}
                            {player.document.status !== 'approved' && (
                              <button
                                onClick={() => handleQuickApproveDoc(team.id, player.id)}
                                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition-colors"
                                title="Aprobar inmediatamente documento"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Substitute button */}
                            <button
                              onClick={() => handleOpenSubstitution(team.id, player)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium border border-slate-700 transition-colors"
                              title="Dar de baja y sustituir respetando el grado escolar"
                            >
                              Sustituir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inactive / Substituted players history */}
                  {inactivePlayers.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Historial de Bajas y Sustituciones de este equipo:
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
              Selecciona un equipo del listado para gestionar sus altas, bajas y validación de documentos.
            </div>
          )}
        </div>

      </div>

      {/* Substitution Modal with STRICT 2-2-2 Grade enforcement */}
      {substitutionModal.isOpen && substitutionModal.player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-amber-400 font-semibold block">
                Mesa de Control · Axel Javier González Salas
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Sustitución de Jugador (Regla de Bases)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                El jugador saliente <strong>{substitutionModal.player.fullName}</strong> es de{' '}
                <strong className="text-amber-400">{substitutionModal.player.grade}º Año</strong>.
                Para no quebrar la regla oficial 2-2-2, el alumno sustituto debe ser obligatoriamente del mismo grado.
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
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-400"
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
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-amber-400"
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
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-amber-500/40 rounded text-amber-400 font-bold cursor-not-allowed"
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
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-400"
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
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Se generará y validará automáticamente el comprobante digital escolar avalado por la coordinación.
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
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-all shadow"
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
