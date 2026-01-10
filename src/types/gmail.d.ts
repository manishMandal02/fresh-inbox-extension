export interface GmailSelectors {
  // Main layout
  mainContainer: string;
  leftSidebar: string;
  topHeader: string;
  
  // Email list
  threadList: string;
  threadRow: string;
  threadSubject: string;
  threadSender: string;
  threadSnippet: string;
  threadDate: string;
  
  // Thread view
  threadView: string;
  messageContainer: string;
  messageBody: string;
  replyBox: string;
}

export type GmailView = 
  | 'inbox' 
  | 'thread' 
  | 'label' 
  | 'search' 
  | 'settings' 
  | 'unknown';

export interface GmailRoute {
  view: GmailView;
  params: Record<string, string>;
  hash: string;
}

/**
 * Common Gmail CSS classes or data-attributes
 */
export enum GmailAttributes {
  THREAD_ID = 'data-thread-id',
  MESSAGE_ID = 'data-message-id',
  LEGACY_THREAD_ID = 'data-legacy-thread-id',
}
