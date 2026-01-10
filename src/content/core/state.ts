import { AppState, AppSettings, UIState } from '../../types/state';
import { storageService } from '../services/storage';

type StateListener = (state: AppState) => void;

const INITIAL_UI_STATE: UIState = {
  currentView: 'inbox',
  selectedThreadId: null,
  selection: new Set(),
  searchQuery: '',
  isLoading: true
};

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
      },
      ui: INITIAL_UI_STATE,
      cache: {
        lastSync: 0
      },
      threads: new Map()
    };
  }

  /**
   * Initialize state by loading settings from storage.
   */
  async init(): Promise<void> {
    const settings = await storageService.loadSettings();
    this.update({
      settings,
      ui: { ...this.state.ui, isLoading: false }
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

    // Deep merge for settings if provided, shallow merge for others
    const nextState = {
      ...this.state,
      ...update,
      settings: update.settings ? { ...this.state.settings, ...update.settings } : this.state.settings,
      ui: update.ui ? { ...this.state.ui, ...update.ui } : this.state.ui,
      cache: update.cache ? { ...this.state.cache, ...update.cache } : this.state.cache
    };

    // If settings changed, persist them
    if (update.settings) {
      storageService.setMany(update.settings);
    }

    this.state = nextState;
    this.notify();
  }

  /**
   * Update specific UI state.
   */
  setUI(partialUI: Partial<UIState>): void {
    this.update({
      ui: { ...this.state.ui, ...partialUI }
    });
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
