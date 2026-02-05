
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jnqnkjwjwafdsvclxxzo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AIfImrkSGLM3pFzdOuGINg_uzdny4_m';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const saveSessionToSupabase = async (session) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from('sessions')
    .upsert({
      id: session.id,
      timestamp: session.timestamp,
      data: session.data,
      user_id: user.id
    });
  
  if (error) throw error;
  return data;
};

export const fetchSessionsFromSupabase = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(item => ({
    id: item.id,
    timestamp: item.timestamp,
    data: item.data,
    user_id: item.user_id
  }));
};

export const deleteSessionFromSupabase = async (id) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
};
