import { generateStorageKey } from '..';
import type { StorageKey } from '../constants/app.constants';
import type { INewsletterEmails, ISession } from '../types/background.types';
import { logger } from './logger';

type StorageValue = string | boolean | string[] | INewsletterEmails[] | ISession;

type SetStorageParams = {
  type: 'local' | 'sync' | 'session';
  key: StorageKey;
  value: StorageValue;
};

// sets chrome storage by key
export const setStorage = async ({ key, value, type }: SetStorageParams) => {
  try {
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
  } catch (error) {
    logger.error({
      error,
      msg: 'Error setting chrome storage',
      fileTrace: 'background/utils/setStorage.ts:45 ~ catch block',
    });
    return false;
  }
};
