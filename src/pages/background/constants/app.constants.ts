// dummy email used to tag/identify  filters created by app (fresh inbox
export const FRESH_INBOX_FILTER_EMAIL = 'filter@getfreshinbox.com';

// max number of results returned from the gmail api
export const API_MAX_RESULT = 500;

// scopes for google auth
// https://mail.google.com :- to get emails/message from users gmail account
// https://www.googleapis.com/auth/gmail.settings.basic :- to create/delete filter on behalf of user
export const AUTH_SCOPE = 'https://mail.google.com https://www.googleapis.com/auth/gmail.settings.basic';

//
export const storageKeys = {
  IS_APP_ENABLED: 'IS_APP_ENABLED',
  UNSUBSCRIBE_FILTER_ID: 'UNSUBSCRIBE_FILTER_ID',
  WHITELIST_FILTER_ID: 'WHITELIST_FILTER_ID',
  NEWSLETTER_EMAILS: 'NEWSLETTER_EMAILS',
  UNSUBSCRIBED_EMAILS: 'UNSUBSCRIBED_EMAILS',
  WHITELISTED_EMAILS: 'WHITELISTED_EMAILS',
} as const;
