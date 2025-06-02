import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://nlpsdunljhgwkbejpdns.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scHNkdW5samhnd2tiZWpwZG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODcyMzksImV4cCI6MjA2Mzk2MzIzOX0.madhAZHSTAdbuirWvegLZEQdoKRFVqddX4aBlffw6dM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);