import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { ideaId } = req.query as { ideaId: string };
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:3001/api';

  try {
    const upstream = await fetch(`${backend}/ai/review/${ideaId}`, { method: 'POST' });
    const data = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Bad Gateway' });
  }
}


