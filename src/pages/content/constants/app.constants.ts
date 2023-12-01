// query selector for all mail nodes on the page
export const MAIL_NODES_SELECTOR = 'tr>td>div:last-child>span>span[email]';

export const storageKeys = {
  IS_APP_ENABLED: 'IS_APP_ENABLED',
  DONT_SHOW_DELETE_CONFIRM_MSG: 'DONT_SHOW_DELETE_CONFIRM_MSG',
  NEWSLETTER_EMAILS: 'NEWSLETTER_EMAILS',
  UNSUBSCRIBED_EMAILS: 'UNSUBSCRIBED_EMAILS',
  WHITELISTED_EMAILS: 'WHITELISTED_EMAILS',
} as const;

export type StorageKey = keyof typeof storageKeys;
