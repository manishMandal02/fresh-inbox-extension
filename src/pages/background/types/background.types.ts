export enum IMessageEvent {
  Unsubscribe = 'unsubscribe',
  Delete_All_Mails = 'deleteAllMails',
  Unsubscribe_And_Delete_All_Mails = 'unsubscribeAndDeleteAllMails',
  Check_Auth_Token = 'checkAuthToken',
  Render_Auth_Modal = 'renderAuthModal',
  Launch_Auth_Flow = 'launchAuthFLow',
  Disable_MailMagic = 'disableMailMagic',
  GET_NEWSLETTER_EMAILS = 'getNewsletterEmails',
  GET_UNSUBSCRIBED_EMAILS = 'getUnsubscribedEmails',
  GET_WHITELISTED_EMAILS = 'getWhitelistedEmails',
  GET_NEWSLETTER_EMAILS_ON_PAGE = 'getNewsletterEmailsOnPage',
  RE_SUBSCRIBE = 'reSubscribe',
  WHITELIST_EMAIL = 'whitelistEmail',
}

export enum FILTER_ACTION {
  TRASH = 'TRASH',
  INBOX = 'INBOX',
}

export type FilterType = 'whitelist' | 'unsubscribe';

export type APIHandleParams = {
  email: string;
  token: string;
};

type EmailId = {
  email: string;
  id: string;
};

type GmailFolder = 'all' | 'inbox' | 'spam';

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
  email?: string;
  name?: string;
  // to remove the email from the whitelisted emails after unsubscribing (if true)
  isWhiteListed?: boolean;
  // for getting the newsletter emails on the page
  dataOnPage?: DataOnPage;
}
export interface IUserInfo {
  email: string;
  userId: string;
}

export type GetMsgAPIResponseSuccess = {
  messages: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
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

export type NewsletterEmails = {
  email: string;
  name: string;
};
