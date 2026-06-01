import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    // 1. Hitung Total Penawaran
    const { count: quoteCount, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .select('*', { count: 'exact', head: true });

    // 2. Hitung Invoice Aktif (Belum Dibayar & Jatuh Tempo)
    const { count: activeInvCount, error: activeInvError } = await supabaseAdmin
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Belum Dibayar', 'Jatuh Tempo']);

    // 3. Hitung Invoice Lunas
    const { count: paidInvCount, error: paidInvError } = await supabaseAdmin
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Lunas');

    // 4. Hitung Omzet (Sum dari items di Invoice Lunas)
    // Karena items disimpan sebagai JSONB, kita ambil datanya dan hitung di server
    const { data: paidInvoices, error: omzetError } = await supabaseAdmin
      .from('invoices')
      .select('items, discount, tax')
      .eq('status', 'Lunas');

    if (quoteError || activeInvError || paidInvError || omzetError) throw new Error('Gagal mengambil data');

    const totalOmzet = paidInvoices?.reduce((acc, inv) => {
      const subtotal = inv.items.reduce((sum: number, item: any) => sum + (item.qty * item.harga), 0);
      const afterDisc = subtotal - (subtotal * (inv.discount / 100));
      const afterTax = afterDisc + (afterDisc * (inv.tax / 100));
      return acc + afterTax;
    }, 0) || 0;

    return res.status(200).json({
      totalQuotes: quoteCount || 0,
      activeInvoices: activeInvCount || 0,
      paidInvoices: paidInvCount || 0,
      revenue: totalOmzet
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}