import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing supabase config");
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  console.log("Checking profiles...");
  const { data, error } = await supabase.from('profiles').select('*');
  console.log("Error:", error);
  console.log("Profiles:", JSON.stringify(data, null, 2));
}

check();
