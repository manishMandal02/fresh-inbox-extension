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
  CHECK_NEWSLETTER_EMAILS_ON_PAGE = 'checkForNewsletterEmailsOnPage',
  RE_SUBSCRIBE = 'reSubscribe',
  WHITELIST_EMAIL = 'whitelistEmail',
}

export interface IMessageBody {
  event: IMessageEvent;
  email?: string;
  name?: string;
}
export interface IUserInfo {
  email: string;
  userId: string;
}
