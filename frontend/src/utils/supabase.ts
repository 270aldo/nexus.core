import { useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import brain from 'brain';

// Create a function to get the supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = async (): Promise<SupabaseClient> => {
  // If we already have an instance, return it
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  try {
    // Fetch config from the backend
    const response = await brain.get_supabase_config();
    const { supabaseUrl, supabaseAnonKey } = await response.json();
    
    // Create and store the client
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw error;
  }
};

// Hook to use supabase in components
export const useSupabase = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const client = await getSupabaseClient();
        setSupabase(client);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    initializeSupabase();
  }, []);

  return { supabase, loading, error };
};
