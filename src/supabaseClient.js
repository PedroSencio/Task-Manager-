import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uqenmhdulqoavrvmyzim.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxZW5taGR1bHFvYXZydm15emltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTAyNDYsImV4cCI6MjA2OTIyNjI0Nn0.khv-wHqAsTJBMuFE5WUGEKrU-bDIMyM6UFBguLHNstU';


export const supabase = createClient(supabaseUrl, supabaseKey);