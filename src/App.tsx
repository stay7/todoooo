import { useCallback, useMemo, useRef, useState } from 'react';
import { addMonths, startOfMonth, subMonths } from 'date-fns';
import { Calendar, visibleRange, type DayCount } from './components/Calendar';
import { SettingsScreen } from './components/SettingsScreen';
import { Sheet } from './components/Sheet';
import { TabBar, type Tab } from './components/TabBar';
import { Toast } from './components/Toast';
import { TodoRow } from './components/TodoRow';
import { TodoSheet, type SheetMode } from './components/TodoSheet';
import { clearLocalTodos, createLocalRepository } from './data/localRepository';
import type { TodoRepository } from './data/repository';
import { createSupabaseRepository } from './data/supabaseRepository';
import { useTodos } from './hooks/useTodos';
import { formatDateHeading, formatMinutes, toDateKey } from './lib/format';
import styles from './App.module.css';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const COLLAPSED_KEY = 'todooo.calendarCollapsed';

// 저장소는 환경변수로만 결정되므로 모듈이 로드될 때 한 번만 만든다
const repo: TodoRepository = supabaseConfigured
  ? createSupabaseRepository(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : createLocalRepository();

export default function App() {
  const [tab, setTab] = useState<Tab>('calendar');
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => toDateKey(new Date()));
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === '1');
  const [sheet, setSheet] = useState<SheetMode | null>(null);

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
      const detail = error instanceof Error ? error.message : String(error);
      showToast(message ? `${message}: ${detail}` : detail);
    },
    [showToast],
  );

  const { todos, loading, reload, addTodo, updateTodo, removeTodo } = useTodos(
    repo,
    range,
    handleError,
  );

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
  const remaining = dayTodos
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + (t.estimated_minutes ?? 0), 0);

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

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      localStorage.setItem(COLLAPSED_KEY, v ? '0' : '1');
      return !v;
    });
  };

  const toggleTodo = (id: string, completed: boolean) => updateTodo(id, { completed });
  const openEdit = (todo: (typeof todos)[number]) => setSheet({ kind: 'edit', todo });
  const closeSheet = useCallback(() => setSheet(null), []);

  return (
    <div className={styles.phone}>
      <div className={styles.screen}>
        {tab === 'calendar' && (
          <>
            <Calendar
              month={month}
              selected={selected}
              counts={counts}
              collapsed={collapsed}
              onSelect={setSelected}
              onPrevMonth={() => changeMonth(subMonths(month, 1))}
              onNextMonth={() => changeMonth(addMonths(month, 1))}
              onToday={goToday}
              onToggleCollapsed={toggleCollapsed}
            />
            <div className={styles.content}>
              <header className={styles.dayHeader}>
                <h2 className={styles.dayTitle}>{formatDateHeading(selected)}</h2>
                {remaining > 0 && (
                  <span className={styles.remaining}>남은 {formatMinutes(remaining)}</span>
                )}
              </header>
              {dayTodos.length === 0 ? (
                <p className={styles.empty}>
                  {loading ? '불러오는 중…' : '아직 Todo 가 없어요. + 버튼으로 추가해 보세요.'}
                </p>
              ) : (
                <ul className={styles.list}>
                  {dayTodos.map((t) => (
                    <TodoRow key={t.id} todo={t} onToggle={toggleTodo} onOpen={openEdit} />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {tab === 'undated' && (
          <div className={styles.content}>
            <header className={styles.appBar}>
              <h1 className={styles.appBarTitle}>날짜 미정</h1>
              <span className={styles.remaining}>{undated.length}개</span>
            </header>
            {undated.length === 0 ? (
              <p className={styles.empty}>
                {loading ? '불러오는 중…' : '날짜를 정하지 않은 Todo 가 여기에 모여요.'}
              </p>
            ) : (
              <ul className={styles.list}>
                {undated.map((t) => (
                  <TodoRow key={t.id} todo={t} onToggle={toggleTodo} onOpen={openEdit} />
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className={styles.content}>
            <SettingsScreen
              supabaseConfigured={supabaseConfigured}
              onClearLocal={() => {
                clearLocalTodos();
                void reload();
                showToast('로컬 데이터를 지웠습니다');
              }}
            />
          </div>
        )}

        {tab !== 'settings' && (
          <button
            type="button"
            className={styles.fab}
            onClick={() => setSheet({ kind: 'add', dueDate: tab === 'calendar' ? selected : null })}
            aria-label="새 Todo 추가"
          >
            +
          </button>
        )}

        <TabBar tab={tab} undatedCount={undated.length} onChange={setTab} />
      </div>

      <Sheet
        open={sheet !== null}
        title={sheet?.kind === 'edit' ? 'Todo 편집' : '새 Todo'}
        onClose={closeSheet}
      >
        {sheet && (
          <TodoSheet
            key={sheet.kind === 'edit' ? sheet.todo.id : `add-${sheet.dueDate ?? 'none'}`}
            mode={sheet}
            onAdd={addTodo}
            onUpdate={updateTodo}
            onRemove={removeTodo}
            onClose={closeSheet}
          />
        )}
      </Sheet>

      <Toast message={toast} />
    </div>
  );
}
