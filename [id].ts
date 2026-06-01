import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userId = Array.isArray(id) ? id[0] : id;

  switch (req.method) {
    case 'GET':
      const { data: userData, error: getError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (getError) return res.status(404).json({ error: getError.message });
      return res.status(200).json(userData);

    case 'PUT':
      const { data: updatedData, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(req.body)
        .eq('id', userId)
        .select();
      if (updateError) return res.status(400).json({ error: updateError.message });
      return res.status(200).json(updatedData);

    case 'DELETE':
      // Hapus dari Auth dan Tabel Profile (Cascading jika diset di DB)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId!);
      if (authError) return res.status(400).json({ error: authError.message });
      
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);
      return res.status(200).json({ message: 'User deleted successfully' });

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}