import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import AppLayout from '../../components/AppLayout';
import { LineItem, DocumentBase } from '../../lib/types';
import { formatCurrency, calculateDocumentTotal, calculateRowSubtotal } from '../../lib/utils';
import { getLocal, saveLocal, queueOfflineMutation, updateLocalCache } from '../../lib/offlineSync';
import imageCompression from 'browser-image-compression';

export default function NewQuotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  // Form States
  const [form, setForm] = useState<Partial<DocumentBase>>({
    type: 'Advertising',
    client_name: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    discount: 0,
    tax: 11,
    items: [{ nama: '', p: 0, l: 0, t: 0, qty: 1, harga: 0 }],
    attachments: []
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load Master Data (Prioritas Cache untuk Offline)
    const cachedProducts = getLocal('products');
    const cachedClients = getLocal('clients');
    if (cachedProducts) setProducts(cachedProducts);
    if (cachedClients) setClients(cachedClients);

    const fetchData = async () => {
      const { data: p } = await supabase.from('products').select('*');
      const { data: c } = await supabase.from('clients').select('name');
      if (p) { setProducts(p); saveLocal('products', p); }
      if (c) { setClients(c); saveLocal('clients', c); }
    };
    fetchData();
  }, []);

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...(form.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill harga jika memilih produk dari database
    if (field === 'nama') {
      const prod = products.find(p => p.name === value);
      if (prod) {
        newItems[index].harga = prod.price;
        newItems[index].unit = prod.unit;
      }
    }
    setForm({ ...form, items: newItems });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const options = { maxSizeMB: 0.1, maxWidthOrHeight: 1024, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      
      reader.onload = async () => {
        const localDataUrl = reader.result as string;
        // Tambahkan ke lampiran (Simpan Base64 untuk akses Offline segera)
        setForm(prev => ({ ...prev, attachments: [...(prev.attachments || []), localDataUrl] }));
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error("Compression error:", err);
    } finally {
      setUploading(false);
    }
  };

  const { subtotal, discVal, taxVal, total } = calculateDocumentTotal(
    form.items || [], 
    form.discount || 0, 
    form.tax || 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const no = `PNW/RZP/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = { ...form, no } as DocumentBase;

    // Jalankan Logic Offline-First
    updateLocalCache('quotes', payload);

    if (!navigator.onLine) {
      queueOfflineMutation('quotes', payload);
      alert('Internet offline. Penawaran tersimpan di memori lokal tim Anda.');
      router.push('/dashboard');
    } else {
      try {
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) router.push('/dashboard');
      } catch (err) {
        queueOfflineMutation('quotes', payload);
        alert('Koneksi gagal. Data akan dikirim otomatis saat online.');
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <AppLayout title="Buat Penawaran Baru">
      <form onSubmit={handleSubmit} style={formBoxStyle}>
        <div style={gridStyle}>
          <div className="fg">
            <label style={labelStyle}>KLIEN</label>
            <select required style={inputStyle} value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})}>
              <option value="">Pilih Klien...</option>
              {clients.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="fg">
            <label style={labelStyle}>TIPE</label>
            <select style={inputStyle} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>Advertising</option>
              <option>Individual</option>
              <option>Proyek Bangunan</option>
            </select>
          </div>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>ITEM</th>
              {form.type === 'Advertising' && <th style={{ width: '10%' }}>P x L</th>}
              <th style={{ width: '10%' }}>QTY</th>
              <th style={{ width: '20%' }}>HARGA</th>
              <th style={{ width: '20%' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {(form.items || []).map((item, idx) => (
              <tr key={idx}>
                <td>
                  <input list="prods" style={inputStyle} value={item.nama} onChange={e => updateItem(idx, 'nama', e.target.value)} />
                  <datalist id="prods">{products.map(p => <option key={p.id} value={p.name} />)}</datalist>
                </td>
                {form.type === 'Advertising' && (
                  <td style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" style={inputStyle} placeholder="P" value={item.p} onChange={e => updateItem(idx, 'p', parseFloat(e.target.value))} />
                    <input type="number" style={inputStyle} placeholder="L" value={item.l} onChange={e => updateItem(idx, 'l', parseFloat(e.target.value))} />
                  </td>
                )}
                <td><input type="number" style={inputStyle} value={item.qty} onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value))} /></td>
                <td><input type="number" style={inputStyle} value={item.harga} onChange={e => updateItem(idx, 'harga', parseFloat(e.target.value))} /></td>
                <td style={{ fontWeight: 'bold' }}>{formatCurrency(calculateRowSubtotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={summaryBoxStyle}>
          <div style={summaryRow}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div style={summaryRow}>
            <span>Diskon (%)</span>
            <input type="number" style={inlineInput} value={form.discount} onChange={e => setForm({...form, discount: parseFloat(e.target.value)})} />
          </div>
          <div style={{ ...summaryRow, borderTop: '2px solid #CC1414', paddingTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>
            <span>TOTAL</span><span style={{ color: '#FF3333' }}>{formatCurrency(total)}</span>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={labelStyle}>LAMPIRAN RENCANA KERJA</label>
          <input type="file" onChange={handleFileUpload} disabled={uploading} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {(form.attachments || []).map((url, idx) => (
              <img key={idx} src={url} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} style={saveBtnStyle}>
          {loading ? 'MENYIMPAN...' : 'SIMPAN PENAWARAN (OFFLINE READY)'}
        </button>
      </form>
    </AppLayout>
  );
}

// Styles
const formBoxStyle = { background: '#161618', padding: '30px', borderRadius: '8px', border: '1px solid #333' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' };
const labelStyle = { display: 'block', fontSize: '10px', color: '#6A6A6A', marginBottom: '5px', fontWeight: 'bold' as const };
const inputStyle = { width: '100%', padding: '10px', background: '#1E1E21', border: '1px solid #333', color: '#fff', borderRadius: '4px', outline: 'none' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' as const, marginBottom: '20px' };
const summaryBoxStyle = { marginLeft: 'auto', width: '300px', borderTop: '1px solid #333', paddingTop: '20px' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' };
const inlineInput = { width: '60px', background: 'transparent', border: '1px solid #333', color: '#fff', padding: '2px 5px', marginLeft: '10px' };
const saveBtnStyle = { width: '100%', padding: '15px', background: '#CC1414', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' as const, cursor: 'pointer', marginTop: '30px' };