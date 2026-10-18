import type { Todo } from '../types';
import { formatMinutes } from '../lib/format';
import { isTempId } from '../hooks/useTodos';
import styles from './TodoRow.module.css';

interface Props {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onOpen: (todo: Todo) => void;
}

/** 목록의 한 줄. 체크박스는 바로 토글, 나머지 영역을 탭하면 편집 시트가 열린다. */
export function TodoRow({ todo, onToggle, onOpen }: Props) {
  const pending = isTempId(todo.id);
  return (
    <li className={`${styles.row} ${todo.completed ? styles.completed : ''}`} aria-busy={pending}>
      <input
        type="checkbox"
        className={styles.check}
        checked={todo.completed}
        disabled={pending}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
        aria-label={`${todo.title} 완료`}
      />
      <button
        type="button"
        className={styles.body}
        disabled={pending}
        onClick={() => onOpen(todo)}
      >
        <span className={styles.main}>
          <span className={styles.title}>{todo.title}</span>
          {todo.description && <span className={styles.desc}>{todo.description}</span>}
        </span>
        {todo.estimated_minutes !== null && (
          <span className={styles.time}>{formatMinutes(todo.estimated_minutes)}</span>
        )}
      </button>
    </li>
  );
}
