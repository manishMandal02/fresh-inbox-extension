export enum IMessageEvent {
  Unsubscribe = 'unsubscribe',
  Delete_All_Mails = 'deleteAllMails',
  Unsubscribe_And_Delete_All_Mails = 'unsubscribeAndDeleteAllMails',
  Check_Auth_Token = 'checkAuthToken',
  Render_Auth_Modal = 'renderAuthModal',
  Launch_Auth_Flow = 'launchAuthFLow',
  Disable_MailMagic = 'disableMailMagic',
  REFRESH_TABLE = 'refreshTable',
  GET_NEWSLETTER_EMAILS = 'getNewsletterEmails',
  GET_UNSUBSCRIBED_EMAILS = 'getUnsubscribedEmails',
  GET_WHITELISTED_EMAILS = 'getWhitelistedEmails',
  GET_NEWSLETTER_EMAILS_ON_PAGE = 'getNewsletterEmailsOnPage',
  RE_SUBSCRIBE = 'reSubscribe',
  WHITELIST_EMAIL = 'whitelistEmail',
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
  category?: string; // ex: general, promotions, transactional, etc.
  folder?: GmailFolder; // ex: 'inbox' |'spam' | 'all'
  dateRange: DateRange;
}

export interface IMessageBody {
  event: IMessageEvent;
  email?: string;
  name?: string;
  isWhiteListed?: boolean; // to remove the email from the whitelisted emails after unsubscribing (if true)
  dataOnPage?: DataOnPage; // for getting the newsletter emails on the page
  shouldRefreshTable?: boolean; // for refreshing table after deleting mails
}
