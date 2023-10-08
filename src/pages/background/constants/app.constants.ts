// dummy email used to tag unsubscribe/block emails in filter
export const MAIL_MAGIC_FILTER_EMAIL = 'filter@getmailmagic.com';
export const API_MAX_RESULT = 500;

export const CLIENT_ID = '145716100092-ivrvur7d0s0bugdgq4ueinf646q8ih7b.apps.googleusercontent.com';

export const AUTH_SCOPE =
  'email https://mail.google.com https://www.googleapis.com/auth/gmail.settings.basic';

export const storageKeys = {
  MAIL_MAGIC_WHITELIST_FILTER_ID: 'MAIL_MAGIC_WHITELIST_FILTER_ID',
  IS_APP_ENABLED: 'IS_APP_ENABLED',
  WHITELIST_FILTER_ID: 'WHITELIST_FILTER_ID',
  UNSUBSCRIBE_FILTER_ID: 'UNSUBSCRIBE_FILTER_ID',
  NEWSLETTER_EMAILS: 'NEWSLETTER_EMAILS',
  UNSUBSCRIBED_EMAILS: 'UNSUBSCRIBED_EMAILS',
  WHITELISTED_EMAILS: 'WHITELISTED_EMAILS',
} as const;
