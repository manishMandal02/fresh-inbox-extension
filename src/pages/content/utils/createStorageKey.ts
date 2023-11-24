// creates storage key from user email

import type { StorageKey } from '../constants/app.constants';

export const createStorageKey = (key: StorageKey) => `${freshInboxGlobalVariables.userEmail}-${key}`;
