import { EmailThread } from './email';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
}

export interface UIState {
  currentView: 'inbox' | 'thread' | 'settings' | 'label' | 'search';
  selectedThreadId: string | null;
  selection: Set<string>; // Selected email IDs
  searchQuery: string;
  isLoading: boolean;
}

export interface AppState {
  settings: AppSettings;
  ui: UIState;

  // Data
  threads: Map<string, EmailThread>; // Map for O(1) access by ID

  cache: {
    lastSync: number;
  };
}

export type StorageKey = keyof AppSettings;
