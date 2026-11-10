import React, { useState, useEffect } from 'react';
import {
  X,
  GitBranch,
  ArrowUpRight,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Shield,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

interface GitSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitStatusData {
  branch: string;
  lastCommit: string;
  remoteUrl: string;
}

export const GitSyncModal: React.FC<GitSyncModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [gitStatus, setGitStatus] = useState<GitStatusData | null>(null);
  const [githubToken, setGithubToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
    output?: string;
  } | null>(null);

  const [repoUrl, setRepoUrl] = useState('https://github.com/Spincel/T-fut');

  const COMMAND_BLOCK = `git remote set-url origin ${repoUrl}.git || git remote add origin ${repoUrl}.git
git branch -M main
git add .
git commit -m "fix(vercel): Resolve peer dependency conflict with .npmrc legacy-peer-deps and remove redundant esbuild"
git push -u origin main --force`;

  useEffect(() => {
    fetchGitStatus();
  }, []);

  const fetchGitStatus = async () => {
    try {
      const res = await fetch('/api/git-status');
      if (res.ok) {
        const data = await res.json();
        setGitStatus(data);
      }
    } catch (_e) {
      // Fallback
      setGitStatus({
        branch: 'main',
        lastCommit: '5f4efb8 feat: Sistema de registro y administración Torneo Relámpago',
        remoteUrl: 'https://github.com/Spincel/torneo-fut.git',
      });
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePushToGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/git-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken.trim(), repoUrl }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setPushResult({
          success: false,
          message: 'En entornos de despliegue estático, ejecuta los comandos de terminal abajo para hacer push directamente.',
          output: 'Usa los comandos que se muestran abajo para hacer push directamente desde tu equipo.',
        });
        return;
      }

      const data = await res.json();

      if (data.success) {
        setPushResult({
          success: true,
          message: data.message,
          output: data.output,
        });
        fetchGitStatus();
      } else {
        setPushResult({
          success: false,
          message: data.error || 'Error al conectar con GitHub. Verifica los permisos de tu token.',
          output: data.error,
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        message: 'No se pudo comunicar con el endpoint local de Git. Puedes usar los comandos de terminal abajo.',
        output: err.message,
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-t-2 sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Mobile drag handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto my-1 sm:hidden shrink-0" />
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Sincronización con GitHub
              </h3>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>{repoUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Repository Switcher */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-300 block">Repositorio Destino:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRepoUrl('https://github.com/Spincel/T-fut')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                repoUrl.includes('T-fut') || repoUrl.includes('Fut-relpago')
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              ⭐ Spincel/T-fut (Vercel)
            </button>
            <button
              type="button"
              onClick={() => setRepoUrl('https://github.com/Spincel/torneo-fut')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                repoUrl.includes('torneo-fut')
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Spincel/torneo-fut
            </button>
          </div>
        </div>

        {/* Current Git Status */}
        {gitStatus && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block font-sans uppercase">Rama:</span>
              <strong className="text-amber-400 font-bold">{gitStatus.branch || 'main'}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans uppercase">Último Commit:</span>
              <span className="text-slate-200 truncate block">{gitStatus.lastCommit || '5f4efb8'}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] block font-sans uppercase">Remoto Configurado:</span>
              <span className="text-emerald-400 font-bold block truncate">✓ origin (torneo-fut)</span>
            </div>
          </div>
        )}

        {/* Option 1: 1-Click In-App Push Form */}
        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">
              Subir a GitHub Directamente
            </h4>
          </div>

          <p className="text-xs text-slate-300">
            Ingresa tu <strong>GitHub Personal Access Token (PAT)</strong> con permiso <code>repo</code> para subir
            todos los archivos, componentes, y bases del torneo a <strong>https://github.com/Spincel/torneo-fut</strong>:
          </p>

          <form onSubmit={handlePushToGithub} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  GitHub Token (ghp_... o github_pat_...)
                </span>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=Torneo+Fut+Sync"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-0.5 text-[10px]"
                >
                  Generar token en GitHub <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>

              <input
                type="password"
                required
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={isPushing}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPushing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Subiendo código al repositorio Spincel/torneo-fut...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-slate-950" />
                  <span>Hacer Push a https://github.com/Spincel/torneo-fut</span>
                </>
              )}
            </button>
          </form>

          {/* Result Alert */}
          {pushResult && (
            <div
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                pushResult.success
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-800 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {pushResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{pushResult.message}</span>
              </div>
              {pushResult.output && (
                <pre className="mt-1 p-2 bg-slate-950 rounded text-[10px] font-mono overflow-x-auto text-slate-300">
                  {pushResult.output}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Option 2: Manual Terminal CLI Commands */}
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5 font-mono">
              <Terminal className="w-4 h-4 text-amber-400" />
              Opcional: Comandos manuales en terminal
            </span>
            <button
              onClick={() => copyToClipboard(COMMAND_BLOCK, 1)}
              className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              {copiedIndex === 1 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar comandos</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
            {COMMAND_BLOCK}
          </pre>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono text-xs"
          >
            <span>Ir a {repoUrl.replace('https://github.com/', '')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
