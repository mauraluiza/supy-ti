import { createClient } from '@supabase/supabase-js';

// TEMP: Hardcoding credentials to debug "Failed to fetch"
// Once confirmed working, we will revert to .env
const supabaseUrl = "https://vasibajdrlxontsnpvpw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhc2liYWpkcmx4b250c25wdnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDExNzIsImV4cCI6MjA4NjUxNzE3Mn0.zBYU92nQN2nnGK-yjuQKzQadIn3vTrTLS3ed4lKaATw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
