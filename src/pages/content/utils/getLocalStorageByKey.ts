import { storageKeys } from '@src/pages/content/constants/app.constants';

type StorageKey = keyof typeof storageKeys;

export const getLocalStorageByKey = async <T>(key: StorageKey): Promise<T> => {
  const localStorage = await chrome.storage.local.get(key);

  if (localStorage && localStorage[key]) {
    return localStorage[key];
  } else {
    return null;
  }
};
