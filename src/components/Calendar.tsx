import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { toDateKey } from '../lib/format';
import styles from './Calendar.module.css';

export interface DayCount {
  open: number;
  total: number;
}

interface Props {
  month: Date;
  selected: string;
  counts: Map<string, DayCount>;
  collapsed: boolean;
  onSelect: (key: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onToggleCollapsed: () => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 달력 그리드에 보이는 첫날~마지막날 (일요일 시작) */
export function visibleRange(month: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
  };
}

export function Calendar({
  month,
  selected,
  counts,
  collapsed,
  onSelect,
  onPrevMonth,
  onNextMonth,
  onToday,
  onToggleCollapsed,
}: Props) {
  // 접힌 상태에서는 선택한 날짜가 속한 주 한 줄만 보여준다
  const range = collapsed
    ? {
        start: startOfWeek(parseISO(selected), { weekStartsOn: 0 }),
        end: endOfWeek(parseISO(selected), { weekStartsOn: 0 }),
      }
    : visibleRange(month);
  const days = eachDayOfInterval(range);

  return (
    <section className={styles.calendar} aria-label="캘린더">
      <header className={styles.appBar}>
        <button type="button" className={styles.navBtn} onClick={onPrevMonth} aria-label="이전 달">
          ‹
        </button>
        <h1 className={styles.month}>{format(month, 'yyyy년 M월')}</h1>
        <button type="button" className={styles.navBtn} onClick={onNextMonth} aria-label="다음 달">
          ›
        </button>
        <button type="button" className={styles.todayBtn} onClick={onToday}>
          오늘
        </button>
      </header>

      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`${styles.weekday} ${i === 0 ? styles.sunday : ''}`}>
            {w}
          </div>
        ))}
      </div>

      <div className={styles.grid} role="grid">
        {days.map((day) => {
          const key = toDateKey(day);
          const count = counts.get(key);
          const classes = [
            styles.cell,
            !isSameMonth(day, month) && styles.outside,
            isToday(day) && styles.today,
            key === selected && styles.selected,
            day.getDay() === 0 && styles.sunday,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              type="button"
              key={key}
              className={classes}
              onClick={() => onSelect(key)}
              aria-pressed={key === selected}
              aria-label={`${format(day, 'M월 d일')}${count ? `, 남은 할 일 ${count.open}개` : ''}`}
            >
              <span className={styles.num}>{format(day, 'd')}</span>
              <span className={styles.marker}>
                {count && count.total > 0 &&
                  (count.open > 0 ? (
                    <span className={styles.badge}>{count.open}</span>
                  ) : (
                    <span className={styles.done}>✓</span>
                  ))}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.collapse}
        onClick={onToggleCollapsed}
        aria-expanded={!collapsed}
      >
        {collapsed ? '∨ 펼치기' : '∧ 접기'}
      </button>
    </section>
  );
}
