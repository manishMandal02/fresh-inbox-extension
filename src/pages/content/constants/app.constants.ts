// query selector for all mail nodes on the page
export const MAIL_NODES_SELECTOR = 'tr>td>div:last-child>span>span[email]';

export const storageKeys = {
  NEWSLETTER_EMAILS: 'NEWSLETTER_EMAILS',
  UNSUBSCRIBED_EMAILS: 'UNSUBSCRIBED_EMAILS',
  WHITELISTED_EMAILS: 'WHITELISTED_EMAILS',
  IS_APP_ENABLED: 'IS_APP_ENABLED',
  SHOW_DELETE_CONFIRM_MSG: 'SHOW_DELETE_CONFIRM_MSG',
} as const;
