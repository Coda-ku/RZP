import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client untuk penggunaan di sisi Frontend (Client Component)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);