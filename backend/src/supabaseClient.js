const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Inicialização do cliente Supabase com Service Key (Modo Admin/Bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;