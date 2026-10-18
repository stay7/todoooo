import type { NewTodo, Todo, TodoPatch } from '../types';
import { byCreatedAt, type TodoRepository } from './repository';

/**
 * Supabase 환경변수가 없을 때 쓰는 개발용 저장소.
 * 이 브라우저의 localStorage 에만 저장된다.
 */
const STORAGE_KEY = 'todooo.todos';

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Todo[]) : [];
  } catch {
    return [];
  }
}

function save(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function createLocalRepository(): TodoRepository {
  return {
    async verifyOwner() {
      return true;
    },

    async listRange(from, to) {
      return load()
        .filter((t) => t.due_date !== null && t.due_date >= from && t.due_date <= to)
        .sort(byCreatedAt);
    },

    async listUndated() {
      return load()
        .filter((t) => t.due_date === null)
        .sort(byCreatedAt);
    },

    async create(input: NewTodo) {
      const now = new Date().toISOString();
      const todo: Todo = {
        id: crypto.randomUUID(),
        ...input,
        completed: false,
        completed_at: null,
        created_at: now,
        updated_at: now,
      };
      save([...load(), todo]);
      return todo;
    },

    async update(id, patch: TodoPatch) {
      const all = load();
      const index = all.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Todo 를 찾을 수 없습니다.');
      const now = new Date().toISOString();
      const before = all[index];
      const next: Todo = {
        ...before,
        ...patch,
        completed_at:
          patch.completed === undefined ? before.completed_at : patch.completed ? now : null,
        updated_at: now,
      };
      all[index] = next;
      save(all);
      return next;
    },

    async remove(id) {
      save(load().filter((t) => t.id !== id));
    },
  };
}
