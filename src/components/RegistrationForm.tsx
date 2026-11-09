import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Trophy, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { Team, Player, GradeYear } from '../types/tournament';
import { isTeamNameTaken, findDuplicatePlayersInOtherTeams } from '../utils/rulesValidator';

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

// Preset color options for quick 1-tap selection
export const PRESET_COLORS = [
  { name: 'Rojo', bg: 'bg-red-500', hex: '#ef4444' },
  { name: 'Azul', bg: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Verde', bg: 'bg-emerald-500', hex: '#10b981' },
  { name: 'Amarillo', bg: 'bg-yellow-400', hex: '#facc15' },
  { name: 'Negro', bg: 'bg-slate-900', hex: '#0f172a' },
  { name: 'Blanco', bg: 'bg-slate-100 text-slate-900', hex: '#f8fafc' },
  { name: 'Naranja', bg: 'bg-orange-500', hex: '#f97316' },
  { name: 'Morado', bg: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Celeste', bg: 'bg-cyan-400', hex: '#22d3ee' },
  { name: 'Rosa', bg: 'bg-pink-500', hex: '#ec4899' },
];

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  existingTeams,
  onRegisterSuccess,
  onCancel,
  registeredBy = 'public_portal',
}) => {
  const [teamName, setTeamName] = useState('');
  const [selectedColor, setSelectedColor] = useState('Rojo');
  const [customColor, setCustomColor] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');

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

  const handlePlayerNameChange = (index: number, name: string) => {
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
      .map((p) => ({ name: p.fullName.trim(), curpOrId: '' }));
    const dupCheck = findDuplicatePlayersInOtherTeams(playersToCheck, existingTeams);
    if (dupCheck.isDuplicate && dupCheck.message) {
      errors.push(dupCheck.message);
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const folioNum = Math.floor(10 + Math.random() * 89);
    const folio = `TRF-12NOV-${folioNum}`;
    const finalColor = customColor.trim() ? `${selectedColor} (${customColor.trim()})` : selectedColor;

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
      uniformColor: finalColor,
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

          {/* Preset Color Selection Casilla */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Color de Camiseta / Uniforme * (Toca para elegir):
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((c) => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`min-h-[48px] py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-slate-800 text-white scale-105 shadow-md shadow-amber-500/10 ring-2 ring-amber-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border border-slate-700 shadow-sm ${c.bg}`}
                    />
                    <span className="text-[10px] truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Optional extra detail */}
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="Detalle extra opcional (ej. con franjas blancas)"
              className="mt-2 w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Captain and WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nombre de quien registra *
              </label>
              <input
                type="text"
                required
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                placeholder="Nombre del capitán o delegado"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Celular / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={captainPhone}
                onChange={(e) => setCaptainPhone(e.target.value)}
                placeholder="Ej. 4496600468"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-amber-400 block mt-0.5">
                Axel te confirmará tu inscripción por WhatsApp a este número.
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
            <span>REGISTRAR EQUIPO AHORA</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>

      </form>
    </div>
  );

  function renderSimplePlayerRow(index: number, defaultGrade: GradeYear) {
    const player = players[index];

    return (
      <div
        key={index}
        className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800"
      >
        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 text-xs font-bold font-mono flex items-center justify-center shrink-0">
          #{index + 1}
        </span>

        {/* Full Name */}
        <input
          type="text"
          required
          value={player.fullName}
          onChange={(e) => handlePlayerNameChange(index, e.target.value)}
          placeholder={`Nombre completo del jugador #${index + 1}`}
          className="flex-1 min-w-0 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
        />

        {/* Grade selector or badge */}
        <select
          value={player.grade}
          onChange={(e) => handlePlayerGradeChange(index, parseInt(e.target.value, 10) as GradeYear)}
          className="px-2 py-2 text-xs bg-slate-950 border border-amber-500/40 rounded-lg text-amber-400 font-bold focus:outline-none shrink-0"
        >
          <option value={3}>3º Año</option>
          <option value={2}>2º Año</option>
          <option value={1}>1º Año</option>
        </select>
      </div>
    );
  }
};
