// Vercel Serverless Function: Global Cloud Sync for Teams
// Uses Upstash Redis REST API with robust command format and merge support

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(200).json({
      success: false,
      configured: false,
      message: 'Vercel KV no configurado en Vercel Dashboard. Los datos se guardan en localStorage.',
    });
  }

  // Helper to execute Upstash Redis commands
  async function execRedisCommand(commandArray: any[]) {
    const response = await fetch(kvUrl as string, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commandArray),
    });
    return await response.json();
  }

  // Helper to get current teams from Redis
  async function getCurrentTeams(): Promise<any[]> {
    try {
      const data = await execRedisCommand(['GET', 'tfut_global_teams']);
      const raw = data?.result;
      if (!raw) return [];
      let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch (_e) {}
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (_e) {
      return [];
    }
  }

  try {
    if (req.method === 'GET') {
      const teams = await getCurrentTeams();
      return res.status(200).json({
        success: true,
        configured: true,
        teams,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { teams, team, action, teamId, overwrite } = body || {};

      let currentTeams = await getCurrentTeams();
      let updatedTeams: any[] = [];

      if (action === 'delete' && teamId) {
        // Delete a specific team
        updatedTeams = currentTeams.filter((t: any) => t.id !== teamId);
      } else if (team && team.id) {
        // Upsert single team
        const idx = currentTeams.findIndex((t: any) => t.id === team.id);
        if (idx >= 0) {
          currentTeams[idx] = team;
        } else {
          currentTeams = [team, ...currentTeams];
        }
        updatedTeams = currentTeams;
      } else if (Array.isArray(teams)) {
        if (overwrite) {
          updatedTeams = teams;
        } else {
          // Merge by ID to prevent race conditions or partial overwrites
          const map = new Map<string, any>();
          teams.forEach((t: any) => {
            if (t && t.id) map.set(t.id, t);
          });
          currentTeams.forEach((t: any) => {
            if (t && t.id && !map.has(t.id)) map.set(t.id, t);
          });
          updatedTeams = Array.from(map.values());
        }
      } else {
        return res.status(400).json({ error: 'Debes proporcionar team o teams' });
      }

      // Save to Upstash Redis using atomic SET command
      await execRedisCommand(['SET', 'tfut_global_teams', JSON.stringify(updatedTeams)]);

      return res.status(200).json({
        success: true,
        configured: true,
        teams: updatedTeams,
        count: updatedTeams.length,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
