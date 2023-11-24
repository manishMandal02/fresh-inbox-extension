import type { StorageKey, UserStorageKey, storageKeys } from '@src/pages/background/constants/app.constants';
import type { ISession } from '../types/background.types';
import { generateStorageKey } from '..';

export const getSyncStorageByKey = async <T = string>(
  key: Extract<
    StorageKey,
    'DONT_SHOW_DELETE_CONFIRM_MSG' | 'WHITELIST_FILTER_ID' | 'UNSUBSCRIBE_FILTER_ID' | 'IS_APP_ENABLED'
  >
): Promise<T> => {
  // storage key for current user
  const userStorageKey = generateStorageKey(key);

  // get storage from chrome
  const syncStorage = await chrome.storage.sync.get(userStorageKey);

  if (syncStorage && typeof syncStorage[key] !== 'undefined') {
    return syncStorage[key];
  } else {
    return null;
  }
};

export const getLocalStorageByKey = async <T = string>(
  key: Extract<StorageKey, 'NEWSLETTER_EMAILS' | 'UNSUBSCRIBED_EMAILS' | 'WHITELISTED_EMAILS'>
): Promise<T> => {
  // storage key for current user
  const userStorageKey = generateStorageKey(key);

  // get storage from chrome
  const localStorage = await chrome.storage.local.get(userStorageKey);

  if (localStorage && typeof localStorage[key] !== 'undefined') {
    return localStorage[key];
  } else {
    return null;
  }
};

export const getSessionStorageByKey = async <T = ISession>(key: UserStorageKey): Promise<T> => {
  // get storage from chrome
  const sessionStorage = await chrome.storage.session.get(key);

  if (sessionStorage && typeof sessionStorage[key] !== 'undefined') {
    return sessionStorage[key];
  } else {
    return null;
  }
};
