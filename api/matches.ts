// Vercel Serverless Function: Global Cloud Sync for Matches & Fixture
// Uses Vercel KV (Upstash) if configured, or returns fallback

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
      message: 'Vercel KV no configurado. Usando almacenamiento local.',
    });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${kvUrl}/get/tfut_global_matches`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const data = await response.json();
      const raw = data?.result;
      const matches = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
      return res.status(200).json({
        success: true,
        configured: true,
        matches: Array.isArray(matches) ? matches : [],
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { matches } = body || {};
      if (!Array.isArray(matches)) {
        return res.status(400).json({ error: 'matches must be an array' });
      }

      await fetch(`${kvUrl}/set/tfut_global_matches`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(matches)),
      });

      return res.status(200).json({
        success: true,
        configured: true,
        count: matches.length,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
