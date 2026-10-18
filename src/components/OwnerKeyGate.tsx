import { useState, type FormEvent } from 'react';
import styles from './OwnerKeyGate.module.css';

interface Props {
  message?: string | null;
  onSubmit: (key: string) => void;
}

export function OwnerKeyGate({ message, onSubmit }: Props) {
  const [value, setValue] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const key = value.trim();
    if (key) onSubmit(key);
  };

  return (
    <main className={styles.wrap}>
      <form className={styles.card} onSubmit={submit}>
        <h1 className={styles.title}>Todooo</h1>
        <p className={styles.desc}>
          비밀 문구를 입력하면 이 브라우저에 저장되고, 이후 모든 요청에 함께 보내집니다.
          Supabase 에 등록한 문구와 일치할 때만 데이터를 읽고 쓸 수 있습니다.
        </p>
        {message && <p className={styles.error}>{message}</p>}
        <input
          className={styles.input}
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="비밀 문구"
          autoFocus
          autoComplete="current-password"
        />
        <button type="submit" className={styles.button} disabled={!value.trim()}>
          저장하고 시작
        </button>
      </form>
    </main>
  );
}
