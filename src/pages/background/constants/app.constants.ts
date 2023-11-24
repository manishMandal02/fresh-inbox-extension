// dummy email used to tag/identify  filters created by app (fresh inbox
export const FRESH_INBOX_FILTER_EMAIL = 'filter@getfreshinbox.com';

// max number of results returned from the gmail api
export const API_MAX_RESULT = 500;

// scopes for google auth
// https://www.googleapis.com/auth/gmail.modify :- to get emails/message
// https://www.googleapis.com/auth/gmail.settings.basic :- to create/delete filters
export const AUTH_SCOPE =
  'https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.settings.basic';

//
export const storageKeys = {
  SESSIONS: 'SESSIONS',
  UNSUBSCRIBE_FILTER_ID: 'UNSUBSCRIBE_FILTER_ID',
  WHITELIST_FILTER_ID: 'WHITELIST_FILTER_ID',
  IS_APP_ENABLED: 'IS_APP_ENABLED',
  DONT_SHOW_DELETE_CONFIRM_MSG: 'DONT_SHOW_DELETE_CONFIRM_MSG',
  NEWSLETTER_EMAILS: 'NEWSLETTER_EMAILS',
  UNSUBSCRIBED_EMAILS: 'UNSUBSCRIBED_EMAILS',
  WHITELISTED_EMAILS: 'WHITELISTED_EMAILS',
} as const;

export type StorageKey = keyof typeof storageKeys;

export type UserStorageKey = `${string}-${StorageKey}`;
