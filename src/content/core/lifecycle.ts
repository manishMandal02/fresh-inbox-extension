import { stateManager } from './state';
import { dom } from '../utils/dom';

export class LifecycleManager {
  private isInitialized = false;
  private observers: (() => void)[] = [];

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('[Lifecycle] Initializing Fresh Inbox...');

      // 0. Wait for Gmail to load basic structure
      await this.waitForGmailLoad();
      console.log('[Lifecycle] Gmail structure loaded');

      // 1. Initialize State (Settings only)
      await stateManager.init();
      console.log('[Lifecycle] State initialized');

      // 2. Setup Theme Listener
      stateManager.subscribe(state => {
        document.body.setAttribute('data-theme', state.settings.theme);
        const root = document.getElementById('fi-root');
        if (root) {
          root.setAttribute('data-theme', state.settings.theme);
        }
      });

      this.isInitialized = true;
      console.log('[Lifecycle] Fresh Inbox initialized successfully!');
    } catch (error) {
      console.error('[Lifecycle] Initialization error:', error);
    }
  }

  private async waitForGmailLoad(): Promise<void> {
    // Wait for the main container to appear
    const main = await dom.waitForEl('[role="main"]', 15000);
    if (!main) throw new Error('Gmail main container not found after timeout');
  }

  destroy(): void {
    this.isInitialized = false;
    this.observers = [];
  }
}

export const lifecycle = new LifecycleManager();
