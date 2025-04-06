import { createClient } from '@supabase/supabase-js';
const publicSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const publicSupabaseClient = createClient(
  publicSupabaseUrl,
  publicSupabaseKey
);

export async function signUpNewUser(
  email,
  password,
  pageUrl
) {
  const { data, error } =
    await publicSupabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: pageUrl,
      },
    });

  return { data, error };
}
