export interface EmailParticipant {
  name: string;
  email: string;
  avatarUrl?: string;
}

export type EmailCategory = 
  | 'primary' 
  | 'promotions' 
  | 'social' 
  | 'updates' 
  | 'forums' 
  | 'finance' 
  | 'travel' 
  | 'shopping';

export interface EmailLabel {
  id: string;
  name: string;
  color?: string;
  type: 'system' | 'user';
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  snippet: string;
  from: EmailParticipant;
  to: EmailParticipant[];
  date: string; // ISO string
  timestamp: number;
  isUnread: boolean;
  isStarred: boolean;
  isImportant: boolean;
  labels: string[]; // Label IDs
  attachments: EmailAttachment[];
  body?: string; // HTML content
}

export interface EmailThread {
  id: string;
  messages: EmailMessage[];
  lastMessageAt: number;
  participantCount: number;
  snippet: string;
  subject: string;
  isUnread: boolean;
  isStarred: boolean;
  labels: string[];
  category?: EmailCategory;
  bundleId?: string;
}

export interface EmailBundle {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  condition: string; // Query or logic to group
}
