import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('⚠ Variables de Supabase no configuradas. Los datos se guardarán solo en el navegador.');
}

export const supabase = url && key ? createClient(url, key) : null;
