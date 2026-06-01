import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      const { data: products, error: getError } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (getError) return res.status(500).json({ error: getError.message });
      return res.status(200).json(products);

    case 'POST':
      const { name, price, description, unit, category } = req.body;
      const { data: newProduct, error: postError } = await supabaseAdmin
        .from('products')
        .insert([{ name, price, description, unit, category }])
        .select();

      if (postError) return res.status(400).json({ error: postError.message });
      return res.status(201).json(newProduct[0]);

    case 'DELETE':
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID produk diperlukan' });

      const { error: deleteError } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) return res.status(400).json({ error: deleteError.message });
      return res.status(200).json({ message: 'Produk berhasil dihapus' });

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}