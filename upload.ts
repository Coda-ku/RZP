import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // Catatan: Di produksi, gunakan library seperti 'formidable' untuk parsing file
  // Contoh sederhana menggunakan base64 dari body
  const { fileName, fileBody, bucketName = 'uploads' } = req.body;

  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, Buffer.from(fileBody, 'base64'), {
      contentType: 'image/png', // Sesuaikan mime type
      upsert: true
    });

  if (error) return res.status(400).json({ error: error.message });

  const { data: publicUrl } = supabaseAdmin.storage.from(bucketName).getPublicUrl(fileName);

  return res.status(200).json({ path: data.path, url: publicUrl.publicUrl });
}