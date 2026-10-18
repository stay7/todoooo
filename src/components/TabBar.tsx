import type { ReactElement } from 'react';
import styles from './TabBar.module.css';

export type Tab = 'calendar' | 'undated' | 'settings';

interface Props {
  tab: Tab;
  undatedCount: number;
  onChange: (tab: Tab) => void;
}

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 13l2-8h12l2 8v6H4z" />
    <path d="M4 13h5l1.5 2h3L15 13h5" />
  </svg>
);
const GearIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

const TABS: { id: Tab; label: string; Icon: () => ReactElement }[] = [
  { id: 'calendar', label: '캘린더', Icon: CalendarIcon },
  { id: 'undated', label: '날짜 미정', Icon: InboxIcon },
  { id: 'settings', label: '설정', Icon: GearIcon },
];

export function TabBar({ tab, undatedCount, onChange }: Props) {
  return (
    <nav className={styles.bar} aria-label="주요 화면">
      {TABS.map(({ id, label, Icon }) => (
        <button
          type="button"
          key={id}
          className={`${styles.tab} ${tab === id ? styles.active : ''}`}
          onClick={() => onChange(id)}
          aria-current={tab === id ? 'page' : undefined}
        >
          <span className={styles.icon}>
            <Icon />
            {id === 'undated' && undatedCount > 0 && (
              <span className={styles.badge}>{undatedCount}</span>
            )}
          </span>
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
