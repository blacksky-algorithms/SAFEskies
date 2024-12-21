import {
  createClient,
  SupabaseClient as SupabaseClientType,
} from '@supabase/supabase-js';

class SupabaseClientSingleton {
  private static instance: SupabaseClientType;

  private constructor() {}

  public static getInstance(): SupabaseClientType {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    return SupabaseClientSingleton.instance;
  }
}

export const SupabaseInstance = SupabaseClientSingleton.getInstance();
