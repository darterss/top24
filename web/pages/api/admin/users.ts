import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
  const data = await fetch(backend + '/users').then((r) => r.json());
  res.status(200).json(data);
}


