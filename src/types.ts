export interface Todo {
  id: string;
  title: string;
  description: string | null;
  estimated_minutes: number | null;
  /** YYYY-MM-DD. null 이면 "날짜 미정" */
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NewTodo = Pick<Todo, 'title' | 'description' | 'estimated_minutes' | 'due_date'>;

export type TodoPatch = Partial<
  Pick<Todo, 'title' | 'description' | 'estimated_minutes' | 'due_date' | 'completed'>
>;

export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 200;
