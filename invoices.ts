import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const { data: invoices, error: getError } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (getError) return res.status(500).json({ error: getError.message });
      return res.status(200).json(invoices);

    case 'POST':
      // Payload: no, quote_ref, client_name, date, due_date, status, items, dll.
      const { data: newInvoice, error: postError } = await supabaseAdmin
        .from('invoices')
        .insert([req.body])
        .select();

      if (postError) return res.status(400).json({ error: postError.message });
      return res.status(201).json(newInvoice[0]);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}