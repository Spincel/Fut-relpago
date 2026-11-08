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
import { CheckCircle2, Trophy, Printer, ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'bases' | 'registro' | 'equipos' | 'fixture' | 'admin'>('bases');
  const [isAdmin, setIsAdmin] = useState(false);

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

        // Check if all players now have approved documents
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

      {/* Registration Success Dialog */}
      {newlyRegisteredTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                ¡Equipo Registrado con Éxito!
              </h3>
              <p className="text-xs text-slate-300">
                Tu solicitud ha sido guardada en el padrón del Torneo Relámpago de Fútbol.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Folio Oficial Asignado:</span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {newlyRegisteredTeam.folio}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Equipo:</span>
                <span className="font-bold text-white">{newlyRegisteredTeam.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capitán:</span>
                <span className="text-slate-200">{newlyRegisteredTeam.captain.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plantilla:</span>
                <span className="text-slate-200">6 Jugadores (2 de 3º, 2 de 2º y 2 de 1º)</span>
              </div>
            </div>

            {/* Instruction strip for Axel Javier González Salas */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 flex items-start gap-2.5">
              <User className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block">Paso obligatorio para validar inscripción:</strong>
                <span>
                  Favor de pasar a registrar tus equipos y presentar credenciales físicas con{' '}
                  <strong className="text-white">Axel Javier González Salas</strong> de <strong>lunes a miércoles</strong>{' '}
                  para recibir el sello oficial en tu cédula de juego antes del jueves 12 de noviembre.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const t = newlyRegisteredTeam;
                  setNewlyRegisteredTeam(null);
                  setGameSheetModal({ isOpen: true, team: t });
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Ver Cédula Oficial</span>
              </button>
              <button
                onClick={() => {
                  setNewlyRegisteredTeam(null);
                  setCurrentTab('equipos');
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
              >
                <span>Aceptar y Ver Padrón</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
