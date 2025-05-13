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
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function createUserData(userId) {
  const { data, error } = await publicSupabaseClient
    .from('users')
    .insert({ id: userId })
    .select('*')
    .single();

  const { data: statsData, error: statsError } =
    await publicSupabaseClient
      .from('userStats')
      .insert({ id: userId, user_level: 0 })
      .select('user_level')
      .single();
  console.log('User stats set:', statsData);

  if (statsError) {
    console.error('Error creating user stats:', statsError);
  }
  if (error) {
    console.error('Error creating user data:', error);
  }

  return { data, error };
}

export async function getUserStats(userId) {
  const { data, error } = await publicSupabaseClient
    .from('userStats')
    .select('user_level')
    .eq('user_id', userId)
    .single();
  return { data, error };
}
