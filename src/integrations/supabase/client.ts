// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eokyobetjjzxyaflwhuz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva3lvYmV0amp6eHlhZmx3aHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDI0NjIsImV4cCI6MjA2NTI3ODQ2Mn0.2k_eDmACHfdtR-51mj-dYN5DGHegLIFogrPctTb1jBU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);