import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from './supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const { data: quotes, error: getError } = await supabaseAdmin
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (getError) return res.status(500).json({ error: getError.message });
      return res.status(200).json(quotes);

    case 'POST':
      // req.body harus berisi field sesuai schema: no, client_name, date, status, items, dll.
      const { data: newQuote, error: postError } = await supabaseAdmin
        .from('quotes')
        .insert([req.body])
        .select();

      if (postError) return res.status(400).json({ error: postError.message });
      return res.status(201).json(newQuote[0]);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}