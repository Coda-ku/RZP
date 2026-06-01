import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { syncOfflineData } from '../lib/offlineSync';

interface Props {
  children: React.ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: Props) {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    syncOfflineData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile) setRole(profile.role);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', group: 'Utama' },
    { label: 'Penawaran', path: '/penawaran', group: 'Utama' },
    { label: 'Invoice', path: '/invoice', group: 'Utama' },
    { label: 'Produk & Layanan', path: '/products', group: 'Master Data' },
    { label: 'Klien', path: '/clients', group: 'Master Data' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0C0C0C', color: '#F5F5F5', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '240px', background: '#161618', borderRight: '1px solid #333', padding: '30px 20px', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#CC1414', margin: 0 }}>RZP</h2>
          <span style={{ fontSize: '10px', color: '#6A6A6A' }}>RADAR ZETDI PRATAMA</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {navItems.map((item, i) => (
            <React.Fragment key={item.path}>
              { (i === 0 || navItems[i-1].group !== item.group) && (
                <div style={{ fontSize: '10px', color: '#6A6A6A', padding: '15px 12px 5px', fontWeight: 'bold' }}>{item.group}</div>
              )}
              <div 
                style={{ padding: '12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', background: router.pathname === item.path ? '#CC1414' : 'transparent', color: router.pathname === item.path ? '#fff' : '#ABABAB' }}
                onClick={() => router.push(item.path)}
              >
                {item.label}
              </div>
            </React.Fragment>
          ))}
          {role === 'admin' && (
            <>
              <div style={{ fontSize: '10px', color: '#6A6A6A', padding: '15px 12px 5px', fontWeight: 'bold' }}>SISTEM</div>
              <div style={{ padding: '12px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', color: '#ABABAB' }} onClick={() => router.push('/setting')}>Pengaturan</div>
            </>
          )}
          <div style={{ marginTop: 'auto', padding: '12px', color: '#EF4444', cursor: 'pointer', fontSize: '14px' }} onClick={handleLogout}>Keluar</div>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>{title}</h1>
        {children}
      </main>
    </div>
  );
}