/**
 * Date Utility Functions
 * Using Day.js for date manipulation
 */

import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';

// Extend Day.js with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

export const dateUtil = {
  /**
   * Get current date
   */
  now: (): Dayjs => {
    return dayjs();
  },

  /**
   * Parse a date string
   */
  parse: (date: string | Date): Dayjs => {
    return dayjs(date);
  },

  /**
   * Format date string
   */
  format: (date: string | Date | Dayjs, format: string = 'DD/MM/YYYY'): string => {
    return dayjs(date).format(format);
  },

  /**
   * Format date with time
   */
  formatDateTime: (date: string | Date | Dayjs, format: string = 'DD/MM/YYYY HH:mm'): string => {
    return dayjs(date).format(format);
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  fromNow: (date: string | Date | Dayjs): string => {
    return dayjs(date).fromNow();
  },

  /**
   * Check if date is today
   */
  isToday: (date: string | Date | Dayjs): boolean => {
    return dayjs(date).isSame(dayjs(), 'day');
  },

  /**
   * Check if date is in the past
   */
  isPast: (date: string | Date | Dayjs): boolean => {
    return dayjs(date).isBefore(dayjs());
  },

  /**
   * Check if date is in the future
   */
  isFuture: (date: string | Date | Dayjs): boolean => {
    return dayjs(date).isAfter(dayjs());
  },

  /**
   * Get difference between two dates in days
   */
  diffInDays: (date1: string | Date | Dayjs, date2: string | Date | Dayjs): number => {
    return dayjs(date2).diff(dayjs(date1), 'day');
  },

  /**
   * Get difference between two dates in hours
   */
  diffInHours: (date1: string | Date | Dayjs, date2: string | Date | Dayjs): number => {
    return dayjs(date2).diff(dayjs(date1), 'hour');
  },

  /**
   * Add days to a date
   */
  addDays: (date: string | Date | Dayjs, days: number): Dayjs => {
    return dayjs(date).add(days, 'day');
  },

  /**
   * Subtract days from a date
   */
  subtractDays: (date: string | Date | Dayjs, days: number): Dayjs => {
    return dayjs(date).subtract(days, 'day');
  },

  /**
   * Get start of day
   */
  startOfDay: (date: string | Date | Dayjs): Dayjs => {
    return dayjs(date).startOf('day');
  },

  /**
   * Get end of day
   */
  endOfDay: (date: string | Date | Dayjs): Dayjs => {
    return dayjs(date).endOf('day');
  },

  /**
   * Check if date is between two dates
   */
  isBetween: (
    date: string | Date | Dayjs,
    start: string | Date | Dayjs,
    end: string | Date | Dayjs
  ): boolean => {
    return dayjs(date).isBetween(dayjs(start), dayjs(end), null, '[]');
  },
};
