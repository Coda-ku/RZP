import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from './supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const { data: clients, error: getError } = await supabaseAdmin
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (getError) return res.status(500).json({ error: getError.message });
      return res.status(200).json(clients);

    case 'POST':
      const { name, address, phone, email, notes } = req.body;
      const { data: newClient, error: postError } = await supabaseAdmin
        .from('clients')
        .insert([{ name, address, phone, email, notes }])
        .select();

      if (postError) return res.status(400).json({ error: postError.message });
      return res.status(201).json(newClient[0]);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}