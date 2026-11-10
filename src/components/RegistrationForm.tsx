import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Trophy, Check, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { Team, Player, GradeYear, BadgeShape, BadgePattern, TeamBadgeConfig } from '../types/tournament';
import { isTeamNameTaken, findDuplicatePlayersInOtherTeams } from '../utils/rulesValidator';
import { TeamBadge } from './TeamBadge';

interface RegistrationFormProps {
  existingTeams: Team[];
  onRegisterSuccess: (newTeam: Team) => void;
  onCancel: () => void;
  registeredBy?: 'public_portal' | 'admin_desk';
}

interface SimplePlayer {
  fullName: string;
  grade: GradeYear;
}

export interface UniformColorOption {
  name: string;
  bg: string;
  hex: string;
}

export const BADGE_SHAPES: Array<{ id: BadgeShape; label: string; icon: string }> = [
  { id: 'shield', label: 'Escudo', icon: '🛡️' },
  { id: 'circle', label: 'Círculo', icon: '⚪' },
  { id: 'oval', label: 'Óvalo', icon: '⬭' },
  { id: 'square', label: 'Diamante', icon: '◆' },
];

export const BADGE_PATTERNS: Array<{ id: BadgePattern; label: string; desc: string }> = [
  { id: 'solid', label: 'Sólido', desc: '1 Solo Color' },
  { id: 'bicolor', label: 'Bicolor', desc: 'Dividido Mitad y Mitad' },
  { id: 'striped', label: 'Con Franja', desc: 'Franja Diagonal' },
  { id: 'tricolor', label: 'Tricolor', desc: '3 Franjas Verticales' },
];

// Preset color options for quick 1-tap selection
export const PRESET_COLORS: UniformColorOption[] = [
  { name: 'Rojo', bg: 'bg-red-500', hex: '#ef4444' },
  { name: 'Azul', bg: 'bg-blue-600', hex: '#2563eb' },
  { name: 'Verde', bg: 'bg-emerald-500', hex: '#10b981' },
  { name: 'Amarillo', bg: 'bg-yellow-400', hex: '#facc15' },
  { name: 'Negro', bg: 'bg-slate-900', hex: '#0f172a' },
  { name: 'Blanco', bg: 'bg-slate-100 text-slate-900', hex: '#f8fafc' },
  { name: 'Naranja', bg: 'bg-orange-500', hex: '#f97316' },
  { name: 'Morado', bg: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Celeste', bg: 'bg-cyan-400', hex: '#22d3ee' },
  { name: 'Rosa', bg: 'bg-pink-500', hex: '#ec4899' },
  { name: 'Azul Marino', bg: 'bg-blue-950', hex: '#1e3a8a' },
  { name: 'Vino', bg: 'bg-rose-950', hex: '#881337' },
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  existingTeams,
  onRegisterSuccess,
  onCancel,
  registeredBy = 'public_portal',
}) => {
  const [teamName, setTeamName] = useState('');

  // Configuración de Pseudo-Escudo y Estilos de Uniforme
  const [badgeShape, setBadgeShape] = useState<BadgeShape>('shield');
  const [badgePattern, setBadgePattern] = useState<BadgePattern>('solid');
  const [primaryColor, setPrimaryColor] = useState<UniformColorOption>(PRESET_COLORS[0]); // Rojo
  const [secondaryColor, setSecondaryColor] = useState<UniformColorOption>(PRESET_COLORS[5]); // Blanco
  const [accentColor, setAccentColor] = useState<UniformColorOption>(PRESET_COLORS[4]); // Negro
  const [customColor, setCustomColor] = useState('');

  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [captainGrade, setCaptainGrade] = useState<GradeYear>(3);

  // 6 Players strictly divided: 2 of 3rd year, 2 of 2nd year, 2 of 1st year
  const [players, setPlayers] = useState<SimplePlayer[]>([
    { fullName: '', grade: 3 },
    { fullName: '', grade: 3 },
    { fullName: '', grade: 2 },
    { fullName: '', grade: 2 },
    { fullName: '', grade: 1 },
    { fullName: '', grade: 1 },
  ]);

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if team name is already taken
  const teamNameIsDuplicate = isTeamNameTaken(teamName, existingTeams);

  // Configuración reactiva del escudo para vista previa y envío
  const currentBadge: TeamBadgeConfig = {
    shape: badgeShape,
    pattern: badgePattern,
    primaryColor: primaryColor.hex,
    secondaryColor: secondaryColor.hex,
    accentColor: accentColor.hex,
  };

  const getGeneratedUniformDescription = () => {
    let desc = primaryColor.name;
    if (badgePattern === 'bicolor') {
      desc = `${primaryColor.name} y ${secondaryColor.name} (Bicolor)`;
    } else if (badgePattern === 'striped') {
      desc = `${primaryColor.name} con Franja ${secondaryColor.name}`;
    } else if (badgePattern === 'tricolor') {
      desc = `${primaryColor.name}, ${secondaryColor.name} y ${accentColor.name} (Tricolor)`;
    }
    if (customColor.trim()) {
      desc += ` - ${customColor.trim()}`;
    }
    return desc;
  };

  // Calcula el índice del jugador que corresponde al capitán según su grado
  const getCaptainPlayerIndex = (grade: GradeYear) => {
    return grade === 3 ? 0 : grade === 2 ? 2 : 4;
  };

  // Sincroniza el nombre del capitán con la casilla de jugador correspondiente
  const handleCaptainNameChange = (name: string) => {
    setCaptainName(name);
    const targetIdx = getCaptainPlayerIndex(captainGrade);
    setPlayers((prev) => {
      const copy = [...prev];
      copy[targetIdx] = { ...copy[targetIdx], fullName: name, grade: captainGrade };
      return copy;
    });
  };

  // Cambia el grado del capitán y reubica automáticamente su nombre en la plantilla de 6
  const handleCaptainGradeChange = (newGrade: GradeYear) => {
    const oldTargetIdx = getCaptainPlayerIndex(captainGrade);
    const newTargetIdx = getCaptainPlayerIndex(newGrade);
    setCaptainGrade(newGrade);

    setPlayers((prev) => {
      const copy = [...prev];
      // Liberar la casilla anterior si tenía el nombre del capitán
      if (copy[oldTargetIdx].fullName === captainName) {
        copy[oldTargetIdx] = { ...copy[oldTargetIdx], fullName: '' };
      }
      // Asignar el capitán en la casilla correspondiente a su nuevo grado
      copy[newTargetIdx] = { ...copy[newTargetIdx], fullName: captainName, grade: newGrade };
      return copy;
    });
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const captainIdx = getCaptainPlayerIndex(captainGrade);
    if (index === captainIdx) {
      setCaptainName(name);
    }
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], fullName: name };
      return copy;
    });
  };

  const handlePlayerGradeChange = (index: number, newGrade: GradeYear) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], grade: newGrade };
      return copy;
    });
  };

  // Grade counts calculation
  const grade3Count = players.filter((p) => p.grade === 3).length;
  const grade2Count = players.filter((p) => p.grade === 2).length;
  const grade1Count = players.filter((p) => p.grade === 1).length;
  const filledNamesCount = players.filter((p) => p.fullName.trim().length > 2).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    const errors: string[] = [];

    // 1. Team Name & Duplicate check
    if (!teamName.trim()) {
      errors.push('Por favor escribe el nombre de tu equipo.');
    } else if (teamNameIsDuplicate) {
      errors.push(`El nombre de equipo "${teamName}" ya está registrado. Elige otro nombre original.`);
    }

    // 2. Captain & Phone
    if (!captainName.trim()) {
      errors.push('Escribe el nombre de quien registra el equipo o capitán.');
    }
    if (!captainPhone.trim()) {
      errors.push('El número de celular/WhatsApp es obligatorio para que Axel te confirme la validación.');
    }

    // 3. Strict 2-2-2 validation
    if (grade3Count !== 2) {
      errors.push(`Debes registrar exactamente 2 alumnos de 3er año (tienes ${grade3Count}).`);
    }
    if (grade2Count !== 2) {
      errors.push(`Debes registrar exactamente 2 alumnos de 2do año (tienes ${grade2Count}).`);
    }
    if (grade1Count !== 2) {
      errors.push(`Debes registrar exactamente 2 alumnos de 1er año (tienes ${grade1Count}).`);
    }

    // 4. Check all 6 names filled and internal duplicate names
    const namesSet = new Set<string>();
    players.forEach((p, idx) => {
      const name = p.fullName.trim();
      if (!name) {
        errors.push(`Falta el nombre del Jugador #${idx + 1} (${p.grade}º Año).`);
      } else {
        if (namesSet.has(name.toLowerCase())) {
          errors.push(`El nombre "${name}" está repetido en la misma plantilla.`);
        }
        namesSet.add(name.toLowerCase());
      }
    });

    // 5. Check if any player is already in another team
    const playersToCheck = players
      .filter((p) => p.fullName.trim().length > 3)
      .map((p) => p.fullName.trim());
    const dupCheck = findDuplicatePlayersInOtherTeams(playersToCheck, existingTeams);
    if (dupCheck.isDuplicate && dupCheck.message) {
      errors.push(dupCheck.message);
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      // La ventana ya no hace scroll (app shell fijo): se desplaza el <main> de la app,
      // donde vive el formulario, hasta arriba para mostrar los errores de validación.
      document
        .querySelector('main.app-scroll-view')
        ?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const folioNum = Math.floor(10 + Math.random() * 89);
    const folio = `TRF-12NOV-${folioNum}`;

    const uniformDesc = getGeneratedUniformDescription();
    const badgeConfig: TeamBadgeConfig = currentBadge;

    const formattedPlayers: Player[] = players.map((p, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      fullName: p.fullName.trim(),
      grade: p.grade,
      isActive: true,
      document: {
        status: registeredBy === 'admin_desk' ? 'approved' : 'pending',
        uploadedAt: now,
        reviewedAt: registeredBy === 'admin_desk' ? now : undefined,
        reviewedBy: registeredBy === 'admin_desk' ? 'Axel Javier González Salas' : undefined,
      },
    }));

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      folio,
      name: teamName.trim(),
      uniformColor: uniformDesc,
      badge: badgeConfig,
      captain: {
        fullName: captainName.trim(),
        phone: captainPhone.trim(),
      },
      players: formattedPlayers,
      status: registeredBy === 'admin_desk' ? 'approved' : 'in_review',
      createdAt: now,
      updatedAt: now,
      registeredBy,
      notes: registeredBy === 'admin_desk'
        ? 'Inscripción directa en mesa con Axel Javier González Salas.'
        : 'Inscripción vía web. Notificación enviada al WhatsApp del organizador Axel Javier.',
    };

    setTimeout(() => {
      onRegisterSuccess(newTeam);
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      
      {/* Friendly Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-1">
          <Trophy className="w-3.5 h-3.5" />
          <span>Torneo Relámpago · Jueves 12 de Noviembre</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
          Registrar a tu Equipo
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Solo llena los nombres de tus <strong>6 jugadores</strong> (2 de 3º, 2 de 2º y 2 de 1º) y tu teléfono para que Axel te confirme.
        </p>
      </div>

      {/* Rules Live Pill Counter */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-4 gap-1.5 text-center text-xs">
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block font-bold">TOTAL</span>
          <span className="text-base sm:text-lg font-black font-mono text-white tabular-nums">
            {filledNamesCount}/6
          </span>
        </div>
        <div className={`p-2 rounded-xl border ${grade3Count === 2 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-slate-950 border-slate-800 text-amber-400'}`}>
          <span className="text-[10px] block font-bold">3er AÑO</span>
          <span className="text-base sm:text-lg font-black font-mono tabular-nums">
            {grade3Count}/2
          </span>
        </div>
        <div className={`p-2 rounded-xl border ${grade2Count === 2 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-slate-950 border-slate-800 text-amber-400'}`}>
          <span className="text-[10px] block font-bold">2do AÑO</span>
          <span className="text-base sm:text-lg font-black font-mono tabular-nums">
            {grade2Count}/2
          </span>
        </div>
        <div className={`p-2 rounded-xl border ${grade1Count === 2 ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-slate-950 border-slate-800 text-amber-400'}`}>
          <span className="text-[10px] block font-bold">1er AÑO</span>
          <span className="text-base sm:text-lg font-black font-mono tabular-nums">
            {grade1Count}/2
          </span>
        </div>
      </div>

      {/* Error messages */}
      {formErrors.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-rose-400 text-sm mb-1">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Por favor revisa estos datos:</span>
          </div>
          {formErrors.map((err, i) => (
            <p key={i}>· {err}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Section 1: Team & Phone */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>1. Datos del Equipo</span>
          </h3>

          {/* Team Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Nombre Oficial del Equipo *</span>
              {teamName && !teamNameIsDuplicate && (
                <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Disponible
                </span>
              )}
              {teamNameIsDuplicate && (
                <span className="text-rose-400 text-[11px] font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Nombre repetido
                </span>
              )}
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Ej. América FC, Dragones, Rayos..."
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-950 border rounded-xl text-white focus:outline-none ${
                teamNameIsDuplicate ? 'border-rose-500' : 'border-slate-700 focus:border-amber-400'
              }`}
            />
            {teamNameIsDuplicate && (
              <span className="text-[11px] text-rose-400 mt-1 block">
                ⚠️ Este nombre ya lo tiene otro equipo registrado. Elige un nombre diferente.
              </span>
            )}
          </div>

          {/* =========================================================
              DISEÑO PROFESIONAL DE ESCUDO Y ESTILO DE UNIFORME
              ========================================================= */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🛡️</span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Insignia Oficial y Estilo de Uniforme *
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Personalizable
              </span>
            </div>

            {/* Vista Previa en Vivo del Escudo */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <TeamBadge
                  badge={currentBadge}
                  teamName={teamName || 'Equipo'}
                  size={70}
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Insignia del Equipo:
                  </span>
                  <h4 className="font-display font-black text-sm text-white truncate leading-tight">
                    {teamName.trim() || 'Nombre de tu Equipo'}
                  </h4>
                  <span className="text-xs font-bold text-amber-400 block mt-0.5 truncate">
                    👕 {getGeneratedUniformDescription()}
                  </span>
                </div>
              </div>
              <div className="hidden sm:block text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">Aparecerá en tu póster</span>
                <span className="text-xs font-mono font-bold text-emerald-400">✓ Listo</span>
              </div>
            </div>

            {/* Paso 1: Forma del Escudo / Insignia */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                1. Elige la Forma del Escudo:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BADGE_SHAPES.map((sh) => {
                  const isSelected = badgeShape === sh.id;
                  return (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => setBadgeShape(sh.id)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40 font-black'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-sm">{sh.icon}</span>
                      <span className="text-[11px] truncate">{sh.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paso 2: Estilo de Uniforme / Patrón */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                2. Elige el Estilo de Camiseta:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BADGE_PATTERNS.map((pt) => {
                  const isSelected = badgePattern === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setBadgePattern(pt.id)}
                      className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all border cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40 font-black'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black">{pt.label}</span>
                      <span className={`text-[9px] ${isSelected ? 'text-slate-900/80 font-bold' : 'text-slate-400'}`}>
                        {pt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paso 3: Selección de Colores según el estilo elegido */}
            <div className="space-y-3 pt-1">
              
              {/* Color Principal */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor.hex }} />
                  <span>Color Principal / Base: <strong className="text-amber-400">{primaryColor.name}</strong></span>
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {PRESET_COLORS.map((c) => {
                    const isSelected = primaryColor.name === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setPrimaryColor(c)}
                        title={c.name}
                        className={`h-9 rounded-xl flex items-center justify-center transition-all border cursor-pointer active:scale-90 ${
                          isSelected
                            ? 'border-amber-400 scale-110 shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                            : 'border-slate-800 hover:border-slate-600'
                        } ${c.bg}`}
                      >
                        {isSelected && <span className="text-white text-xs drop-shadow">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Secundario (Si es Bicolor, Con Franja o Tricolor) */}
              {badgePattern !== 'solid' && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondaryColor.hex }} />
                    <span>
                      {badgePattern === 'striped' ? 'Color de la Franja:' : 'Segundo Color:'}{' '}
                      <strong className="text-amber-400">{secondaryColor.name}</strong>
                    </span>
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {PRESET_COLORS.map((c) => {
                      const isSelected = secondaryColor.name === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSecondaryColor(c)}
                          title={c.name}
                          className={`h-9 rounded-xl flex items-center justify-center transition-all border cursor-pointer active:scale-90 ${
                            isSelected
                              ? 'border-amber-400 scale-110 shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                              : 'border-slate-800 hover:border-slate-600'
                          } ${c.bg}`}
                        >
                          {isSelected && <span className="text-white text-xs drop-shadow">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color de Acento (Solo si es Tricolor) */}
              {badgePattern === 'tricolor' && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor.hex }} />
                    <span>Tercer Color (Acento): <strong className="text-amber-400">{accentColor.name}</strong></span>
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                    {PRESET_COLORS.map((c) => {
                      const isSelected = accentColor.name === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setAccentColor(c)}
                          title={c.name}
                          className={`h-9 rounded-xl flex items-center justify-center transition-all border cursor-pointer active:scale-90 ${
                            isSelected
                              ? 'border-amber-400 scale-110 shadow-md shadow-amber-500/20 ring-2 ring-amber-400'
                              : 'border-slate-800 hover:border-slate-600'
                          } ${c.bg}`}
                        >
                          {isSelected && <span className="text-white text-xs drop-shadow">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Detalle extra opcional */}
              <div>
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="Detalle extra opcional (ej. números dorados, cuello polo, medias negras)"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

            </div>

          </div>

          {/* Captain, Grade and WhatsApp */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombre del Capitán / Responsable *
                </label>
                <input
                  type="text"
                  required
                  value={captainName}
                  onChange={(e) => handleCaptainNameChange(e.target.value)}
                  placeholder="Ej. Saúl Pérez"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Celular / WhatsApp del Capitán *
                </label>
                <input
                  type="tel"
                  required
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  placeholder="Ej. 311 521 9149"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <span className="text-[10px] text-amber-400 block mt-0.5">
                  Axel Javier (311 521 9149) confirmará tu registro a este número.
                </span>
              </div>
            </div>

            {/* Selector de Grado del Capitán */}
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
              <label className="block text-xs font-bold text-amber-300">
                ¿De qué año escolar es el Capitán? * (Se asigna automáticamente a la plantilla de 6):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([3, 2, 1] as GradeYear[]).map((g) => {
                  const isSelected = captainGrade === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleCaptainGradeChange(g)}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all border cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>🎓</span>
                      <span>{g}º Año</span>
                      {isSelected && <span className="text-[11px] font-black">✓</span>}
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-400 block">
                💡 Al elegir el año, el capitán se registra en su grado y sólo debes registrar a los 5 compañeros restantes (total 6 personas).
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: 6 Players (Strict 2 of 3rd, 2 of 2nd, 2 of 1st) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>2. Integrantes del Equipo (6 Jugadores)</span>
              </h3>
              <span className="text-[11px] text-amber-400 font-semibold block">
                Regla obligatoria: 2 de 3er año, 2 de 2do año y 2 de 1er año
              </span>
            </div>
            <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-mono">
              6 Jugadores
            </span>
          </div>

          {/* Group 1: 3er Año (Slots 1 & 2) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
            <span className="text-xs font-black text-amber-400 block uppercase">
              🎓 Alumnos de 3er Año (2 Requeridos)
            </span>
            <div className="space-y-2">
              {[0, 1].map((idx) => renderSimplePlayerRow(idx, 3))}
            </div>
          </div>

          {/* Group 2: 2do Año (Slots 3 & 4) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
            <span className="text-xs font-black text-amber-400 block uppercase">
              🎓 Alumnos de 2do Año (2 Requeridos)
            </span>
            <div className="space-y-2">
              {[2, 3].map((idx) => renderSimplePlayerRow(idx, 2))}
            </div>
          </div>

          {/* Group 3: 1er Año (Slots 5 & 6) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
            <span className="text-xs font-black text-amber-400 block uppercase">
              🎓 Alumnos de 1er Año (2 Requeridos)
            </span>
            <div className="space-y-2">
              {[4, 5].map((idx) => renderSimplePlayerRow(idx, 1))}
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[48px] py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors text-center"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting || teamNameIsDuplicate}
            className="flex-2 min-h-[48px] py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>CONTINUAR Y CONFIRMAR EQUIPO</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

      </form>
    </div>
  );

  function renderSimplePlayerRow(index: number, defaultGrade: GradeYear) {
    const player = players[index];
    const isCaptainSlot = index === getCaptainPlayerIndex(captainGrade);

    return (
      <div
        key={index}
        className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
          isCaptainSlot
            ? 'bg-amber-950/25 border-amber-500/60 shadow-sm ring-1 ring-amber-500/30'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <span
          className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 ${
            isCaptainSlot ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-amber-400'
          }`}
        >
          #{index + 1}
        </span>

        {/* Full Name */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            required
            value={player.fullName}
            onChange={(e) => handlePlayerNameChange(index, e.target.value)}
            placeholder={
              isCaptainSlot
                ? `Nombre del Capitán (${defaultGrade}º Año)`
                : `Nombre del compañero #${index + 1}`
            }
            className={`w-full px-3 py-2 text-xs bg-slate-950 border rounded-lg text-white focus:outline-none ${
              isCaptainSlot
                ? 'border-amber-500/60 font-semibold focus:border-amber-400'
                : 'border-slate-700 focus:border-amber-400'
            }`}
          />
        </div>

        {/* Grade or Captain Badge */}
        {isCaptainSlot ? (
          <span className="px-2 py-1 text-[11px] font-black rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 flex items-center gap-1">
            <span>👑</span>
            <span>Capitán</span>
          </span>
        ) : (
          <span className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-950 border border-slate-800 text-slate-400 shrink-0">
            {defaultGrade}º Año
          </span>
        )}
      </div>
    );
  }
};
