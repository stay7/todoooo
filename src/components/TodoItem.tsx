import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { DESCRIPTION_MAX, TITLE_MAX, type Todo, type TodoPatch } from '../types';
import { formatMinutes, parseMinutes } from '../lib/format';
import { isTempId } from '../hooks/useTodos';
import styles from './TodoItem.module.css';

interface Props {
  todo: Todo;
  onUpdate: (id: string, patch: TodoPatch) => void;
  onRemove: (id: string) => void;
}

export function TodoItem({ todo, onUpdate, onRemove }: Props) {
  const [editing, setEditing] = useState(false);
  const pending = isTempId(todo.id);

  if (editing) {
    return (
      <li className={styles.item}>
        <EditForm
          todo={todo}
          onCancel={() => setEditing(false)}
          onSave={(patch) => {
            setEditing(false);
            if (Object.keys(patch).length > 0) onUpdate(todo.id, patch);
          }}
        />
      </li>
    );
  }

  return (
    <li className={`${styles.item} ${todo.completed ? styles.completed : ''}`} aria-busy={pending}>
      <input
        type="checkbox"
        className={styles.check}
        checked={todo.completed}
        disabled={pending}
        onChange={(e) => onUpdate(todo.id, { completed: e.target.checked })}
        aria-label={`${todo.title} 완료`}
      />
      <button
        type="button"
        className={styles.body}
        disabled={pending}
        onClick={() => setEditing(true)}
        title="클릭해서 편집"
      >
        <span className={styles.title}>{todo.title}</span>
        {todo.description && <span className={styles.desc}>{todo.description}</span>}
        {todo.estimated_minutes !== null && (
          <span className={styles.time}>{formatMinutes(todo.estimated_minutes)}</span>
        )}
      </button>
      <button
        type="button"
        className={styles.delete}
        disabled={pending}
        onClick={() => onRemove(todo.id)}
        aria-label={`${todo.title} 삭제`}
      >
        ×
      </button>
    </li>
  );
}

interface EditProps {
  todo: Todo;
  onSave: (patch: TodoPatch) => void;
  onCancel: () => void;
}

function EditForm({ todo, onSave, onCancel }: EditProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');
  const [minutes, setMinutes] = useState(
    todo.estimated_minutes === null ? '' : String(todo.estimated_minutes),
  );
  const [dueDate, setDueDate] = useState(todo.due_date ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const patch: TodoPatch = {};
    const nextTitle = title.trim();
    if (nextTitle && nextTitle !== todo.title) patch.title = nextTitle;
    const nextDescription = description.trim() || null;
    if (nextDescription !== todo.description) patch.description = nextDescription;
    const nextMinutes = parseMinutes(minutes);
    if (nextMinutes !== todo.estimated_minutes) patch.estimated_minutes = nextMinutes;
    const nextDue = dueDate || null;
    if (nextDue !== todo.due_date) patch.due_date = nextDue;
    onSave(patch);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <form className={styles.editForm} onSubmit={submit} onKeyDown={onKeyDown}>
      <input
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={TITLE_MAX}
        placeholder="제목"
        autoFocus
        required
      />
      <input
        className={styles.input}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={DESCRIPTION_MAX}
        placeholder="한 줄 설명 (선택)"
      />
      <div className={styles.row}>
        <input
          className={styles.input}
          type="number"
          min={1}
          step={1}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="예상 소요 시간 (분)"
          aria-label="예상 소요 시간 (분)"
        />
        <input
          className={styles.input}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="날짜 (비우면 날짜 미정)"
        />
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={onCancel}>
          취소
        </button>
        <button type="submit" className={`${styles.btn} ${styles.primary}`}>
          저장
        </button>
      </div>
    </form>
  );
}
