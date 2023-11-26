// creates storage key from user email

import type { StorageKey } from '../constants/app.constants';

export const generateStorageKey = (key: StorageKey) => `${freshInboxGlobalVariables.userEmail}-${key}`;
