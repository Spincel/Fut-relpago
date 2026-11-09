import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MobileBottomNav, TournamentTab } from './components/MobileBottomNav';
import { HeroSection } from './components/HeroSection';
import { RulesSection } from './components/RulesSection';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminPanel } from './components/AdminPanel';
import { PublicTeamsDirectory } from './components/PublicTeamsDirectory';
import { FixtureGenerator } from './components/FixtureGenerator';
import { OfficialGameSheetModal } from './components/OfficialGameSheetModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { InstallAppModal } from './components/InstallAppModal';
import { Team, TournamentMatch } from './types/tournament';
import {
  loadTeamsFromStorage,
  saveTeamsToStorage,
  loadFixtureFromStorage,
  saveFixtureToStorage,
} from './utils/storage';
import { generateCaptainToAxelLink } from './utils/whatsappHelper';
import { Trophy, Printer, ArrowRight, MessageCircle, ExternalLink, Lock } from 'lucide-react';

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<TournamentTab>('inicio');
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals state
  const [gameSheetModal, setGameSheetModal] = useState<{
    isOpen: boolean;
    team: Team | null;
  }>({
    isOpen: false,
    team: null,
  });

  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [newlyRegisteredTeam, setNewlyRegisteredTeam] = useState<Team | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const isIos = typeof window !== 'undefined' && /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const mainScrollRef = useRef<HTMLElement | null>(null);

  // Capturar evento de instalación nativa PWA para Chrome / Android / Samsung
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleTriggerNativeInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  // Cada que cambia la pestaña, restablecer el scroll al inicio en el contenedor de la app
  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentTab]);

  // Load teams and fixtures from persistent storage on mount
  useEffect(() => {
    const loadedTeams = loadTeamsFromStorage();
    setTeams(loadedTeams);
    const loadedMatches = loadFixtureFromStorage();
    setMatches(loadedMatches);
    setIsLoaded(true);
  }, []);

  const handleUpdateTeams = (updated: Team[]) => {
    setTeams(updated);
    saveTeamsToStorage(updated);
  };

  const handleUpdateMatches = (newMatches: TournamentMatch[]) => {
    setMatches(newMatches);
    saveFixtureToStorage(newMatches);
  };

  const handleRegisterSuccess = (team: Team) => {
    const updated = [team, ...teams];
    handleUpdateTeams(updated);
    setNewlyRegisteredTeam(team);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
        Cargando sistema del Torneo Relámpago...
      </div>
    );
  }

  // =========================================================================
  // MODO ORGANIZADOR EXCLUSIVO (Axel Javier González Salas)
  // Cuando ingresa la clave de administrador, se muestra ÚNICA Y EXCLUSIVAMENTE
  // el panel de administración con validación de jugadores duplicados,
  // sorteo en vivo y administración de bajas/altas.
  // =========================================================================
  if (isAdmin) {
    return (
      <div className="h-full h-[100dvh] max-h-[100dvh] w-full overflow-y-auto bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        <AdminPanel
          teams={teams}
          onUpdateTeams={handleUpdateTeams}
          matches={matches}
          onUpdateMatches={handleUpdateMatches}
          onLogoutAdmin={() => {
            setIsAdmin(false);
            setCurrentTab('inicio');
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // MODO PÚBLICO (Usuarios, Jugadores y Capitanes)
  // Aplicación móvil simétrica con 5 pestañas y el balón al centro exacto
  // =========================================================================
  return (
    <div className="h-full h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header App Bar (Limpio para usuarios, con botón discreto de App y acceso a Axel) */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdmin={isAdmin}
        onLogoutAdmin={() => {
          setIsAdmin(false);
          setCurrentTab('inicio');
        }}
        totalTeamsCount={teams.length}
        onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
        onOpenInstallModal={() => setInstallModalOpen(true)}
      />

      {/* Main Body Router con scroll inercial nativo y desacoplado del marco de la app */}
      <main ref={mainScrollRef} className="flex-1 app-scroll-view">
        {currentTab === 'inicio' && (
          <HeroSection
            onGoToRegister={() => setCurrentTab('registro')}
            onGoToTeams={() => setCurrentTab('equipos')}
            onGoToRules={() => setCurrentTab('reglas')}
            onGoToFixture={() => setCurrentTab('fixture')}
            onOpenInstallModal={() => setInstallModalOpen(true)}
            registeredTeamsCount={teams.length}
          />
        )}

        {currentTab === 'reglas' && (
          <RulesSection
            onGoToRegister={() => setCurrentTab('registro')}
            registeredTeamsCount={teams.length}
          />
        )}

        {currentTab === 'registro' && (
          <RegistrationForm
            existingTeams={teams}
            onRegisterSuccess={handleRegisterSuccess}
            onCancel={() => setCurrentTab('inicio')}
          />
        )}

        {currentTab === 'equipos' && (
          <PublicTeamsDirectory
            teams={teams}
            onGoToRegister={() => setCurrentTab('registro')}
          />
        )}

        {currentTab === 'fixture' && (
          <FixtureGenerator
            teams={teams}
            matches={matches}
            isAdmin={false}
          />
        )}

        {currentTab === 'admin' && (
          <div className="max-w-md mx-4 sm:mx-auto my-16 p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Panel de Organizadores</h3>
            <p className="text-xs text-slate-300">
              Esta sección está protegida para Axel Javier González Salas. Inicia sesión para validar altas, bajas y el sorteo en vivo.
            </p>
            <button
              onClick={() => setAdminLoginModalOpen(true)}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow cursor-pointer active:scale-95"
            >
              Ingresar Clave de Administrador
            </button>
          </div>
        )}

        {/* Footer with Discrete Admin Login Link (Dentro de main para fluir con el scroll) */}
        <footer className="no-print border-t border-slate-900 bg-slate-950/80 py-6 pb-28 lg:pb-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-200">
                Torneo Relámpago de Fútbol 2026
              </span>
              <span>·</span>
              <span>Jueves 12 de Noviembre</span>
            </div>

            <div className="flex items-center gap-4 justify-center sm:justify-end text-[11px] flex-wrap">
              <span>Organizador: <strong className="text-amber-400">Axel Javier González Salas</strong></span>
              <span>·</span>
              <button
                onClick={() => setAdminLoginModalOpen(true)}
                className="text-slate-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                title="Acceso exclusivo para el organizador"
              >
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Acceso Organizador</span>
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* Modal discreto de instalación para Samsung Galaxy, Android y iPhone */}
      <InstallAppModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        canPromptNative={!!deferredPrompt}
        onTriggerNativeInstall={handleTriggerNativeInstall}
        isIos={isIos}
      />

      {/* Fixed Bottom Mobile Navigation (5 pestañas con simetría y el balón de Inscribir en el CENTRO EXACTO) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        teamsCount={teams.length}
      />

      {/* Registration Success Dialog */}
      {newlyRegisteredTeam && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border-t-2 sm:border-2 border-amber-500/50 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
            
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

      {/* Modal: Official Printable Game Sheet */}
      <OfficialGameSheetModal
        team={gameSheetModal.team}
        isOpen={gameSheetModal.isOpen}
        onClose={() => setGameSheetModal({ isOpen: false, team: null })}
      />

      {/* Modal: Admin Protected Login for Axel */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
        }}
      />

    </div>
  );
}
