const { createClient } = require('@supabase/supabase-js');

// Puxa as credenciais do .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // <- A nova chave

// ---
// A CORREÇÃO:
// Inicializa o cliente Supabase com a Service Key (modo admin).
// Isto ignora todas as políticas de Row Level Security (RLS)
// ---
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;