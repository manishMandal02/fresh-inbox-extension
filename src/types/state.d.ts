export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  notificationsEnabled: boolean;
}

export interface AppState {
  settings: AppSettings;
}

export type StorageKey = keyof AppSettings;
