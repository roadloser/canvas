/**
 * IndexedDB 存储适配器 for Zustand persist
 */

import { del, get, set } from 'idb-keyval';
import type { PersistStorage } from 'zustand/middleware';

export const indexedDBStorage: PersistStorage<unknown> = {
  getItem: async (name: string) => {
    const value = await get(name);
    return value ?? null;
  },
  setItem: async (name: string, value: unknown) => {
    await set(name, value);
  },
  removeItem: async (name: string) => {
    await del(name);
  },
};
