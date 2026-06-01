import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email, password, full_name } = req.body;

  // Register user di Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name }
  });

  if (error) return res.status(400).json({ error: error.message });

  // Opsional: Buat entry di tabel profiles jika Anda memilikinya
  if (data.user) {
    await supabaseAdmin
      .from('profiles')
      .insert([{ 
        id: data.user.id, 
        role: 'user', // Set default role saat registrasi
        full_name, 
        updated_at: new Date() 
      }]);
  }

  return res.status(200).json({ user: data.user });
}