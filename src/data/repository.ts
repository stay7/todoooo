import type { NewTodo, Todo, TodoPatch } from '../types';

/** 비밀 문구가 틀려 RLS 가 요청을 거부했을 때 */
export class OwnerKeyRejectedError extends Error {
  constructor() {
    super('비밀 문구가 올바르지 않습니다.');
    this.name = 'OwnerKeyRejectedError';
  }
}

export interface TodoRepository {
  /** 비밀 문구가 서버와 일치하는지. 로컬 모드는 항상 true */
  verifyOwner(): Promise<boolean>;
  /** due_date 가 from~to (포함) 인 Todo. created_at 오름차순 */
  listRange(from: string, to: string): Promise<Todo[]>;
  /** due_date 가 null 인 Todo. created_at 오름차순 */
  listUndated(): Promise<Todo[]>;
  create(input: NewTodo): Promise<Todo>;
  update(id: string, patch: TodoPatch): Promise<Todo>;
  remove(id: string): Promise<void>;
}

export const byCreatedAt = (a: Todo, b: Todo) => a.created_at.localeCompare(b.created_at);
