import { createClient } from '@supabase/supabase-js';

// These will be your Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase is not configured! Missing URL or API key.');
    console.log('Please check your .env file has:');
    console.log('VITE_SUPABASE_URL=your_url');
    console.log('VITE_SUPABASE_ANON_KEY=your_key');
} else {
    console.log('✅ Supabase configured:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
