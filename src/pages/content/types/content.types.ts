export enum IMessageEvent {
  UNSUBSCRIBE = 'unsubscribe',
  DELETE_ALL_MAILS = 'deleteAllMails',
  UNSUBSCRIBE_AND_DELETE_MAILS = 'unsubscribeAndDeleteAllMails',
  CHECK_AUTH_TOKEN = 'checkAuthToken',
  LAUNCH_AUTH_FLOW = 'launchAuthFLow',
  DISABLE_FRESH_INBOX = 'disableFreshInbox',
  GET_NEWSLETTER_EMAILS = 'getNewsletterEmails',
  GET_UNSUBSCRIBED_EMAILS = 'getUnsubscribedEmails',
  GET_WHITELISTED_EMAILS = 'getWhitelistedEmails',
  GET_NEWSLETTER_EMAILS_ON_PAGE = 'getNewsletterEmailsOnPage',
  RE_SUBSCRIBE = 'reSubscribe',
  WHITELIST_EMAIL = 'whitelistEmail',
  GET_APP_STATUS = 'getAppStatus',
  CHECKS_AFTER_AUTH = 'checksAfterAuth',
}

export type EmailId = {
  email: string;
  id: string;
};

export type DateRange = {
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
};

export type GmailFolder = 'all' | 'inbox' | 'spam';

// for checking newsletter emails on page
export interface DataOnPage {
  emails: EmailId[];
  // ex: general, promotions, transactional, etc.
  category?: string;
  // ex: 'inbox' |'spam' | 'all'
  folder?: GmailFolder;
  dateRange: DateRange;
}

export interface IMessageBody {
  event: IMessageEvent;
  clientId?: string;
  email?: string;
  // to remove the email from the whitelisted emails after unsubscribing (if true)
  isWhiteListed?: boolean;
  // for getting the newsletter emails on the page
  dataOnPage?: DataOnPage;
}
