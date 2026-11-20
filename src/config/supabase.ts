import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey: string | undefined = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[LogiTrack::ConfigError] Faltan las variables de entorno obligatorias VITE_SUPABASE_URL o VITE_SUPABASE_KEY.'
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl.trim(),
  supabaseKey.trim(),
  {
    auth: {
      persistSession: false
    }
  }
);
