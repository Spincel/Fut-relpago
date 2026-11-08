import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Upload, CheckCircle2, User, Trophy, FileText } from 'lucide-react';
import { Team, Player, GradeYear, PlayerPosition } from '../types/tournament';
import { createMockCredential } from '../data/initialTeams';

interface RegistrationFormProps {
  onRegisterSuccess: (newTeam: Team) => void;
  onCancel: () => void;
  registeredBy?: 'public_portal' | 'admin_desk';
}

interface PlayerFormData {
  fullName: string;
  grade: GradeYear;
  studentIdOrCurp: string;
  position: PlayerPosition;
  jerseyNumber: string;
  documentName: string;
  documentUrl: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onRegisterSuccess,
  onCancel,
  registeredBy = 'public_portal',
}) => {
  const [teamName, setTeamName] = useState('');
  const [uniformColor, setUniformColor] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [captainGroup, setCaptainGroup] = useState('3º Grupo A');

  // Exact 6 players split by mandatory rules: 2 of 3rd, 2 of 2nd, 2 of 1st
  const [players, setPlayers] = useState<PlayerFormData[]>([
    {
      fullName: '',
      grade: 3,
      studentIdOrCurp: '',
      position: 'Portero',
      jerseyNumber: '1',
      documentName: 'credencial_estudiantil.svg',
      documentUrl: '',
    },
    {
      fullName: '',
      grade: 3,
      studentIdOrCurp: '',
      position: 'Defensa',
      jerseyNumber: '4',
      documentName: 'credencial_estudiantil.svg',
      documentUrl: '',
    },
    {
      fullName: '',
      grade: 2,
      studentIdOrCurp: '',
      position: 'Medio',
      jerseyNumber: '8',
      documentName: 'credencial_estudiantil.svg',
      documentUrl: '',
    },
    {
      fullName: '',
      grade: 2,
      studentIdOrCurp: '',
      position: 'Delantero',
      jerseyNumber: '9',
      documentName: 'credencial_estudiantil.svg',
      documentUrl: '',
    },
    {
      fullName: '',
      grade: 1,
      studentIdOrCurp: '',
      position: 'Defensa',
      jerseyNumber: '3',
      documentName: 'credencial_estudiantil.svg',
      documentUrl: '',
    },
    {
      fullName: '',
      grade: 1,
      studentIdOrCurp: '',
      position: 'Delantero',
      jerseyNumber: '7',
      documentName: 'credencial_estudiantil.svg',
      documentUrl: '',
    },
  ]);

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlayerChange = (index: number, field: keyof PlayerFormData, value: any) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPlayers((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          documentName: file.name,
          documentUrl: dataUrl,
        };
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAutoGenerateCredential = (index: number) => {
    const p = players[index];
    const name = p.fullName.trim() || `Jugador #${index + 1}`;
    const id = p.studentIdOrCurp.trim() || `MAT-${p.grade}A-${Math.floor(1000 + Math.random() * 9000)}`;
    const mockUrl = createMockCredential(name, p.grade, id);

    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        studentIdOrCurp: id,
        documentName: `credencial_${name.toLowerCase().replace(/\s+/g, '_')}.svg`,
        documentUrl: mockUrl,
      };
      return copy;
    });
  };

  const grade3Count = players.filter((p) => p.grade === 3).length;
  const grade2Count = players.filter((p) => p.grade === 2).length;
  const grade1Count = players.filter((p) => p.grade === 1).length;
  const filledNamesCount = players.filter((p) => p.fullName.trim().length > 2).length;
  const docsAttachedCount = players.filter((p) => Boolean(p.documentUrl)).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    const errors: string[] = [];

    if (!teamName.trim()) errors.push('El nombre del equipo es obligatorio.');
    if (!uniformColor.trim()) errors.push('Especifica el color o distintivo del uniforme.');
    if (!captainName.trim()) errors.push('El nombre del capitán es obligatorio.');
    if (!captainPhone.trim()) errors.push('El teléfono de contacto es obligatorio.');

    if (grade3Count !== 2) errors.push(`Debe haber exactamente 2 jugadores de 3er año (tienes ${grade3Count}).`);
    if (grade2Count !== 2) errors.push(`Debe haber exactamente 2 jugadores de 2do año (tienes ${grade2Count}).`);
    if (grade1Count !== 2) errors.push(`Debe haber exactamente 2 jugadores de 1er año (tienes ${grade1Count}).`);

    players.forEach((p, idx) => {
      if (!p.fullName.trim()) {
        errors.push(`Falta el nombre completo del Jugador #${idx + 1} (${p.grade}º Año).`);
      }
      if (!p.studentIdOrCurp.trim()) {
        errors.push(`Falta la matrícula o CURP del Jugador #${idx + 1}.`);
      }
      if (!p.documentUrl) {
        // Automatically create a mock credential if none was uploaded so user is never blocked
        p.documentUrl = createMockCredential(p.fullName || `Jugador ${idx + 1}`, p.grade, p.studentIdOrCurp || `MAT-${p.grade}A-00${idx + 1}`);
      }
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const folioNum = Math.floor(10 + Math.random() * 89);
    const folio = `TRF-12NOV-${folioNum}`;

    const formattedPlayers: Player[] = players.map((p, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      fullName: p.fullName.trim(),
      grade: p.grade,
      studentIdOrCurp: p.studentIdOrCurp.trim(),
      position: p.position,
      jerseyNumber: parseInt(p.jerseyNumber, 10) || idx + 1,
      isActive: true,
      document: {
        id: `doc-${Date.now()}-${idx}`,
        name: p.documentName || `credencial_${p.grade}ano.svg`,
        type: 'credencial',
        fileUrl: p.documentUrl,
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
      uniformColor: uniformColor.trim(),
      captain: {
        fullName: captainName.trim(),
        phone: captainPhone.trim(),
        email: captainEmail.trim() || 'contacto@estudiantes.edu.mx',
        groupOrClass: captainGroup.trim(),
      },
      players: formattedPlayers,
      status: registeredBy === 'admin_desk' ? 'approved' : 'in_review',
      createdAt: now,
      updatedAt: now,
      registeredBy,
      notes: registeredBy === 'admin_desk' 
        ? 'Inscripción directa en mesa con Axel Javier González Salas.' 
        : 'Inscripción vía portal web. Pendiente cotejo con Axel Javier González Salas.',
    };

    setTimeout(() => {
      onRegisterSuccess(newTeam);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title & Instructions */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Inscripción Oficial · Jueves 12 de Noviembre</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
          Registro Oficial de Equipo
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Completa los datos de tu equipo y de los 6 jugadores obligatorios con la distribución exacta
          de <strong>2 de 3er año, 2 de 2do año y 2 de 1er año</strong>.
        </p>
      </div>

      {/* Rules Live Tracker Bar */}
      <div className="mb-8 p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
        <div className="p-2 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block">Total Jugadores</span>
          <span className="text-lg font-bold font-mono text-white tabular-nums">
            {filledNamesCount} / 6
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block">3er Año (Exige 2)</span>
          <span className={`text-lg font-bold font-mono tabular-nums ${grade3Count === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {grade3Count} / 2
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block">2do Año (Exige 2)</span>
          <span className={`text-lg font-bold font-mono tabular-nums ${grade2Count === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {grade2Count} / 2
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block">1er Año (Exige 2)</span>
          <span className={`text-lg font-bold font-mono tabular-nums ${grade1Count === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {grade1Count} / 2
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-slate-400 block">Documentos</span>
          <span className={`text-lg font-bold font-mono tabular-nums ${docsAttachedCount === 6 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {docsAttachedCount} / 6
          </span>
        </div>
      </div>

      {/* Error alert if any */}
      {formErrors.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-400 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Por favor atiende los siguientes puntos de las bases:</span>
          </div>
          {formErrors.map((err, i) => (
            <p key={i}>· {err}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Team & Captain Info */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>1. Información del Equipo y Representante</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre Oficial del Equipo *
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Ej. Guerreros de Acero FC"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Color de Camiseta / Distintivo *
              </label>
              <input
                type="text"
                required
                value={uniformColor}
                onChange={(e) => setUniformColor(e.target.value)}
                placeholder="Ej. Blanco con franjas rojas"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Capitán / Delegado *
              </label>
              <input
                type="text"
                required
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                placeholder="Nombre completo del capitán"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono / WhatsApp de Contacto *
              </label>
              <input
                type="tel"
                required
                value={captainPhone}
                onChange={(e) => setCaptainPhone(e.target.value)}
                placeholder="Ej. 55 1234 5678"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={captainEmail}
                onChange={(e) => setCaptainEmail(e.target.value)}
                placeholder="correo@estudiantes.edu.mx"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Grupo / Salón del Capitán
              </label>
              <input
                type="text"
                value={captainGroup}
                onChange={(e) => setCaptainGroup(e.target.value)}
                placeholder="Ej. 3º Grupo B"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Step 2: 6 Required Players (Strict 2-2-2) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              <span>2. Plantilla de 6 Jugadores (Regla de Bases: 2 de 3º, 2 de 2º y 2 de 1º)</span>
            </h3>
            <span className="text-xs text-amber-400 font-semibold">
              Todos con documento escolar
            </span>
          </div>

          {/* Group 1: 3er Año */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-display font-bold text-sm text-amber-400 uppercase tracking-wide">
                Bloque 1 · 3er Año (2 Jugadores Obligatorios)
              </span>
              <span className="text-xs text-slate-400">Cupo 2 de 2</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1].map((pIdx) => renderPlayerCard(pIdx, 3))}
            </div>
          </div>

          {/* Group 2: 2do Año */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-display font-bold text-sm text-amber-400 uppercase tracking-wide">
                Bloque 2 · 2do Año (2 Jugadores Obligatorios)
              </span>
              <span className="text-xs text-slate-400">Cupo 2 de 2</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[2, 3].map((pIdx) => renderPlayerCard(pIdx, 2))}
            </div>
          </div>

          {/* Group 3: 1er Año */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-display font-bold text-sm text-amber-400 uppercase tracking-wide">
                Bloque 3 · 1er Año (2 Jugadores Obligatorios)
              </span>
              <span className="text-xs text-slate-400">Cupo 2 de 2</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[4, 5].map((pIdx) => renderPlayerCard(pIdx, 1))}
            </div>
          </div>

        </div>

        {/* Step 3: Registration Note & Coordinator Sign-off */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Cotejo Presencial con el Organizador</span>
            <span>
              Al enviar tu registro se generará tu folio oficial. Deberás presentar tus credenciales físicas o confirmación
              con <strong>Axel Javier González Salas</strong> entre lunes y miércoles para sellar tu cédula de juego antes del jueves 12 de noviembre.
            </span>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Registrando equipo...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Equipo Oficialmente</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );

  function renderPlayerCard(index: number, fixedGrade: GradeYear) {
    const player = players[index];
    const isReady = player.fullName.trim() && player.studentIdOrCurp.trim();

    return (
      <div
        key={index}
        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold font-mono flex items-center justify-center">
              #{index + 1}
            </span>
            <span className="text-xs font-bold text-white">
              Jugador #{index + 1}
            </span>
          </div>
          <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
            {fixedGrade}º Año
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">
            Nombre Completo del Alumno *
          </label>
          <input
            type="text"
            required
            value={player.fullName}
            onChange={(e) => handlePlayerChange(index, 'fullName', e.target.value)}
            placeholder="Ej. Rodrigo Mendoza Solís"
            className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">
              Matrícula / CURP *
            </label>
            <input
              type="text"
              required
              value={player.studentIdOrCurp}
              onChange={(e) => handlePlayerChange(index, 'studentIdOrCurp', e.target.value)}
              placeholder="Ej. MAT-3B-2024"
              className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">
              Posición
            </label>
            <select
              value={player.position}
              onChange={(e) => handlePlayerChange(index, 'position', e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Portero">Portero</option>
              <option value="Defensa">Defensa</option>
              <option value="Medio">Medio</option>
              <option value="Delantero">Delantero</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">
              Número de Camiseta
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={player.jerseyNumber}
              onChange={(e) => handlePlayerChange(index, 'jerseyNumber', e.target.value)}
              placeholder="10"
              className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">
              Grado Oficial
            </label>
            <input
              type="text"
              readOnly
              value={`${fixedGrade}º Año Escolar`}
              className="w-full px-3 py-1.5 text-xs bg-slate-900/50 border border-slate-800 rounded text-slate-400 font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        {/* Document Attachment / Simulation */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">
              Comprobante de Grado / Credencial
            </span>
            {player.documentUrl ? (
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Cargado
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 font-medium">Requerido</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer py-1.5 px-2 bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-amber-400/60 rounded text-center transition-colors">
              <span className="text-[11px] text-slate-300 flex items-center justify-center gap-1">
                <Upload className="w-3 h-3 text-amber-400" />
                <span>{player.documentName ? 'Cambiar archivo' : 'Subir foto/credencial'}</span>
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(index, e)}
              />
            </label>

            <button
              type="button"
              onClick={() => handleAutoGenerateCredential(index)}
              title="Generar credencial digital escolar automática para este alumno"
              className="py-1.5 px-2 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 rounded border border-slate-700 transition-colors whitespace-nowrap"
            >
              Auto-Credencial
            </button>
          </div>

          {player.documentUrl && (
            <div className="mt-1.5 flex items-center gap-2">
              <img
                src={player.documentUrl}
                alt="Vista previa"
                className="w-10 h-7 object-cover rounded border border-slate-700"
              />
              <span className="text-[10px] text-slate-400 truncate flex-1">
                {player.documentName}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
};
