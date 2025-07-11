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

import flattenedCreatiorData from '@/app/projects/smaskaligt/functions';

export default publicSupabaseClient;

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

export async function getAllUsers(authId) {
  const { data, error } = await publicSupabaseClient
    .from('users')
    .select(`user_id, user_name, profile_image`)
    .neq('user_id', authId);
  if (error) return { error: error.message };
  return { data };
}

export async function userNames(my_id, buddy_id) {
  if (my_id && !buddy_id) {
    const { data, error } = await publicSupabaseClient
      .from('users')
      .select('user_name, user_id')
      .eq('user_id', my_id);
    if (error) return { error: error.message };

    console.log('Single name fetch :', data);
    return { data };
  }

  const { data, error } = await publicSupabaseClient
    .from('users')
    .select('user_name, user_id')
    .in('user_id', [my_id, buddy_id]);
  if (error) return { error: error.message };

  console.log('Double user name fetch:', data);
  return { data };
}

export async function userOnline(my_id, state) {
  const { data, error } = await publicSupabaseClient
    .from('users')
    .update({ online: state })
    .eq('user_id', my_id);
  if (error) return { error: error.message };
  return { data };
}

export async function getUserData(userId) {
  const { data, error } = await publicSupabaseClient
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { data: null, error };
  if (!data) {
    const { data: newData, error: newError } =
      await publicSupabaseClient
        .from('users')
        .insert({ user_id: userId })
        .select('*')
        .single();
    return { data: newData, error: newError };
  }
  return { data, error: null };
}

export async function createUserData(userId) {
  const { data, error } = await publicSupabaseClient
    .from('users')
    .insert({ user_id: userId })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating user data:', error);
  }

  return { data, error };
}

export async function getUserStats(userId) {
  const { data, error } = await publicSupabaseClient
    .from('user_stats')
    .select('user_level')
    .eq('user_id', userId)
    .single();
  return { data, error };
}

export async function createUserStats(userId) {
  return await publicSupabaseClient
    .from('user_stats')
    .insert({ user_id: userId, user_level: 0 })
    .select('user_level')
    .single();
}

export async function getFilterOptions(table) {
  const ALLOWED = [
    'smsk_categories',
    'smsk_styles',
    'smsk_materials',
    'smsk_features',
  ];
  if (!ALLOWED.includes(table)) {
    throw new Error(`Ogiltig dropdown-tabell: ${table}`);
  }

  const { data, error } = await publicSupabaseClient
    .from(table)
    .select('*');

  if (error) {
    console.error(
      `Error fetching dropdown for ${table}:`,
      error
    );
    return { data: null, error };
  }

  return { data, error };
}

export async function getCreators(filters) {
  const { data, error } = await publicSupabaseClient
    .from('smsk_creators')
    .select(
      `*, 
    smsk_creator_categories!inner(
      category_id,
      smsk_categories(name)
    ),
    smsk_creator_styles(style_id, smsk_styles(name)),
    smsk_creator_materials(material_id, smsk_materials(name)),
    smsk_creator_features(
      feature_id,
      smsk_features(name)
      ),
    smsk_creator_images(img_url, alt_text)`
    )
    .eq(
      'smsk_creator_categories.category_id',
      filters.category
    );
  console.log('NOT flattened data:', data);
  const flatData = flattenedCreatiorData(data);

  return { data: flatData, error };
}

export async function getProfileData(UserId) {
  const { data, error } = await publicSupabaseClient
    .from('users')
    .select(
      `*,
    user_stats(user_level)`
    )
    .eq('user_id', UserId)
    .single();
  if (error) {
    console.error('Error fetching profile data:', error);
    return { error };
  }
  return { data, error: null };
}
