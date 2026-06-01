import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Client Admin untuk penggunaan di sisi Server (API Routes)
 * Memiliki akses bypass RLS (Row Level Security)
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);