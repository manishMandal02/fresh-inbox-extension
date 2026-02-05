import { AppState, AppSettings } from '../../types/state';
import { storageService } from '../services/storage';

type StateListener = (state: AppState) => void;

export class StateManager {
  private state: AppState;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    // Initialize with default/empty state
    this.state = {
      settings: {
        theme: 'system',
        sidebarCollapsed: false,
        notificationsEnabled: true
      }
    };
  }

  /**
   * Initialize state by loading settings from storage.
   */
  async init(): Promise<void> {
    const settings = await storageService.loadSettings();
    this.update({
      settings
    });

    // Listen for storage changes (e.g., from other tabs or popup)
    storageService.onChanged(newSettings => {
      this.update({
        settings: { ...this.state.settings, ...newSettings }
      });
    });
  }

  /**
   * Get the current state snapshot.
   */
  get(): AppState {
    return this.state;
  }

  /**
   * Update the state and notify listeners.
   * Merges partial state into the current state.
   */
  update(partialState: Partial<AppState> | ((prevState: AppState) => Partial<AppState>)): void {
    const update = typeof partialState === 'function' ? partialState(this.state) : partialState;

    // Deep merge for settings if provided
    const nextState = {
      ...this.state,
      settings: update.settings ? { ...this.state.settings, ...update.settings } : this.state.settings
    };

    // If settings changed, persist them
    if (update.settings) {
      storageService.setMany(update.settings);
    }

    this.state = nextState;
    this.notify();
  }

  /**
   * Update specific Settings.
   */
  setSettings(partialSettings: Partial<AppSettings>): void {
    this.update({
      settings: { ...this.state.settings, ...partialSettings }
    });
  }

  /**
   * Subscribe to state changes.
   * Returns a unsubscribe function.
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const stateManager = new StateManager();
