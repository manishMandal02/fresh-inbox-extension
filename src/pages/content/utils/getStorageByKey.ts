import type { storageKeys } from '../constants/app.constants';

type StorageKey = keyof typeof storageKeys;

export const getLocalStorageByKey = async <T = string[]>(key: StorageKey): Promise<T> => {
  const localStorage = await chrome.storage.local.get(key);

  if (localStorage && typeof localStorage[key] !== 'undefined') {
    return localStorage[key];
  } else {
    return null;
  }
};

export const getSyncStorageByKey = async <T>(key: StorageKey): Promise<T> => {
  const syncStorage = await chrome.storage.sync.get(key);

  if (syncStorage && typeof syncStorage[key] !== 'undefined') {
    return syncStorage[key];
  } else {
    return null;
  }
};

