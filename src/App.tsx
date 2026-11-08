import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HeroSection } from './components/HeroSection';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminPanel } from './components/AdminPanel';
import { PublicTeamsDirectory } from './components/PublicTeamsDirectory';
import { FixtureGenerator } from './components/FixtureGenerator';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { OfficialGameSheetModal } from './components/OfficialGameSheetModal';
import { GitSyncModal } from './components/GitSyncModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Team, Player } from './types/tournament';
import { loadTeamsFromStorage, saveTeamsToStorage } from './utils/storage';
import { generateCaptainToAxelLink } from './utils/whatsappHelper';
import { Trophy, Printer, ArrowRight, MessageCircle, ExternalLink, Lock, ShieldCheck } from 'lucide-react';

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'bases' | 'registro' | 'equipos' | 'fixture' | 'admin'>('bases');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newRegistrationsCount, setNewRegistrationsCount] = useState(1);

  // Modals state
  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean;
    player: Player | null;
    team: Team | null;
  }>({
    isOpen: false,
    player: null,
    team: null,
  });

  const [gameSheetModal, setGameSheetModal] = useState<{
    isOpen: boolean;
    team: Team | null;
  }>({
    isOpen: false,
    team: null,
  });

  const [gitModalOpen, setGitModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [newlyRegisteredTeam, setNewlyRegisteredTeam] = useState<Team | null>(null);

  // Load teams from persistent local storage on mount
  useEffect(() => {
    const data = loadTeamsFromStorage();
    setTeams(data);
    setIsLoaded(true);
  }, []);

  const handleUpdateTeams = (updated: Team[]) => {
    setTeams(updated);
    saveTeamsToStorage(updated);
  };

  const handleRegisterSuccess = (team: Team) => {
    const updated = [team, ...teams];
    handleUpdateTeams(updated);
    setNewlyRegisteredTeam(team);
    setNewRegistrationsCount((prev) => prev + 1);
  };

  const handleOpenDocModal = (player: Player, team: Team) => {
    setDocumentModal({
      isOpen: true,
      player,
      team,
    });
  };

  const handleApproveDocument = (teamId: string, playerId: string) => {
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

        const allApproved = updatedPlayers.every((p) => p.document?.status === 'approved');

        return {
          ...t,
          players: updatedPlayers,
          status: allApproved ? ('approved' as const) : t.status,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    handleUpdateTeams(updated);
  };

  const handleRejectDocument = (teamId: string, playerId: string, reason: string) => {
    const updated = teams.map((t) => {
      if (t.id === teamId) {
        const updatedPlayers = t.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                document: {
                  ...p.document,
                  status: 'rejected' as const,
                  rejectionReason: reason,
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: 'Axel Javier González Salas',
                },
              }
            : p
        );

        return {
          ...t,
          players: updatedPlayers,
          status: 'in_review' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    handleUpdateTeams(updated);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        Cargando sistema del Torneo Relámpago...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header App Bar (Clean for regular users, shows status for Axel if logged in) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdmin={isAdmin}
        onLogoutAdmin={() => {
          setIsAdmin(false);
          setCurrentTab('bases');
        }}
        onOpenGitModal={() => setGitModalOpen(true)}
        totalTeamsCount={teams.length}
      />

      {/* Main Body Router with pb-24 for mobile bottom nav bar clearance */}
      <main className="flex-1 pb-24 lg:pb-12">
        {currentTab === 'bases' && (
          <div>
            <HeroSection
              onGoToRegister={() => setCurrentTab('registro')}
              onGoToTeams={() => setCurrentTab('equipos')}
              onGoToAdmin={() => {
                if (isAdmin) {
                  setCurrentTab('admin');
                } else {
                  setAdminLoginModalOpen(true);
                }
              }}
              registeredTeamsCount={teams.length}
            />
            
            {/* Quick public listing preview */}
            <div className="border-t border-slate-900 bg-slate-950/50 py-8 sm:py-12">
              <PublicTeamsDirectory
                teams={teams}
                onGoToRegister={() => setCurrentTab('registro')}
                onOpenDocumentModal={handleOpenDocModal}
                onOpenGameSheetModal={(team) => setGameSheetModal({ isOpen: true, team })}
              />
            </div>
          </div>
        )}

        {currentTab === 'registro' && (
          <RegistrationForm
            existingTeams={teams}
            onRegisterSuccess={handleRegisterSuccess}
            onCancel={() => setCurrentTab('bases')}
          />
        )}

        {currentTab === 'equipos' && (
          <PublicTeamsDirectory
            teams={teams}
            onGoToRegister={() => setCurrentTab('registro')}
            onOpenDocumentModal={handleOpenDocModal}
            onOpenGameSheetModal={(team) => setGameSheetModal({ isOpen: true, team })}
          />
        )}

        {currentTab === 'fixture' && (
          <FixtureGenerator teams={teams} isAdmin={isAdmin} />
        )}

        {currentTab === 'admin' && (
          isAdmin ? (
            <AdminPanel
              teams={teams}
              onUpdateTeams={handleUpdateTeams}
              onOpenDocumentModal={handleOpenDocModal}
              onOpenGameSheetModal={(team) => setGameSheetModal({ isOpen: true, team })}
              onOpenNewRegistration={() => setCurrentTab('registro')}
              newRegistrationsCount={newRegistrationsCount}
              onClearNewNotification={() => setNewRegistrationsCount(0)}
            />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Panel de Organizadores</h3>
              <p className="text-xs text-slate-300">
                Esta sección está protegida para Axel Javier González Salas. Inicia sesión para validar altas, bajas y fichas.
              </p>
              <button
                onClick={() => setAdminLoginModalOpen(true)}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow cursor-pointer"
              >
                Ingresar Clave de Administrador
              </button>
            </div>
          )
        )}
      </main>

      {/* Fixed Bottom Mobile Navigation (Normal users see 4 tabs; Admin tab only shows if logged in) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        teamsCount={teams.length}
        newRegistrationsCount={newRegistrationsCount}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
      />

      {/* Footer with Discrete Admin Login Link */}
      <footer className="no-print border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-200">
              Torneo Relámpago de Fútbol 2026
            </span>
            <span>·</span>
            <span>Jueves 12 de Noviembre</span>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-end text-[11px]">
            <span>Organizador: <strong className="text-amber-400">Axel Javier González Salas</strong></span>
            <span>·</span>
            {/* Discrete organizer login link for Axel */}
            {!isAdmin ? (
              <button
                onClick={() => setAdminLoginModalOpen(true)}
                className="text-slate-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                title="Acceso exclusivo para el organizador"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Acceso Organizador</span>
              </button>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Sesión de Axel Activa</span>
              </span>
            )}
          </div>
        </div>
      </footer>

      {/* Registration Success Dialog */}
      {newlyRegisteredTeam && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border-t-2 sm:border-2 border-amber-500/50 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                ⚽
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                ¡Equipo Registrado con Éxito!
              </h3>
              <p className="text-xs text-slate-300">
                Se generó tu Ficha Oficial de Inscripción para el Torneo Relámpago.
              </p>
            </div>

            {/* Official Card Details */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Folio Oficial:</span>
                <span className="font-mono text-base font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg">
                  {newlyRegisteredTeam.folio}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Equipo:</span>
                <span className="font-bold text-white">{newlyRegisteredTeam.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Color Uniforme:</span>
                <span className="text-amber-400 font-bold">{newlyRegisteredTeam.uniformColor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capitán:</span>
                <span className="text-slate-200">{newlyRegisteredTeam.captain.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">WhatsApp Registrado:</span>
                <span className="text-emerald-400 font-mono font-bold">{newlyRegisteredTeam.captain.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plantilla:</span>
                <span className="text-amber-400 font-bold">6 Jugadores (2 de 3º, 2 de 2º y 2 de 1º)</span>
              </div>
            </div>

            {/* Action 1: Send via WhatsApp to Axel */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 space-y-2">
              <span className="text-xs font-bold text-emerald-300 block flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Paso 1: Notificar a Axel Javier por WhatsApp
              </span>
              <p className="text-[11px] text-slate-300">
                Toca aquí para mandar tu registro directamente al WhatsApp de Axel:
              </p>
              <a
                href={generateCaptainToAxelLink(newlyRegisteredTeam)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Ficha por WhatsApp a Axel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Action 2: Download / Print Ficha */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                onClick={() => {
                  const t = newlyRegisteredTeam;
                  setNewlyRegisteredTeam(null);
                  setGameSheetModal({ isOpen: true, team: t });
                }}
                className="w-full sm:w-auto flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Descargar / Imprimir Ficha Oficial</span>
              </button>

              <button
                onClick={() => {
                  setNewlyRegisteredTeam(null);
                  setCurrentTab('equipos');
                }}
                className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Ver Equipos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Document Viewer & Validator */}
      <DocumentViewerModal
        player={documentModal.player}
        team={documentModal.team}
        isOpen={documentModal.isOpen}
        onClose={() => setDocumentModal({ isOpen: false, player: null, team: null })}
        onApprove={handleApproveDocument}
        onReject={handleRejectDocument}
        isAdmin={isAdmin}
      />

      {/* Modal: Official Printable Game Sheet */}
      <OfficialGameSheetModal
        team={gameSheetModal.team}
        isOpen={gameSheetModal.isOpen}
        onClose={() => setGameSheetModal({ isOpen: false, team: null })}
      />

      {/* Modal: GitHub Sync guidance */}
      <GitSyncModal
        isOpen={gitModalOpen}
        onClose={() => setGitModalOpen(false)}
      />

      {/* Modal: Admin Protected Login for Axel */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setCurrentTab('admin');
        }}
      />

    </div>
  );
}
