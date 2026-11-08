import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminPanel } from './components/AdminPanel';
import { PublicTeamsDirectory } from './components/PublicTeamsDirectory';
import { FixtureGenerator } from './components/FixtureGenerator';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { OfficialGameSheetModal } from './components/OfficialGameSheetModal';
import { GitSyncModal } from './components/GitSyncModal';
import { Team, Player } from './types/tournament';
import { loadTeamsFromStorage, saveTeamsToStorage } from './utils/storage';
import { generateCaptainToAxelLink } from './utils/whatsappHelper';
import { CheckCircle2, Trophy, Printer, ArrowRight, MessageCircle, ExternalLink, Bell } from 'lucide-react';

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'bases' | 'registro' | 'equipos' | 'fixture' | 'admin'>('bases');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newRegistrationsCount, setNewRegistrationsCount] = useState(1); // 1 to demo notification for Axel

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

        const allApproved = updatedPlayers.every((p) => p.document.status === 'approved');

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
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenGitModal={() => setGitModalOpen(true)}
        totalTeamsCount={teams.length}
      />

      {/* Main Body Router */}
      <main className="flex-1">
        {currentTab === 'bases' && (
          <div>
            <HeroSection
              onGoToRegister={() => setCurrentTab('registro')}
              onGoToTeams={() => setCurrentTab('equipos')}
              onGoToAdmin={() => {
                setIsAdmin(true);
                setCurrentTab('admin');
              }}
              registeredTeamsCount={teams.length}
            />
            
            {/* Quick public listing preview */}
            <div className="border-t border-slate-900 bg-slate-950/50 py-12">
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
          <AdminPanel
            teams={teams}
            onUpdateTeams={handleUpdateTeams}
            onOpenDocumentModal={handleOpenDocModal}
            onOpenGameSheetModal={(team) => setGameSheetModal({ isOpen: true, team })}
            onOpenNewRegistration={() => setCurrentTab('registro')}
            newRegistrationsCount={newRegistrationsCount}
            onClearNewNotification={() => setNewRegistrationsCount(0)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-200">
              Torneo Relámpago de Fútbol 2026
            </span>
            <span>·</span>
            <span>Jueves 12 de Noviembre</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Organizador Oficial:</span>
            <strong className="text-amber-400">Axel Javier González Salas</strong>
            <span>·</span>
            <button
              onClick={() => setGitModalOpen(true)}
              className="text-slate-400 hover:text-white underline font-mono text-[11px]"
            >
              GitHub: Spincel/torneo-fut
            </button>
          </div>
        </div>
      </footer>

      {/* Registration Success Dialog with Immediate Ficha Download & WhatsApp sharing */}
      {newlyRegisteredTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl p-6 space-y-5">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                ⚽
              </div>
              <h3 className="font-display text-2xl font-black text-white">
                ¡Equipo Registrado con Éxito!
              </h3>
              <p className="text-xs text-slate-300">
                Se ha generado tu Ficha Oficial de Inscripción para el Torneo Relámpago.
              </p>
            </div>

            {/* Official Card Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Folio Oficial de Inscripción:</span>
                <span className="font-mono text-lg font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg">
                  {newlyRegisteredTeam.folio}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Equipo:</span>
                <span className="font-bold text-white text-sm">{newlyRegisteredTeam.name}</span>
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
                <span className="text-slate-400">Plantilla Oficial:</span>
                <span className="text-amber-400 font-bold">6 Jugadores (2 de 3º, 2 de 2º y 2 de 1º)</span>
              </div>
            </div>

            {/* Action 1: Send via WhatsApp to Axel */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 space-y-2">
              <span className="text-xs font-bold text-emerald-300 block flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Paso 1: Notificar a Axel Javier González Salas
              </span>
              <p className="text-[11px] text-slate-300">
                Envía tu ficha por WhatsApp para que Axel coteje tus credenciales de 3º, 2º y 1er año:
              </p>
              <a
                href={generateCaptainToAxelLink(newlyRegisteredTeam)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Ficha por WhatsApp a Axel Javier</span>
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
                className="w-full sm:w-auto flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Descargar / Imprimir Ficha Oficial</span>
              </button>

              <button
                onClick={() => {
                  setNewlyRegisteredTeam(null);
                  setCurrentTab('equipos');
                }}
                className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>Ver Padrón de Equipos</span>
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

    </div>
  );
}
