import { useCallback, useEffect, useRef, useState } from 'react';
import type { NewTodo, Todo, TodoPatch } from '../types';
import { byCreatedAt, type TodoRepository } from '../data/repository';

export interface DateRange {
  from: string;
  to: string;
}

export const isTempId = (id: string) => id.startsWith('temp-');

/**
 * 화면에 보이는 날짜 범위의 Todo + 날짜 미정 Todo 를 들고 있는다.
 * 모든 변경은 화면에 먼저 반영하고(낙관적 업데이트), 실패하면 되돌린 뒤 onError 를 부른다.
 */
export function useTodos(
  repo: TodoRepository,
  range: DateRange,
  onError: (message: string, error: unknown) => void,
) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const todosRef = useRef(todos);
  todosRef.current = todos;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const requestId = useRef(0);

  const inScope = useCallback(
    (t: Todo) => t.due_date === null || (t.due_date >= range.from && t.due_date <= range.to),
    [range.from, range.to],
  );

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const [dated, undated] = await Promise.all([
        repo.listRange(range.from, range.to),
        repo.listUndated(),
      ]);
      if (id !== requestId.current) return;
      setTodos([...dated, ...undated].sort(byCreatedAt));
    } catch (error) {
      if (id === requestId.current) onErrorRef.current('불러오지 못했습니다', error);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [repo, range.from, range.to]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addTodo = useCallback(
    async (input: NewTodo) => {
      const tempId = `temp-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const optimistic: Todo = {
        id: tempId,
        ...input,
        completed: false,
        completed_at: null,
        created_at: now,
        updated_at: now,
      };
      setTodos((prev) => [...prev, optimistic]);
      try {
        const saved = await repo.create(input);
        setTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
      } catch (error) {
        setTodos((prev) => prev.filter((t) => t.id !== tempId));
        onErrorRef.current('추가하지 못했습니다', error);
      }
    },
    [repo],
  );

  const updateTodo = useCallback(
    async (id: string, patch: TodoPatch) => {
      const before = todosRef.current.find((t) => t.id === id);
      if (!before || isTempId(id)) return;
      const now = new Date().toISOString();
      const optimistic: Todo = {
        ...before,
        ...patch,
        completed_at:
          patch.completed === undefined ? before.completed_at : patch.completed ? now : null,
        updated_at: now,
      };
      // 날짜가 보이는 범위 밖으로 바뀌면 목록에서 빠진다
      setTodos((prev) => prev.map((t) => (t.id === id ? optimistic : t)).filter(inScope));
      try {
        const saved = await repo.update(id, patch);
        setTodos((prev) => prev.map((t) => (t.id === id ? saved : t)).filter(inScope));
      } catch (error) {
        setTodos((prev) => {
          const without = prev.filter((t) => t.id !== id);
          return inScope(before) ? [...without, before].sort(byCreatedAt) : without;
        });
        onErrorRef.current('저장하지 못했습니다', error);
      }
    },
    [repo, inScope],
  );

  const removeTodo = useCallback(
    async (id: string) => {
      const before = todosRef.current.find((t) => t.id === id);
      if (!before || isTempId(id)) return;
      setTodos((prev) => prev.filter((t) => t.id !== id));
      try {
        await repo.remove(id);
      } catch (error) {
        setTodos((prev) => [...prev, before].sort(byCreatedAt));
        onErrorRef.current('삭제하지 못했습니다', error);
      }
    },
    [repo],
  );

  return { todos, loading, reload, addTodo, updateTodo, removeTodo };
}
