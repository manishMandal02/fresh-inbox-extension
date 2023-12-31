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
  ADVANCE_SEARCH = 'advanceSearch',
  BULK_DELETE = 'bulkDelete',
  // events to content script
  LOGOUT_USER = 'logoutUser',
  API_LIMIT_REACHED = 'apiLimitReached',
  BACKGROUND_ERROR = 'backgroundError',
}

export interface ISession {
  token: string;
  expiresAt: string;
  email: string;
}

export enum FILTER_ACTION {
  TRASH = 'TRASH',
  INBOX = 'INBOX',
}

export type FilterType = 'whitelist' | 'unsubscribe';

export type APIHandleParams = {
  emails: string[];
  userToken: string;
};

type EmailId = {
  email: string;
  id: string;
};

type GmailFolder = 'all' | 'inbox' | 'spam' | 'search';

// for checking newsletter emails on page
export interface DataOnPage {
  emails: EmailId[];
  // ex: general, promotions, transactional, etc.
  category?: string;
  // ex: 'inbox' |'spam' | 'all'
  folder?: GmailFolder;
  dateRange: {
    // yyyy-mm-dd
    startDate: string;
    // yyyy-mm-dd
    endDate: string;
  };
}

export interface IMessageBody {
  event: IMessageEvent;
  emails?: string[];
  userEmail: string;
  name?: string;
  // to remove the email from the whitelisted emails after unsubscribing (if true)
  isWhitelisted?: boolean;
  // for getting the newsletter emails on the page
  dataOnPage?: DataOnPage;
  // for advance search event
  advanceSearch?: SearchFormData;
  // for when events are sent from background to content script
  msg?: string;
}

export type GetMsgAPIResponse = {
  messages: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
  error?: {
    code: number;
    message: string;
  };
};

export type GmailFilter = {
  id: string;
  criteria: {
    query: string;
  };
  action: {
    addLabelIds?: string[];
    removeLabelIds?: string[];
  };
};

export type GmailFilters = {
  filter: GmailFilter[];
};

export type FilterEmails = {
  filterId?: string;
  emails: string[];
};

export type GmailMessage = {
  id: string;
  threadId: string;
};

export type INewsletterEmails = {
  email: string;
  name: string;
};

// data for advance search event
export interface SearchFormData {
  keyword?: string;
  isRead?: boolean;
  isUnRead?: boolean;
  afterDate?: string;
  beforeDate?: string;
}
