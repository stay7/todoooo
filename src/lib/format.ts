import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/** 90 -> "1시간 30분", 30 -> "30분" */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

/** Date -> "YYYY-MM-DD" (브라우저 로컬 기준) */
export function toDateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** "2026-10-18" -> "10월 18일 (일)" */
export function formatDateHeading(key: string): string {
  return format(parseISO(key), 'M월 d일 (EEE)', { locale: ko });
}

/** 입력 문자열을 1 이상의 정수 분으로. 비었거나 잘못되면 null */
export function parseMinutes(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}
