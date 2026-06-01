import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Pastikan session diperbarui
  const { data: { session } } = await supabase.auth.getSession();

  const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/login') || req.nextUrl.pathname.startsWith('/api/register');

  // Proteksi API Routes (Kecuali login dan register)
  if (isApiRoute && !isAuthRoute) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil role pengguna dari tabel 'profiles'
    // Menggunakan user id dari session
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Cek apakah user memiliki role 'admin'
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access only' },
        { status: 403 }
      );
    }
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};