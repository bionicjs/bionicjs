import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url) throw new Error("SUPABASE_URL is not set");
if (!anonKey) throw new Error("SUPABASE_ANON_KEY is not set");

export const supabase = createClient(url, anonKey);