import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { getLocal, saveLocal } from './offlineSync';
import AppLayout from '../components/AppLayout';
import { formatCurrency } from '../lib/utils';
import { DocumentBase } from '../lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<DocumentBase[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load dari cache dulu untuk kecepatan
    const cached = getLocal('stats');
    if (cached) {
      setStats(cached);
      setLoading(false);
    }

    const cachedQuotes = getLocal('quotes');
    if (cachedQuotes) setQuotes(cachedQuotes);

    fetchStats();
    fetchQuotes();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
        saveLocal('stats', data); // Perbarui cache
      }
    } catch (err) {
      console.error('Failed to fetch stats');
      calculateLocalStats();
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    const { data } = await supabase.from('quotes').select('no, client_name, attachments').order('created_at', { ascending: false });
    if (data) {
      setQuotes(data);
      saveLocal('quotes', data);
    }
  };

  const calculateLocalStats = () => {
    const localPnw = getLocal('quotes') || [];
    const localInv = getLocal('invoices') || [];
    
    setQuotes(localPnw);

    const activeInvoices = localInv.filter((i: any) => ['Belum Dibayar', 'Jatuh Tempo'].includes(i.status)).length;
    const paidInvoices = localInv.filter((i: any) => i.status === 'Lunas');
    
    const revenue = paidInvoices.reduce((acc: number, inv: any) => {
      const subtotal = inv.items.reduce((sum: number, item: any) => sum + (item.qty * item.harga), 0);
      const afterDisc = subtotal - (subtotal * ((inv.discount || 0) / 100));
      const afterTax = afterDisc + (afterDisc * ((inv.tax || 11) / 100));
      return acc + afterTax;
    }, 0);

    setStats({
      totalQuotes: localPnw.length,
      activeInvoices,
      paidInvoices: paidInvoices.length,
      revenue
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Memuat Dashboard...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0C0C0C', color: '#F5F5F5', fontFamily: 'sans-serif' }}>
      {/* Sidebar Navigation */}
      <aside style={sidebarStyle}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#CC1414', margin: 0, letterSpacing: '2px' }}>RZP</h2>
          <span style={{ fontSize: '10px', color: '#6A6A6A' }}>RADAR ZETDI PRATAMA</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ ...navItemStyle, background: '#CC1414', color: '#fff' }} onClick={() => router.push('/dashboard')}>Dashboard</div>
          <div style={navItemStyle} onClick={() => router.push('/penawaran')}>Penawaran</div>
          <div style={navItemStyle} onClick={() => router.push('/invoice')}>Invoice</div>
          <div style={{ height: '20px' }} />
          <div style={{ fontSize: '10px', color: '#6A6A6A', padding: '0 12px 5px', fontWeight: 'bold' }}>MASTER DATA</div>
          <div style={navItemStyle} onClick={() => router.push('/products')}>Produk & Layanan</div>
          <div style={navItemStyle} onClick={() => router.push('/clients')}>Klien</div>
          <div style={{ height: '20px' }} />
          {role === 'admin' && (
            <>
              <div style={{ fontSize: '10px', color: '#6A6A6A', padding: '0 12px 5px', fontWeight: 'bold' }}>SISTEM</div>
              <div style={navItemStyle} onClick={() => router.push('/setting')}>Pengaturan</div>
            </>
          )}
          <div style={{ ...navItemStyle, marginTop: 'auto', color: '#EF4444' }} onClick={handleLogout}>Keluar</div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>DASHBOARD UTAMA</h1>
            <p style={{ color: '#6A6A6A', fontSize: '14px' }}>Selamat datang kembali di sistem RZP</p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {/* Card Total Penawaran */}
          <div style={cardStyle}>
            <label style={labelStyle}>TOTAL PENAWARAN</label>
            <div style={valueStyle}>{stats?.totalQuotes}</div>
            <div style={{ fontSize: '12px', color: '#6A6A6A', marginTop: '10px' }}>Dokumen Penawaran</div>
          </div>

          {/* Card Invoice Aktif */}
          <div style={{ ...cardStyle, borderLeft: '4px solid #CC1414' }}>
            <label style={labelStyle}>INVOICE AKTIF</label>
            <div style={{ ...valueStyle, color: '#FF3333' }}>{stats?.activeInvoices}</div>
            <div style={{ fontSize: '12px', color: '#6A6A6A', marginTop: '10px' }}>Belum Terbayar</div>
          </div>

          {/* Card Invoice Lunas */}
          <div style={cardStyle}>
            <label style={labelStyle}>INVOICE LUNAS</label>
            <div style={valueStyle}>{stats?.paidInvoices}</div>
            <div style={{ fontSize: '12px', color: '#6A6A6A', marginTop: '10px' }}>Sudah Selesai</div>
          </div>

          {/* Card Omzet */}
          <div style={{ ...cardStyle, background: '#1A1A1D', border: '1px solid #CC1414' }}>
            <label style={{ ...labelStyle, color: '#CC1414' }}>OMZET BULAN INI</label>
            <div style={{ ...valueStyle, fontSize: '20px' }}>{formatCurrency(stats?.revenue || 0)}</div>
            <div style={{ fontSize: '12px', color: '#6A6A6A', marginTop: '10px' }}>Berdasarkan Invoice Lunas</div>
          </div>
        </div>

        <div style={{ marginTop: '40px', padding: '20px', background: '#161618', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Tindakan Cepat</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={btnActionStyle} onClick={() => router.push('/penawaran/baru')}>+ Penawaran Baru</button>
            <button style={btnActionStyle} onClick={() => router.push('/invoice/baru')}>+ Invoice Baru</button>
          </div>
        </div>

        {/* Bagian Galeri Lampiran Rencana Pengerjaan */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#fff' }}>Galeri Rencana Pengerjaan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
            {quotes.flatMap(q => (q.attachments || []).map((url: string, i: number) => (
              <div key={`${q.no}-${i}`} style={{ background: '#161618', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => window.open(url, '_blank')}>
                <img src={url} style={{ width: '100%', height: '120px', objectFit: 'cover' }} alt="Rencana Kerja" />
                <div style={{ padding: '10px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', color: '#F5F5F5', marginBottom: '2px' }}>{q.no}</div>
                  <div style={{ color: '#6A6A6A' }}>{q.client_name}</div>
                </div>
              </div>
            )))}
          </div>
          {quotes.every(q => !q.attachments.length) && <div style={emptyGalleryStyle}>Belum ada lampiran.</div>}
        </div>
        </>
      )}
    </AppLayout>
  );
}

const galleryItemStyle = { background: '#161618', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' };
const emptyGalleryStyle = { color: '#6A6A6A', fontSize: '13px', padding: '20px', background: '#161618', borderRadius: '8px', border: '1px solid #333', textAlign: 'center' as const };
const cardStyle = {
  background: '#161618',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #333',
};

const labelStyle = { fontSize: '10px', fontWeight: 'bold', color: '#6A6A6A', letterSpacing: '1px' };
const valueStyle = { fontSize: '32px', fontWeight: 'bold', marginTop: '5px' };
const btnActionStyle = {
  padding: '10px 20px',
  background: '#CC1414',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer'
};