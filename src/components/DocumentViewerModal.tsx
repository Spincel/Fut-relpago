import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Player, Team } from '../types/tournament';

interface DocumentViewerModalProps {
  player: Player | null;
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (teamId: string, playerId: string) => void;
  onReject: (teamId: string, playerId: string, reason: string) => void;
  isAdmin: boolean;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  player,
  team,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isAdmin,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Los hooks van antes del retorno anticipado: si no, React cambia el
  // número de hooks entre renders al abrir/cerrar el modal.
  if (!isOpen || !player || !team) return null;

  const QUICK_REASONS = [
    'Foto o documento ilegible/borroso.',
    'El grado escolar no coincide con la base oficial.',
    'Credencial escolar vencida o sin ciclo escolar actual.',
    'Falta sello o firma de la institución educativa.',
    'Nombre o CURP no coincide con el registro.',
  ];

  const handleApprove = () => {
    onApprove(team.id, player.id);
    onClose();
  };

  const handleReject = () => {
    const reason = rejectionReason.trim() || 'Documento no válido según las bases oficiales del torneo.';
    onReject(team.id, player.id, reason);
    setShowRejectForm(false);
    setRejectionReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border-t-2 sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90dvh]">
        {/* Mobile drag handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto my-2 sm:hidden shrink-0" />
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 font-semibold">{team.folio}</span>
              <span className="text-slate-400">·</span>
              <span className="text-xs text-slate-300 font-medium">{team.name}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2 mt-0.5 break-words">
              <span>Expediente Documental: {player.fullName}</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-amber-400 border border-slate-700">
                {player.grade}º Año
              </span>
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar expediente"
            className="min-w-[44px] min-h-[44px] p-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Document Preview & Info */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Document Preview Canvas */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center bg-slate-950 rounded-xl border border-slate-800 p-4 min-h-[350px] relative overflow-hidden">
            {/* Controls Bar */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-lg backdrop-blur z-10">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
                className="min-w-[36px] min-h-[36px] p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center justify-center"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
                className="min-w-[36px] min-h-[36px] p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center justify-center"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="min-w-[36px] min-h-[36px] p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded flex items-center justify-center"
                title="Girar"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Document Image or Fallback */}
            <div className="overflow-auto max-w-full min-h-[220px] max-h-[460px] flex items-center justify-center bg-slate-950/60 rounded-xl p-4">
              {player.document?.fileUrl ? (
                <img
                  src={player.document.fileUrl}
                  alt={`Credencial de ${player.fullName}`}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-out',
                  }}
                  className="max-w-full h-auto object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
                    🎓
                  </div>
                  <h4 className="text-sm font-bold text-white">Validación Presencial de Credencial</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Este jugador fue registrado en línea. Debe presentar su credencial escolar física de <strong>{player.grade}º Año</strong> en la mesa de control con Axel Javier.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-3 text-xs text-slate-400">
              Archivo: <span className="font-mono text-slate-300">{player.document?.name || 'Credencial Escolar Física'}</span>
            </div>
          </div>

          {/* Right Column: Player Data & Review Status */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Datos del Jugador</span>
                <div className="mt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Posición:</span>
                    <span className="text-white font-medium">{player.position || 'Jugador de Campo'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dorsal:</span>
                    <span className="text-white font-mono font-bold">#{player.jerseyNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grado registrado:</span>
                    <span className="text-amber-400 font-bold">{player.grade}º Año</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Matrícula/CURP:</span>
                    <span className="text-slate-200 font-mono">{player.studentIdOrCurp || 'Vigente'}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Estatus del Documento</span>
                <div className="mt-2 flex items-center gap-2">
                  {player.document?.status === 'approved' && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Documento Aprobado y Validado
                    </span>
                  )}
                  {(!player.document || player.document?.status === 'pending') && (
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Pendiente de Revisión
                    </span>
                  )}
                  {player.document?.status === 'rejected' && (
                    <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                      <X className="w-4 h-4 text-rose-400" />
                      Documento Rechazado
                    </span>
                  )}
                </div>

                {player.document?.rejectionReason && (
                  <div className="mt-2.5 p-2.5 rounded bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300">
                    <strong>Motivo de rechazo:</strong>
                    <p className="mt-0.5">{player.document.rejectionReason}</p>
                  </div>
                )}

                {player.document?.reviewedBy && (
                  <div className="mt-2 text-xs text-slate-400">
                    Revisado por: <span className="text-slate-300">{player.document.reviewedBy}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions for Axel Javier González Salas / Admin */}
            {isAdmin && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                {!showRejectForm ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleApprove}
                      className="w-full min-h-[48px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Aprobar</span>
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="w-full min-h-[48px] py-2.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/40 space-y-2">
                    <span className="text-xs font-bold text-rose-400 block">Indicar motivo de rechazo:</span>
                    
                    <div className="space-y-1">
                      {QUICK_REASONS.map((reason, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRejectionReason(reason)}
                          className="w-full text-left text-xs min-h-[36px] px-2 py-2 rounded hover:bg-slate-800 text-slate-300 truncate transition-colors"
                        >
                          · {reason}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Escribe observaciones específicas..."
                      rows={2}
                      className="w-full p-2 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-amber-400"
                    />

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setShowRejectForm(false)}
                        className="py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleReject}
                        className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded"
                      >
                        Confirmar Rechazo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
