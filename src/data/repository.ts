import type { NewTodo, Todo, TodoPatch } from '../types';

export interface TodoRepository {
  /** due_date 가 from~to (포함) 인 Todo. created_at 오름차순 */
  listRange(from: string, to: string): Promise<Todo[]>;
  /** due_date 가 null 인 Todo. created_at 오름차순 */
  listUndated(): Promise<Todo[]>;
  create(input: NewTodo): Promise<Todo>;
  update(id: string, patch: TodoPatch): Promise<Todo>;
  remove(id: string): Promise<void>;
}

export const byCreatedAt = (a: Todo, b: Todo) => a.created_at.localeCompare(b.created_at);
