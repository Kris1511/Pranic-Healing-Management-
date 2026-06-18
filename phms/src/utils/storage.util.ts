/**
 * Storage Utility Functions
 * Handles local storage operations with type safety
 */

const STORAGE_PREFIX = 'sanctuary_';

export const storage = {
  /**
   * Set a value in localStorage
   */
  set: <T,>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
    } catch (error) {
      console.error(`Failed to set storage key "${key}":`, error);
    }
  },

  /**
   * Get a value from localStorage
   */
  get: <T,>(key: string, defaultValue?: T): T | undefined => {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to get storage key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Remove a value from localStorage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error);
    }
  },

  /**
   * Clear all app storage
   */
  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },

  /**
   * Check if key exists
   */
  has: (key: string): boolean => {
    return localStorage.getItem(`${STORAGE_PREFIX}${key}`) !== null;
  },
};
