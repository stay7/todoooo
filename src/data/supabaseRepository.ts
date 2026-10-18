import { createClient } from '@supabase/supabase-js';
import type { Todo } from '../types';
import { OwnerKeyRejectedError, type TodoRepository } from './repository';

interface PgError {
  code?: string;
  message: string;
}

function toError(error: PgError): Error {
  // 42501: RLS 정책 위반 (insert/update 거부)
  // PGRST116: single() 을 요청했는데 행이 없음 (RLS 로 보이지 않는 행을 수정하려 할 때)
  if (error.code === '42501' || error.code === 'PGRST116') return new OwnerKeyRejectedError();
  return new Error(error.message);
}

export function createSupabaseRepository(
  url: string,
  anonKey: string,
  ownerKey: string,
): TodoRepository {
  const client = createClient(url, anonKey, {
    global: { headers: { 'x-owner-key': ownerKey } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const todos = () => client.from('todos');

  return {
    async verifyOwner() {
      const { data, error } = await client.rpc('is_owner');
      if (error) throw new Error(error.message);
      return data === true;
    },

    async listRange(from, to) {
      const { data, error } = await todos()
        .select('*')
        .gte('due_date', from)
        .lte('due_date', to)
        .order('created_at', { ascending: true });
      if (error) throw toError(error);
      return data as Todo[];
    },

    async listUndated() {
      const { data, error } = await todos()
        .select('*')
        .is('due_date', null)
        .order('created_at', { ascending: true });
      if (error) throw toError(error);
      return data as Todo[];
    },

    async create(input) {
      const { data, error } = await todos().insert(input).select().single();
      if (error) throw toError(error);
      return data as Todo;
    },

    async update(id, patch) {
      const now = new Date().toISOString();
      const row: Record<string, unknown> = { ...patch, updated_at: now };
      if (patch.completed !== undefined) row.completed_at = patch.completed ? now : null;
      const { data, error } = await todos().update(row).eq('id', id).select().single();
      if (error) throw toError(error);
      return data as Todo;
    },

    async remove(id) {
      const { error } = await todos().delete().eq('id', id);
      if (error) throw toError(error);
    },
  };
}
