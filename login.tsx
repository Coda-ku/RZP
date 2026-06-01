import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  // Daftar gambar proyek advertising. Ganti URL ini dengan foto proyek asli Anda.
  const projectImages = [
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=500",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=500",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=500",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500",
    "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=500",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=500",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=500",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=500",
  ];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Carousel Logic: Menggeser susunan gambar setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projectImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [projectImages.length]);

  // Menentukan gambar mana saja yang ditampilkan berdasarkan index saat ini
  const visibleImages = projectImages.map((_, i) => 
    projectImages[(currentIndex + i) % projectImages.length]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal login');

      // Simpan token/session jika diperlukan atau Next.js Middleware akan menanganinya via cookie
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0C0C0C', color: '#F5F5F5', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      {/* CSS internal untuk efek transisi fade */}
      <style>{`
        .bg-grid-img {
          animation: fadeInImg 2s ease-in-out;
        }
        @keyframes fadeInImg {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Layer Background: Susunan Gambar Proyek */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gridTemplateRows: 'repeat(2, 1fr)', 
        gap: '4px',
        opacity: 0.2, // Dibuat transparan agar tidak mengganggu keterbacaan teks
        zIndex: 0 
      }}>
        {visibleImages.map((src, i) => (
          <img 
            key={`${src}-${currentIndex}-${i}`} 
            src={src} 
            className="bg-grid-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            alt="Advertising Project" 
          />
        ))}
      </div>

      {/* Overlay: Efek Fade Radial (Gelap di pinggir, memudar ke tengah) */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 10%, #0C0C0C 90%)', zIndex: 1 }}></div>

      <form onSubmit={handleLogin} style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '380px', padding: '30px', background: 'rgba(22, 22, 24, 0.75)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>RZP LOGIN</h2>
        
        {error && <div style={{ color: '#EF4444', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#6A6A6A' }}>EMAIL</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', background: '#1E1E21', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#6A6A6A' }}>PASSWORD</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', background: '#1E1E21', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#CC1414', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'MEMPROSES...' : 'MASUK'}
        </button>
      </form>
    </div>
  );
}