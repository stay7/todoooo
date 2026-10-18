import { useEffect, type ReactNode } from 'react';
import styles from './Sheet.module.css';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** 아래에서 올라오는 시트. 바깥을 누르거나 ESC 로 닫는다. */
export function Sheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`${styles.root} ${open ? styles.open : ''}`} aria-hidden={!open}>
      <div className={styles.backdrop} onClick={onClose} />
      <section className={styles.panel} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.handle} />
        <h2 className={styles.title}>{title}</h2>
        {open && children}
      </section>
    </div>
  );
}
