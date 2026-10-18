import { useState, type FormEvent } from 'react';
import { DESCRIPTION_MAX, TITLE_MAX, type NewTodo } from '../types';
import { parseMinutes } from '../lib/format';
import styles from './TodoForm.module.css';

interface Props {
  /** null 이면 날짜 미정 Todo 로 만든다 */
  dueDate: string | null;
  onAdd: (input: NewTodo) => void;
}

export function TodoForm({ dueDate, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minutes, setMinutes] = useState('');
  const [expanded, setExpanded] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({
      title: trimmed,
      description: description.trim() || null,
      estimated_minutes: parseMinutes(minutes),
      due_date: dueDate,
    });
    setTitle('');
    setDescription('');
    setMinutes('');
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.main}>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder={dueDate ? '새 Todo (Enter 로 추가)' : '날짜 미정 Todo (Enter 로 추가)'}
          aria-label={dueDate ? '새 Todo 제목' : '날짜 미정 Todo 제목'}
        />
        <button
          type="button"
          className={`${styles.toggle} ${expanded ? styles.toggleOn : ''}`}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          title="설명과 예상 소요 시간 입력"
        >
          자세히
        </button>
        <button type="submit" className={styles.add} disabled={!title.trim()}>
          추가
        </button>
      </div>
      {expanded && (
        <div className={styles.extra}>
          <input
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={DESCRIPTION_MAX}
            placeholder="한 줄 설명 (선택)"
            aria-label="한 줄 설명"
          />
          <input
            className={`${styles.input} ${styles.minutes}`}
            type="number"
            min={1}
            step={1}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="예상 소요 시간 (분, 선택)"
            aria-label="예상 소요 시간 (분)"
          />
        </div>
      )}
    </form>
  );
}
