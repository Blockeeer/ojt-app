import { useState } from 'react';

export const STORAGE_KEYS = {
  SETTINGS: 'ojt_settings',
  ATTENDANCE: 'ojt_attendance',
  HOLIDAYS: 'ojt_holidays',
  SCHEDULE: 'ojt_schedule',
};

/**
 * useLocalStorage(key, initialValue)
 * Synchronizes React state with localStorage.
 * Returns [storedValue, setValue] — same API as useState.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`useLocalStorage: error setting "${key}"`, error);
    }
  };

  return [storedValue, setValue];
}
