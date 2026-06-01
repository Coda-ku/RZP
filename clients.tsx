import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getLocal, saveLocal, queueOfflineMutation, updateLocalCache } from './lib/offlineSync';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '', notes: '' });
  const router = useRouter();

  useEffect(() => {
    const cached = getLocal('clients');
    if (cached) setClients(cached);
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (res.ok) {
        setClients(data);
        saveLocal('clients', data);
      }
    } catch (err) {
      console.warn("Mode Offline: Menggunakan data cache klien.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simpan ke Cache Lokal dulu agar UI langsung update
    const newClient = { id: Date.now(), ...formData };
    const updated = updateLocalCache('clients', newClient);
    setClients(updated);

    if (!navigator.onLine) {
      queueOfflineMutation('clients', formData);
      alert('Disimpan secara lokal. Akan disinkronkan saat internet tersedia.');
      setShowModal(false);
      return;
    }

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchClients(); // Refresh data asli dari server
      }
    } catch (err) {
      queueOfflineMutation('clients', formData);
    }
    setShowModal(false);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0C', color: '#F5F5F5', fontFamily: 'sans-serif', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>DATABASE KLIEN</h1>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#6A6A6A', cursor: 'pointer', padding: 0 }}>← Kembali ke Dashboard</button>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Cari klien..." 
            style={{ padding: '8px 15px', background: '#161618', border: '1px solid #333', color: '#fff', borderRadius: '4px', width: '250px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button style={{ padding: '10px 20px', background: '#CC1414', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            + KLIEN BARU
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#6A6A6A' }}>Memuat data klien...</div>
      ) : (
        <div style={{ background: '#161618', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1E1E21', color: '#6A6A6A', fontSize: '12px' }}>
                <th style={thStyle}>NAMA KLIEN</th>
                <th style={thStyle}>KONTAK</th>
                <th style={thStyle}>EMAIL</th>
                <th style={thStyle}>ALAMAT</th>
                <th style={thStyle}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #272729' }}>
                  <td style={tdStyle}><strong>{c.name}</strong></td>
                  <td style={tdStyle}>{c.phone || '—'}</td>
                  <td style={tdStyle}>{c.email || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: '11px', color: '#ABABAB' }}>{c.address || '—'}</td>
                  <td style={tdStyle}>
                    <button style={btnActionStyle}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClients.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6A6A6A' }}>Klien tidak ditemukan.</div>
          )}
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '15px', fontWeight: 'bold', letterSpacing: '1px' };
const tdStyle = { padding: '15px', fontSize: '13px' };
const btnActionStyle = { background: 'none', border: '1px solid #333', color: '#60A5FA', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' };