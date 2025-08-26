import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdbgrhvcduaxabvbwxui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYmdyaHZjZHVheGFidmJ3eHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTUzMDIsImV4cCI6MjA3MTE3MTMwMn0.ueKR3IWs5-gJiXHoZ3Yjb4CHNYTOAVkci2PKYsvfCFs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);