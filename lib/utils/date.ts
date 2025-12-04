import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

/**
 * 상대 시간 포맷 (예: "방금 전", "5분 전", "3시간 전", "어제", "12월 3일")
 */
export function formatRelativeTime(dateString: string): string {
  const date = dayjs(dateString);
  const now = dayjs();
  const diffMinutes = now.diff(date, 'minute');
  const diffHours = now.diff(date, 'hour');
  const diffDays = now.diff(date, 'day');

  if (diffMinutes < 1) {
    return '방금 전';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays === 1) {
    return '어제';
  } else if (date.year() === now.year()) {
    return date.format('M월 D일');
  } else {
    return date.format('YYYY년 M월 D일');
  }
}

/**
 * 시간만 포맷 (예: "14:30")
 */
export function formatTime(dateString: string): string {
  return dayjs(dateString).format('HH:mm');
}

/**
 * 날짜 + 시간 포맷 (예: "12월 3일 14:30")
 */
export function formatDateTime(dateString: string): string {
  const date = dayjs(dateString);
  const now = dayjs();

  if (date.year() === now.year()) {
    return date.format('M월 D일 HH:mm');
  }
  return date.format('YYYY년 M월 D일 HH:mm');
}
