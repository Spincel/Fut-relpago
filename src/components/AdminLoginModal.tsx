import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Los hooks van antes del retorno anticipado: si no, React cambia el
  // número de hooks entre renders al abrir/cerrar el modal.
  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Accepted organizer credentials
    const validUsers = ['axel', 'axel.gonzalez', 'organizador', 'admin'];
    const validPasswords = ['1211', 'axel2026', 'torneo12'];

    if (validUsers.includes(cleanUser) && validPasswords.includes(cleanPass)) {
      onLoginSuccess();
      onClose();
    } else {
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña de organizador.');
    }
  };

  const fillQuickDemoCredentials = () => {
    setUsername('axel');
    setPassword('1211');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-t-2 sm:border-2 border-amber-500/40 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
        
        {/* Mobile drag handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto my-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Acceso del Organizador
              </h3>
              <span className="text-[11px] text-slate-400">
                Panel Exclusivo para Axel Javier González Salas
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar inicio de sesión"
            className="min-w-[44px] min-h-[44px] p-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Usuario de Administrador *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej. axel"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contraseña / PIN de Seguridad *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PIN de acceso (ej. 1211)"
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Organizer Credentials Reminder Box */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                Datos de Acceso Oficiales:
              </span>
              <button
                type="button"
                onClick={fillQuickDemoCredentials}
                className="min-h-[36px] inline-flex items-center px-1 text-[10px] text-amber-300 hover:underline font-bold"
              >
                Auto-completar
              </button>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
              <div>Usuario: <strong className="text-white">axel</strong></div>
              <div>Contraseña / PIN: <strong className="text-white">1211</strong> (12 de Noviembre)</div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Entrar como Administrador</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
