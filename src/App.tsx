import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MobileBottomNav, TournamentTab } from './components/MobileBottomNav';
import { HeroSection } from './components/HeroSection';
import { RulesSection } from './components/RulesSection';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminPanel } from './components/AdminPanel';
import { PublicTeamsDirectory } from './components/PublicTeamsDirectory';
import { FixtureGenerator } from './components/FixtureGenerator';
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
import { generateTeamPosterDataUrl } from './utils/posterGenerator';
import { TeamBadge } from './components/TeamBadge';
import {
  Trophy,
  Download,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Lock,
  Pencil,
  CheckCircle2,
  Users,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<TournamentTab>('inicio');
  const [isAdmin, setIsAdmin] = useState(false);

  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [pendingTeam, setPendingTeam] = useState<Team | null>(null);
  const [celebrationTeam, setCelebrationTeam] = useState<Team | null>(null);
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
    // Abre el modal de confirmación y revisión antes de guardar
    setPendingTeam(team);
  };

  const handleConfirmRegistration = () => {
    if (!pendingTeam) return;
    const teamToSave = pendingTeam;

    // 1. Guardar equipo en almacenamiento y estado
    const updated = [teamToSave, ...teams];
    handleUpdateTeams(updated);

    // 2. Descargar automáticamente la imagen oficial (PNG) de la plantilla
    try {
      const posterUrl = generateTeamPosterDataUrl(teamToSave);
      const link = document.createElement('a');
      link.href = posterUrl;
      link.download = `Ficha_TorneoRelampago_${teamToSave.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al descargar póster automáticamente', err);
    }

    // 3. Abrir automáticamente WhatsApp con mensaje predefinido para Axel (311 521 9149)
    try {
      const waUrl = generateCaptainToAxelLink(teamToSave);
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error('Error al abrir WhatsApp', err);
    }

    // 4. Activar animación festiva de fútbol
    setCelebrationTeam(teamToSave);
    setPendingTeam(null);
  };

  const handleEditRegistration = () => {
    setPendingTeam(null);
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

      {/* =========================================================================
          MODAL 1: REVISIÓN Y CONFIRMACIÓN PREVIA DEL EQUIPO
          Muestra escudo, nombre, colores, lista de 6 jugadores por grado y la imagen
          ========================================================================= */}
      {pendingTeam && (() => {
        const posterUrl = generateTeamPosterDataUrl(pendingTeam);
        const p3 = pendingTeam.players.filter((p) => p.grade === 3);
        const p2 = pendingTeam.players.filter((p) => p.grade === 2);
        const p1 = pendingTeam.players.filter((p) => p.grade === 1);
        const captainNameLower = pendingTeam.captain.fullName.toLowerCase().trim();

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-slate-900 border-t-2 sm:border-2 border-amber-500/60 rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 space-y-3.5 max-h-[92dvh] overflow-y-auto no-scrollbar">
              
              {/* Mobile drag handle */}
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

              {/* Encabezado con botón de edición */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg">
                    ⚽
                  </div>
                  <div>
                    <h3 className="font-display text-sm sm:text-base font-black text-white leading-tight">
                      Confirma los Datos de tu Equipo
                    </h3>
                    <p className="text-[11px] text-amber-400 font-medium">
                      Verifica la plantilla y tu escudo antes de confirmar
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEditRegistration}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Pencil className="w-3 h-3 text-amber-400" />
                  <span>Editar</span>
                </button>
              </div>

              {/* 1. Nombre del Equipo, Escudo y Colores */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 flex items-center gap-3">
                <TeamBadge
                  badge={pendingTeam.badge}
                  fallbackColor={pendingTeam.uniformColor}
                  teamName={pendingTeam.name}
                  size={54}
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Equipo a Inscribir:
                  </span>
                  <h4 className="font-display font-black text-base text-white truncate leading-tight">
                    {pendingTeam.name}
                  </h4>
                  <span className="text-xs font-bold text-amber-400 block mt-0.5 truncate">
                    👕 {pendingTeam.uniformColor}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                    👑 Capitán: <strong className="text-slate-200">{pendingTeam.captain.fullName}</strong> · 📱 {pendingTeam.captain.phone}
                  </span>
                </div>
              </div>

              {/* 2. Lista de Jugadores Registrados por Grado (Antes de la imagen) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Integrantes Registrados (6 de 6)</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Regla 2-2-2
                  </span>
                </div>

                {/* 3er Año */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                    🎓 3er Año (2 Requeridos):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {p3.map((p, i) => {
                      const isCap = p.fullName.toLowerCase().trim() === captainNameLower;
                      return (
                        <div key={p.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-1">
                          <span className="text-white font-medium truncate">
                            <strong className="text-amber-400 font-mono mr-1">#{i + 1}</strong> {p.fullName}
                          </span>
                          {isCap && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                              👑 Capitán
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2do Año */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">
                    🎓 2do Año (2 Requeridos):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {p2.map((p, i) => {
                      const isCap = p.fullName.toLowerCase().trim() === captainNameLower;
                      return (
                        <div key={p.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-1">
                          <span className="text-white font-medium truncate">
                            <strong className="text-blue-400 font-mono mr-1">#{i + 3}</strong> {p.fullName}
                          </span>
                          {isCap && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                              👑 Capitán
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 1er Año */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">
                    🎓 1er Año (2 Requeridos):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {p1.map((p, i) => {
                      const isCap = p.fullName.toLowerCase().trim() === captainNameLower;
                      return (
                        <div key={p.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-1">
                          <span className="text-white font-medium truncate">
                            <strong className="text-purple-400 font-mono mr-1">#{i + 5}</strong> {p.fullName}
                          </span>
                          {isCap && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                              👑 Capitán
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Vista Previa de la Ficha Oficial (Después de los nombres) */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  Vista previa de la Cédula Oficial:
                </span>
                <div className="rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 p-1 flex items-center justify-center max-h-[200px]">
                  <img
                    src={posterUrl}
                    alt={`Ficha Oficial del Equipo ${pendingTeam.name}`}
                    className="w-full max-h-[190px] object-contain rounded-xl"
                  />
                </div>
              </div>

              {/* 4. Botones de Acción */}
              <div className="pt-1.5 space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmRegistration}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>CONFIRMAR EQUIPO</span>
                </button>

                <button
                  type="button"
                  onClick={handleEditRegistration}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-400" />
                  <span>Editar datos del equipo</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MODAL 2: ANIMACIÓN ESTILO FÚTBOL AL CONFIRMAR
          "¡Felicidades, Equipo Registrado!" con balón rebotando y confirmación
          ========================================================================= */}
      {celebrationTeam && (() => {
        const posterUrl = generateTeamPosterDataUrl(celebrationTeam);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg animate-in zoom-in-95 duration-300 overflow-hidden">
            
            {/* Resplandores ambientales de estadio */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-12 left-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-12 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500 rounded-3xl p-6 text-center space-y-4 shadow-2xl shadow-amber-500/25">
              
              {/* Balón con animación de fútbol y rebote */}
              <div className="relative pt-2">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
                  <span className="text-4xl">⚽</span>
                </div>
                <div className="absolute top-1 right-1/4 text-2xl animate-spin duration-1000">✨</div>
                <div className="absolute bottom-1 left-1/4 text-2xl animate-pulse">🎉</div>
              </div>

              {/* Títulos y Grito de Gol */}
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-mono px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 inline-block">
                  ¡ G O O O O L ! 🥅⚡
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight pt-1">
                  ¡Felicidades, Equipo Registrado!
                </h2>
                <p className="text-sm font-bold text-amber-300">
                  "{celebrationTeam.name}" está oficialmente en la contienda
                </p>
              </div>

              {/* Checklist de acciones automáticas completadas */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Cédula oficial descargada en tu dispositivo (.PNG)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>WhatsApp abierto para notificar a Axel (311 521 9149)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 pt-0.5 border-t border-slate-800/80">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Folio Oficial: <strong className="font-mono text-amber-400">{celebrationTeam.folio}</strong></span>
                </div>
              </div>

              {/* Respaldo por si el navegador bloqueó la descarga automática */}
              <div className="text-[11px] text-slate-400">
                ¿No se descargó la imagen?{' '}
                <a
                  href={posterUrl}
                  download={`Ficha_TorneoRelampago_${celebrationTeam.name.replace(/\s+/g, '_')}.png`}
                  className="text-amber-400 underline font-bold"
                >
                  Toca aquí para descargar manualmente
                </a>
              </div>

              {/* Botón para continuar a la app */}
              <button
                type="button"
                onClick={() => {
                  setCelebrationTeam(null);
                  setCurrentTab('equipos');
                }}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <span>VER EQUIPOS REGISTRADOS Y ROL</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

            </div>
          </div>
        );
      })()}

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
