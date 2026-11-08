import express from 'express';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = util.promisify(exec);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Route: Git status
  app.get('/api/git-status', async (_req, res) => {
    try {
      const { stdout: branch } = await execPromise('git branch --show-current');
      const { stdout: lastCommit } = await execPromise('git log -n 1 --oneline');
      const { stdout: remoteUrl } = await execPromise('git remote get-url origin || echo "none"');
      res.json({
        success: true,
        branch: branch.trim(),
        lastCommit: lastCommit.trim(),
        remoteUrl: remoteUrl.trim(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Git push to https://github.com/Spincel/torneo-fut
  app.post('/api/git-push', async (req, res) => {
    try {
      const { token } = req.body;
      const targetRemote = token
        ? `https://${token.trim()}@github.com/Spincel/torneo-fut.git`
        : 'https://github.com/Spincel/torneo-fut.git';

      // Ensure all changes are staged and committed
      await execPromise('git add .');
      try {
        await execPromise('git commit -m "feat: Sistema de registro y administración Torneo Relámpago con bases 2-2-2"');
      } catch (_e) {
        // Nothing new to commit, which is completely fine
      }

      // Execute push to main
      const { stdout, stderr } = await execPromise(`git push -u "${targetRemote}" main`);
      res.json({
        success: true,
        message: '¡Código fuente subido exitosamente a https://github.com/Spincel/torneo-fut en la rama main!',
        output: (stdout + '\n' + stderr).trim(),
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.stderr || err.message || 'Error al ejecutar git push. Verifica tu token de GitHub.',
      });
    }
  });

  // Production vs Dev
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
