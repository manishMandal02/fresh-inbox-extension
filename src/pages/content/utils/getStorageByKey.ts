import type { StorageKey } from '../constants/app.constants';
import { generateStorageKey } from './generateStorageKey';

export const getLocalStorageByKey = async <T = string[]>(key: StorageKey): Promise<T> => {
  // storage key for current user
  const userStorageKey = generateStorageKey(key);

  const localStorage = await chrome.storage.local.get(userStorageKey);

  if (localStorage && typeof localStorage[userStorageKey] !== 'undefined') {
    return localStorage[userStorageKey];
  } else {
    return undefined;
  }
};

export const getSyncStorageByKey = async <T>(key: StorageKey): Promise<T> => {
  // storage key for current user
  const userStorageKey = generateStorageKey(key);

  const syncStorage = await chrome.storage.sync.get(userStorageKey);

  if (syncStorage && typeof syncStorage[userStorageKey] !== 'undefined') {
    return syncStorage[userStorageKey];
  } else {
    return undefined;
  }
};
