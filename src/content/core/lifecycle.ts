import { stateManager } from './state';
import { gmailRouter } from './router';
import { gmailService } from '../services/gmail';
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

      // 1. Initialize State
      await stateManager.init();
      console.log('[Lifecycle] State initialized');

      // 2. Start Router
      gmailRouter.init();
      console.log('[Lifecycle] Router initialized');

      // 3. Start Gmail Services
      this.startGmailServices();
      console.log('[Lifecycle] Gmail services started');

      // 4. Setup Theme Listener
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

  private startGmailServices(): void {
    // Initial sync
    console.log('[Lifecycle] Starting initial sync...');
    gmailService.syncThreads();

    // Start observing DOM changes (new emails)
    const stopObserver = gmailService.observeThreadList();
    this.observers.push(stopObserver);

    // Observe router for view changes
    gmailRouter.subscribe(route => {
      const isListView = route.view !== 'thread' && route.view !== 'unknown' && route.view !== 'settings';

      if (isListView) {
        // Trigger manual sync after a short delay to allow Gmail to start rendering
        // The MutationObserver will handle the rest, but this ensures we don't miss the transition
        setTimeout(() => gmailService.syncThreads(), 500);
        setTimeout(() => gmailService.syncThreads(), 1500); // Second attempt for slow loads
      } else if (route.view === 'thread' && route.params.threadId) {
        // Scrape thread content
        this.handleThreadView(route.params.threadId);
      }
    });
  }

  private async handleThreadView(threadId: string) {
    try {
      // Wait for message container
      const msgContainer = await dom.waitForEl('[role="listitem"], .adn, .gs', 5000);

      if (msgContainer) {
        // Expand all messages and wait for them to actually expand
        await this.expandThreadWithObserver();

        // Update state with full details
        const { messages, subject } = gmailService.getOpenedThreadData();

        stateManager.update(state => {
          const thread = state.threads.get(threadId) || {
            id: threadId,
            subject: subject || 'No Subject',
            snippet: '',
            from: { name: 'Loading...', email: '' },
            date: '',
            isUnread: false,
            isStarred: false,
            lastMessageAt: Date.now(),
            participantCount: 1,
            messages: [],
            labels: []
          };

          const newThread = { ...thread, messages };
          if (subject) newThread.subject = subject;

          const newThreads = new Map(state.threads);
          newThreads.set(threadId, newThread);
          return {
            threads: newThreads,
            ui: { ...state.ui, selectedThreadId: threadId }
          };
        });
      }
    } catch (e) {
      console.error('[Lifecycle] Error handling thread view:', e);
    }
  }

  /**
   * Expand thread with MutationObserver instead of hardcoded timeouts
   * Waits until all messages are actually visible before proceeding
   */
  private async expandThreadWithObserver(): Promise<void> {
    return new Promise<void>(resolve => {
      // Click expand all button if available
      const expandAllBtn = document.querySelector(
        'img[alt="Expand all"], img[aria-label="Expand all"]'
      ) as HTMLElement;
      if (expandAllBtn) {
        expandAllBtn.click();
      }

      // Click any collapsed message indicators
      const collapsedMessages = document.querySelectorAll('.kQ, .kv, .ajR, [aria-expanded="false"]');
      collapsedMessages.forEach(el => {
        (el as HTMLElement).click();
      });

      // Set up observer to detect when messages have expanded
      const messageContainer = document.querySelector('[role="listitem"], .adn, .gs');
      if (!messageContainer) {
        // No container, resolve immediately
        resolve();
        return;
      }

      let timeoutHandle: NodeJS.Timeout;
      let lastChangeTime = Date.now();

      const observer = new MutationObserver(() => {
        // Reset timeout on each change
        lastChangeTime = Date.now();
        clearTimeout(timeoutHandle);

        // Wait 500ms with no changes before considering expansion complete
        timeoutHandle = setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 500);
      });

      // Watch for changes in message content
      observer.observe(messageContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'aria-expanded', 'style']
      });

      // Safety timeout - don't wait forever
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 3000);
    });
  }

  destroy(): void {
    gmailRouter.destroy();
    this.observers.forEach(stop => stop());
    this.observers = [];
    this.isInitialized = false;
  }
}

export const lifecycle = new LifecycleManager();
