import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addMonths, startOfMonth, subMonths } from 'date-fns';
import { Calendar, visibleRange, type DayCount } from './components/Calendar';
import { OwnerKeyGate } from './components/OwnerKeyGate';
import { Toast } from './components/Toast';
import { TodoPanel } from './components/TodoPanel';
import { createLocalRepository } from './data/localRepository';
import { OwnerKeyRejectedError, type TodoRepository } from './data/repository';
import { createSupabaseRepository } from './data/supabaseRepository';
import { useTodos } from './hooks/useTodos';
import { toDateKey } from './lib/format';
import { clearOwnerKey, getOwnerKey, setOwnerKey } from './lib/ownerKey';
import styles from './App.module.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export default function App() {
  const [ownerKey, setOwnerKeyState] = useState<string | null>(() => getOwnerKey());
  const [gateMessage, setGateMessage] = useState<string | null>(null);

  const resetKey = useCallback((message: string | null) => {
    clearOwnerKey();
    setGateMessage(message);
    setOwnerKeyState(null);
  }, []);

  if (supabaseConfigured && !ownerKey) {
    return (
      <OwnerKeyGate
        message={gateMessage}
        onSubmit={(key) => {
          setOwnerKey(key);
          setGateMessage(null);
          setOwnerKeyState(key);
        }}
      />
    );
  }

  return <TodoApp key={ownerKey ?? 'local'} ownerKey={ownerKey} onResetKey={resetKey} />;
}

interface TodoAppProps {
  ownerKey: string | null;
  onResetKey: (message: string | null) => void;
}

function TodoApp({ ownerKey, onResetKey }: TodoAppProps) {
  const repo = useMemo<TodoRepository>(
    () =>
      supabaseConfigured && ownerKey
        ? createSupabaseRepository(SUPABASE_URL!, SUPABASE_ANON_KEY!, ownerKey)
        : createLocalRepository(),
    [ownerKey],
  );

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => toDateKey(new Date()));
  const range = useMemo(() => {
    const { start, end } = visibleRange(month);
    return { from: toDateKey(start), to: toDateKey(end) };
  }, [month]);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  const handleError = useCallback(
    (message: string, error: unknown) => {
      if (error instanceof OwnerKeyRejectedError) {
        onResetKey('비밀 문구가 올바르지 않습니다. 다시 입력해 주세요.');
        return;
      }
      const detail = error instanceof Error ? error.message : String(error);
      showToast(`${message}: ${detail}`);
    },
    [onResetKey, showToast],
  );

  // 비밀 문구가 서버와 맞는지 먼저 확인한다 (틀리면 읽기는 조용히 빈 결과만 돌아오기 때문)
  useEffect(() => {
    let cancelled = false;
    repo
      .verifyOwner()
      .then((ok) => {
        if (!cancelled && !ok) handleError('', new OwnerKeyRejectedError());
      })
      .catch((error: unknown) => {
        if (!cancelled) handleError('서버에 연결하지 못했습니다', error);
      });
    return () => {
      cancelled = true;
    };
  }, [repo, handleError]);

  const { todos, loading, addTodo, updateTodo, removeTodo } = useTodos(repo, range, handleError);

  const counts = useMemo(() => {
    const map = new Map<string, DayCount>();
    for (const t of todos) {
      if (!t.due_date) continue;
      const c = map.get(t.due_date) ?? { open: 0, total: 0 };
      c.total += 1;
      if (!t.completed) c.open += 1;
      map.set(t.due_date, c);
    }
    return map;
  }, [todos]);

  const dayTodos = useMemo(() => todos.filter((t) => t.due_date === selected), [todos, selected]);
  const undated = useMemo(() => todos.filter((t) => t.due_date === null), [todos]);

  const goToday = () => {
    const now = new Date();
    setMonth(startOfMonth(now));
    setSelected(toDateKey(now));
  };

  // 달을 넘길 때 선택한 날짜가 새 달력 범위 밖이면 그 달 1일을 선택한다
  const changeMonth = (next: Date) => {
    const { start, end } = visibleRange(next);
    const from = toDateKey(start);
    const to = toDateKey(end);
    setMonth(next);
    setSelected((cur) => (cur >= from && cur <= to ? cur : toDateKey(next)));
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Todooo</h1>
        <div className={styles.headerRight}>
          {!supabaseConfigured && (
            <span className={styles.banner} title="VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없습니다">
              로컬 저장 모드 · 이 브라우저에만 저장됩니다
            </span>
          )}
          {supabaseConfigured && (
            <button type="button" className={styles.linkButton} onClick={() => onResetKey(null)}>
              비밀 문구 지우기
            </button>
          )}
        </div>
      </header>

      <main className={styles.layout}>
        <Calendar
          month={month}
          selected={selected}
          counts={counts}
          onSelect={setSelected}
          onPrevMonth={() => changeMonth(subMonths(month, 1))}
          onNextMonth={() => changeMonth(addMonths(month, 1))}
          onToday={goToday}
        />
        <TodoPanel
          dateKey={selected}
          todos={dayTodos}
          undated={undated}
          loading={loading}
          onAdd={addTodo}
          onUpdate={updateTodo}
          onRemove={removeTodo}
        />
      </main>

      <Toast message={toast} />
    </div>
  );
}
