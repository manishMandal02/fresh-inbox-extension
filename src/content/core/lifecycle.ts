import { stateManager } from './state';
import { gmailRouter } from './router';
import { gmailService } from '../services/gmail';
import { dom } from '../utils/dom';

export class LifecycleManager {
  private isInitialized = false;
  private observers: (() => void)[] = [];

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[Lifecycle] Initializing Fresh Inbox...');

    try {
      // 0. Wait for Gmail to load basic structure
      await this.waitForGmailLoad();

      // 1. Initialize State
      await stateManager.init();

      // 2. Start Router
      gmailRouter.init();

      // 3. Start Gmail Services
      this.startGmailServices();

      this.isInitialized = true;
      console.log('[Lifecycle] Fresh Inbox initialized successfully.');
    } catch (error) {
      console.error('[Lifecycle] Initialization failed:', error);
    }
  }

  private async waitForGmailLoad(): Promise<void> {
    // Wait for the main container to appear
    const main = await dom.waitForEl('[role="main"]', 15000); 
    if (!main) throw new Error('Gmail main container not found after timeout');
  }

  private startGmailServices(): void {
    // Initial sync
    gmailService.syncThreads();

    // Start observing DOM changes (new emails)
    const stopObserver = gmailService.observeThreadList();
    this.observers.push(stopObserver);

    // Observe router for view changes
    gmailRouter.subscribe((route) => {
      console.log(`[Router] View changed: ${route.view}`);
      
      if (route.view === 'inbox' || route.view === 'search' || route.view === 'label') {
        // Re-sync if we moved back to inbox
        setTimeout(() => gmailService.syncThreads(), 500); 
      } else if (route.view === 'thread' && route.params.threadId) {
        // Scrape thread content
        this.handleThreadView(route.params.threadId);
      }
    });
  }

  private async handleThreadView(threadId: string) {
    console.log(`[Lifecycle] Waiting for message view for thread ${threadId}...`);
    try {
        // Wait for message container
        const msgContainer = await dom.waitForEl('[role="listitem"], .adn, .gs', 5000); 
        
        if (msgContainer) {
            console.log('[Lifecycle] Message container found:', msgContainer.className);
            
            // Expand all messages to ensure we scrape full content
            await gmailService.expandThread();

            // Short delay for images/rendering
            setTimeout(() => {
                const { messages, subject } = gmailService.getOpenedThreadData();
                console.log(`[Lifecycle] Scraped ${messages.length} messages. Subject: ${subject}`);
                
                // Update state with full details
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
            }, 1000);
        } else {
            console.error('[Lifecycle] Message container NOT found (timeout).');
        }
    } catch (e) {
        console.error('[Lifecycle] Error waiting for thread view:', e);
    }
  }

  destroy(): void {
    gmailRouter.destroy();
    this.observers.forEach(stop => stop());
    this.observers = [];
    this.isInitialized = false;
  }
}

export const lifecycle = new LifecycleManager();
