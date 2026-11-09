import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Team } from '../types/tournament';
import { evaluateTeamRules } from '../utils/rulesValidator';

interface OfficialGameSheetModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialGameSheetModal: React.FC<OfficialGameSheetModalProps> = ({
  team,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !team) return null;

  const rulesCheck = evaluateTeamRules(team);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border-t-2 sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[95dvh]">
        {/* Mobile drag handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print px-4 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-400 font-semibold">{team.folio}</span>
            <span className="text-slate-400">·</span>
            <span className="text-sm font-bold text-white">Cédula Oficial de Partido</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="min-h-[40px] py-1.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden min-[400px]:inline">Imprimir Cédula</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar cédula"
              className="min-w-[44px] min-h-[44px] p-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Viewport */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-900 print:bg-white print:p-0">
          <div className="print-page bg-white text-slate-900 p-4 sm:p-8 rounded-xl shadow border border-slate-300 max-w-2xl mx-auto">
            
            {/* Header Document */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                  Comité Organizador Escolar
                </span>
                <h1 className="text-2xl font-black font-display tracking-tight text-slate-950 mt-0.5">
                  TORNEO RELÁMPAGO DE FÚTBOL
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Fecha Oficial: Jueves 12 de Noviembre · Inscripciones Lunes a Miércoles
                </p>
              </div>

              <div className="text-right">
                <div className="px-3 py-1 bg-slate-100 border border-slate-400 rounded text-center">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Folio Oficial</span>
                  <span className="text-base font-mono font-bold text-slate-900">{team.folio}</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Cédula Reglamentaria</span>
              </div>
            </div>

            {/* Team Identity Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold uppercase">Equipo Registrado:</span>
                <span className="text-base font-bold text-slate-950">{team.name}</span>
                <span className="block text-slate-600 mt-0.5">Colores / Distintivo: {team.uniformColor}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold uppercase">Capitán / Delegado:</span>
                <span className="text-sm font-bold text-slate-900">{team.captain.fullName}</span>
                <span className="block text-slate-600">Tel: {team.captain.phone} · {team.captain.groupOrClass || 'Grupo Escolar'}</span>
              </div>
            </div>

            {/* Rules Check Banner */}
            <div className="my-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">
                  Cumplimiento de Bases (Plantilla 2-2-2):
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] font-bold">
                <span className={rulesCheck.grade3Count === 2 ? 'text-emerald-700' : 'text-rose-700'}>
                  3º Año: {rulesCheck.grade3Count}/2
                </span>
                <span className={rulesCheck.grade2Count === 2 ? 'text-emerald-700' : 'text-rose-700'}>
                  2º Año: {rulesCheck.grade2Count}/2
                </span>
                <span className={rulesCheck.grade1Count === 2 ? 'text-emerald-700' : 'text-rose-700'}>
                  1er Año: {rulesCheck.grade1Count}/2
                </span>
              </div>
            </div>

            {/* Players Table */}
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Plantilla Oficial de 6 Jugadores
              </h3>

              <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full min-w-[560px] text-left text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <th className="p-2 border-r border-slate-300 font-bold">#</th>
                    <th className="p-2 border-r border-slate-300 font-bold">Nombre Completo</th>
                    <th className="p-2 border-r border-slate-300 font-bold">Grado</th>
                    <th className="p-2 border-r border-slate-300 font-bold">Posición</th>
                    <th className="p-2 border-r border-slate-300 font-bold">Matrícula/CURP</th>
                    <th className="p-2 border-r border-slate-300 font-bold text-center">Doc.</th>
                    <th className="p-2 font-bold text-center">Firma Jugador</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player, idx) => (
                    <tr key={player.id} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-300 font-mono font-bold text-center">
                        {player.jerseyNumber || idx + 1}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-medium">
                        {player.fullName}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-bold font-mono">
                        {player.grade}º Año
                      </td>
                      <td className="p-2 border-r border-slate-300 text-slate-600">
                        {player.position || 'Jugador'}
                      </td>
                      <td className="p-2 border-r border-slate-300 font-mono text-[10px] text-slate-600">
                        {player.studentIdOrCurp || 'Vigente'}
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center">
                        {player.document?.status === 'approved' ? (
                          <span className="text-[10px] text-emerald-700 font-bold">✓ VÁLIDO</span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-bold">PENDIENTE</span>
                        )}
                      </td>
                      <td className="p-2 h-9 border-slate-300"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {/* Match Control Fields for Referee */}
            <div className="mt-6 border border-slate-300 p-3 rounded text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50">
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Cancha Asignada:</span>
                <span className="font-bold text-slate-800">Cancha Principal</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Marcador Final:</span>
                <span className="font-mono font-bold text-slate-800">_____ - _____</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px]">Tarjetas / Incidencias:</span>
                <span className="font-medium text-slate-600">Ninguna</span>
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 h-10 mb-1"></div>
                <span className="font-semibold text-slate-900 block">{team.captain.fullName}</span>
                <span className="text-[10px] text-slate-500 uppercase">Firma del Capitán</span>
              </div>

              <div>
                <div className="border-b border-slate-400 h-10 mb-1"></div>
                <span className="font-semibold text-slate-900 block">Árbitro Oficial</span>
                <span className="text-[10px] text-slate-500 uppercase">Mesa de Arbitraje</span>
              </div>

              <div>
                <div className="border-b border-slate-400 h-10 mb-1"></div>
                <span className="font-semibold text-slate-900 block">Axel Javier González Salas</span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">
                  ✓ Coordinador & Organizador
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>
                Cédula expedida electrónicamente para el Torneo Relámpago de Fútbol - Jueves 12 de Noviembre.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
