import type { NewTodo, Todo, TodoPatch } from '../types';
import { formatDateHeading, formatMinutes } from '../lib/format';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';
import styles from './TodoPanel.module.css';

interface Props {
  dateKey: string;
  todos: Todo[];
  undated: Todo[];
  loading: boolean;
  onAdd: (input: NewTodo) => void;
  onUpdate: (id: string, patch: TodoPatch) => void;
  onRemove: (id: string) => void;
}

export function TodoPanel({ dateKey, todos, undated, loading, onAdd, onUpdate, onRemove }: Props) {
  const remaining = todos
    .filter((t) => !t.completed && t.estimated_minutes !== null)
    .reduce((sum, t) => sum + (t.estimated_minutes ?? 0), 0);

  return (
    <section className={styles.panel} aria-label="선택한 날짜의 Todo">
      <header className={styles.heading}>
        <h2 className={styles.date}>{formatDateHeading(dateKey)}</h2>
        {remaining > 0 && (
          <span className={styles.remaining}>남은 예상 시간 {formatMinutes(remaining)}</span>
        )}
      </header>

      {todos.length === 0 ? (
        <p className={styles.empty}>{loading ? '불러오는 중…' : '이 날의 Todo 가 없습니다.'}</p>
      ) : (
        <ul className={styles.list}>
          {todos.map((t) => (
            <TodoItem key={t.id} todo={t} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </ul>
      )}

      <TodoForm dueDate={dateKey} onAdd={onAdd} />

      <hr className={styles.divider} />

      <h3 className={styles.sub}>날짜 미정 ({undated.length})</h3>
      {undated.length > 0 && (
        <ul className={styles.list}>
          {undated.map((t) => (
            <TodoItem key={t.id} todo={t} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </ul>
      )}
      <TodoForm dueDate={null} onAdd={onAdd} />
    </section>
  );
}
