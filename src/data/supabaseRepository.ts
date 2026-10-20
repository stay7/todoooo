import { createClient } from '@supabase/supabase-js';
import type { Todo } from '../types';
import type { TodoRepository } from './repository';

/**
 * Supabase (PostgreSQL) 저장소.
 * 로그인이 없는 공개 모드라서 publishable 키만으로 읽고 쓴다.
 */
export function createSupabaseRepository(url: string, anonKey: string): TodoRepository {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const todos = () => client.from('todos');

  return {
    async listRange(from, to) {
      const { data, error } = await todos()
        .select('*')
        .gte('due_date', from)
        .lte('due_date', to)
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return data as Todo[];
    },

    async listUndated() {
      const { data, error } = await todos()
        .select('*')
        .is('due_date', null)
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return data as Todo[];
    },

    async create(input) {
      const { data, error } = await todos().insert(input).select().single();
      if (error) throw new Error(error.message);
      return data as Todo;
    },

    async update(id, patch) {
      const now = new Date().toISOString();
      const row: Record<string, unknown> = { ...patch, updated_at: now };
      if (patch.completed !== undefined) row.completed_at = patch.completed ? now : null;
      const { data, error } = await todos().update(row).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data as Todo;
    },

    async remove(id) {
      const { error } = await todos().delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}
