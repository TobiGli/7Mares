import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSecretKey = publicKey?.startsWith('sb_secret_') || publicKey?.includes('service_role');

export const supabaseConfigError = isSecretKey
	? 'La clave configurada es secreta. Usa la clave anon public o publishable en Render, nunca service_role.'
	: '';
export const isSupabaseConfigured = Boolean(url && publicKey && !isSecretKey);
export const supabase = isSupabaseConfigured ? createClient(url, publicKey) : null;
