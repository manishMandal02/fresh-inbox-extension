import { generateStorageKey } from '..';
import type { StorageKey } from '../constants/app.constants';
import type { ISession } from '../types/background.types';

type SetStorageParams = {
  type: 'local' | 'sync' | 'session';
  key: StorageKey;
  value: boolean | string[] | ISession;
};

// sets chrome storage by key
export const setStorage = async ({ key, value, type }: SetStorageParams) => {
  // create key
  const dynamicKey = generateStorageKey(key);
  // local storages
  if (type === 'local') {
    await chrome.storage.local.set({
      [dynamicKey]: value,
    });
    return true;
  }
  // sync storage
  if (type === 'sync') {
    await chrome.storage.sync.set({
      [dynamicKey]: value,
    });
    return true;
  }

  // session storage
  await chrome.storage.session.set({
    [dynamicKey]: value,
  });
  return true;
};
