import { useState, type FormEvent } from 'react';
import { DESCRIPTION_MAX, TITLE_MAX, type NewTodo, type Todo, type TodoPatch } from '../types';
import { formatDateHeading, parseMinutes } from '../lib/format';
import styles from './TodoSheet.module.css';

export type SheetMode = { kind: 'add'; dueDate: string | null } | { kind: 'edit'; todo: Todo };

interface Props {
  mode: SheetMode;
  onAdd: (input: NewTodo) => void;
  onUpdate: (id: string, patch: TodoPatch) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

/** 추가와 편집에 같이 쓰는 입력 폼. Sheet 안에 들어간다. */
export function TodoSheet({ mode, onAdd, onUpdate, onRemove, onClose }: Props) {
  const todo = mode.kind === 'edit' ? mode.todo : null;
  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [minutes, setMinutes] = useState(
    todo?.estimated_minutes != null ? String(todo.estimated_minutes) : '',
  );
  const [dueDate, setDueDate] = useState(
    mode.kind === 'edit' ? (mode.todo.due_date ?? '') : (mode.dueDate ?? ''),
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    const nextDescription = description.trim() || null;
    const nextMinutes = parseMinutes(minutes);
    const nextDue = dueDate || null;

    if (mode.kind === 'add') {
      onAdd({
        title: nextTitle,
        description: nextDescription,
        estimated_minutes: nextMinutes,
        due_date: nextDue,
      });
    } else {
      const patch: TodoPatch = {};
      if (nextTitle !== todo!.title) patch.title = nextTitle;
      if (nextDescription !== todo!.description) patch.description = nextDescription;
      if (nextMinutes !== todo!.estimated_minutes) patch.estimated_minutes = nextMinutes;
      if (nextDue !== todo!.due_date) patch.due_date = nextDue;
      if (Object.keys(patch).length > 0) onUpdate(todo!.id, patch);
    }
    onClose();
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        <span className={styles.label}>제목</span>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder="무엇을 할까요?"
          autoFocus
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>한 줄 설명 (선택)</span>
        <input
          className={styles.input}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          placeholder="짧게 덧붙일 말"
        />
      </label>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>예상 시간 (분, 선택)</span>
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="30"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>날짜 (비우면 날짜 미정)</span>
          <input
            className={styles.input}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
      </div>
      <p className={styles.hint}>
        {dueDate ? `${formatDateHeading(dueDate)} 에 추가됩니다` : '날짜 미정 목록에 들어갑니다'}
      </p>

      <button type="submit" className={styles.primary} disabled={!title.trim()}>
        {mode.kind === 'add' ? '추가' : '저장'}
      </button>

      {mode.kind === 'edit' &&
        (confirmDelete ? (
          <div className={styles.confirm}>
            <span>정말 삭제할까요?</span>
            <button
              type="button"
              className={styles.dangerSolid}
              onClick={() => {
                onRemove(mode.todo.id);
                onClose();
              }}
            >
              삭제
            </button>
            <button type="button" className={styles.ghost} onClick={() => setConfirmDelete(false)}>
              취소
            </button>
          </div>
        ) : (
          <button type="button" className={styles.danger} onClick={() => setConfirmDelete(true)}>
            이 Todo 삭제
          </button>
        ))}
    </form>
  );
}
