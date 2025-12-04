const { createClient } = require('@supabase/supabase-js');

const supabasePublic = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = { supabase: supabasePublic };