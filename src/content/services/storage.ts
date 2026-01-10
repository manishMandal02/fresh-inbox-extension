import { AppSettings, StorageKey } from '../../types/state';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  sidebarCollapsed: false,
  notificationsEnabled: true,
};

export class StorageService {
  /**
   * Load all settings from Chrome storage.
   * Merges with default settings to ensure all keys exist.
   */
  async loadSettings(): Promise<AppSettings> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        const settings = { ...DEFAULT_SETTINGS, ...items };
        resolve(settings as AppSettings);
      });
    });
  }

  /**
   * Get a specific setting value.
   */
  async get<K extends StorageKey>(key: K): Promise<AppSettings[K]> {
    const settings = await this.loadSettings();
    return settings[key];
  }

  /**
   * Save a specific setting value.
   */
  async set<K extends StorageKey>(key: K, value: AppSettings[K]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  /**
   * Save multiple settings at once.
   */
  async setMany(settings: Partial<AppSettings>): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(settings, () => {
        resolve();
      });
    });
  }

  /**
   * Listen for changes in storage.
   */
  onChanged(callback: (changes: Partial<AppSettings>) => void): void {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        const newSettings: Partial<AppSettings> = {};
        for (const [key, { newValue }] of Object.entries(changes)) {
          if (key in DEFAULT_SETTINGS) {
            // @ts-ignore
            newSettings[key as StorageKey] = newValue;
          }
        }
        if (Object.keys(newSettings).length > 0) {
          callback(newSettings);
        }
      }
    });
  }
}

export const storageService = new StorageService();