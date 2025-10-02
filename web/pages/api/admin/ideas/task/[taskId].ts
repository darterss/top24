import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH' && req.method !== 'POST') {
    res.setHeader('Allow', ['PATCH', 'POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { taskId } = req.query as { taskId: string };
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:3001/api';

  try {
    const upstream = await fetch(`${backend}/ideas/task/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Bad Gateway' });
  }
}


