// db/publicDb.js
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

export async function signOut() {
  const { error } =
    await publicSupabaseClient.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
}

export async function getUserSession() {
  const { data, error } =
    await publicSupabaseClient.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
  }
  return data.session;
}

export async function signInWithEmail(email, password) {
  const { data, error } =
    await publicSupabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

  return { data, error };
}

export async function getUserData(userId) {
  const { data, error } = await publicSupabaseClient
    .from('users')
    .select('profile_image')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user data:', error);
  }
  return data;
}
