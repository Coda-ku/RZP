import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getLocal, saveLocal, queueOfflineMutation } from './lib/offlineSync';

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  category: string;
  description: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', unit: 'pcs', category: 'Cetak', description: '' });
  const router = useRouter();

  useEffect(() => {
    const cached = getLocal('products');
    if (cached) setProducts(cached);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
        saveLocal('products', data);
      }
    } catch (err) {
      console.warn("Sedang offline, menampilkan data cache.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const updatedProducts = products.filter(p => p.id !== id);
        setProducts(updatedProducts);
        saveLocal('products', updatedProducts);
      } else {
        alert('Gagal menghapus produk dari server.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi atau server sedang offline.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!navigator.onLine) {
      queueOfflineMutation('products', formData);
      alert('Internet tidak ada. Data disimpan secara lokal dan akan dikirim saat online.');
      setShowModal(false);
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', price: '', unit: 'pcs', category: 'Cetak', description: '' });
        fetchProducts();
      }
    } catch (err) {
      queueOfflineMutation('products', formData);
      alert('Koneksi gagal. Data masuk antrean sinkronisasi.');
      setShowModal(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0C', color: '#F5F5F5', fontFamily: 'sans-serif', padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>PRODUK & LAYANAN</h1>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#6A6A6A', cursor: 'pointer', padding: 0 }}>← Kembali ke Dashboard</button>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: '10px 20px', background: '#CC1414', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          + TAMBAH PRODUK
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#6A6A6A' }}>Memuat data produk...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {products.map((p) => (
            <div key={p.id} style={{ background: '#161618', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <span style={{ fontSize: '10px', background: '#3A1010', color: '#FF3333', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{p.category}</span>
              <h3 style={{ margin: '10px 0 5px 0', fontSize: '18px' }}>{p.name}</h3>
              <p style={{ fontSize: '12px', color: '#6A6A6A', marginBottom: '15px', height: '36px', overflow: 'hidden' }}>{p.description || 'Tidak ada deskripsi'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatCurrency(p.price)} <span style={{ fontSize: '12px', color: '#6A6A6A' }}>/ {p.unit}</span></div>
                <button 
                  onClick={() => handleDelete(p.id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#EF4444', 
                    cursor: 'pointer', 
                    fontSize: '11px', 
                    fontWeight: 'bold' 
                  }}
                >
                  HAPUS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <form onSubmit={handleSubmit} style={{ background: '#161618', padding: '30px', borderRadius: '8px', width: '400px', border: '1px solid #333' }}>
            <h2 style={{ marginBottom: '20px' }}>Tambah Produk Baru</h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>NAMA PRODUK</label>
              <input type="text" required style={inputStyle} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>HARGA (RP)</label>
                <input type="number" required style={inputStyle} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>SATUAN</label>
                <input type="text" required style={inputStyle} value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>KATEGORI</label>
              <select style={inputStyle} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option>Cetak</option>
                <option>Desain</option>
                <option>Pemasangan</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>BATAL</button>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#CC1414', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>SIMPAN</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '10px', color: '#6A6A6A', marginBottom: '5px', fontWeight: 'bold' as const };
const inputStyle = { width: '100%', padding: '10px', background: '#1E1E21', border: '1px solid #333', color: '#fff', borderRadius: '4px', outline: 'none' };