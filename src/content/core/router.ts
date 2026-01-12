import { GmailRoute, GmailView } from '../../../types/gmail';
import { stateManager } from './state';

type RouteListener = (route: GmailRoute) => void;

export class GmailRouter {
  private listeners: Set<RouteListener> = new Set();
  private currentRoute: GmailRoute | null = null;

  constructor() {
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  /**
   * Start listening for navigation changes.
   */
  init(): void {
    window.addEventListener('hashchange', this.handleHashChange);
    // Trigger initial route detection
    this.handleHashChange();
  }

  /**
   * Stop listening for navigation changes.
   */
  destroy(): void {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  /**
   * Parse the current URL hash into a GmailRoute object.
   */
  private parseRoute(hash: string): GmailRoute {
    const cleanHash = hash.replace(/^#/, '');
    const parts = cleanHash.split('/');
    
    let view: GmailView = 'unknown';
    const params: Record<string, string> = {};

    const systemLabels = ['inbox', 'starred', 'sent', 'drafts', 'trash', 'all', 'spam', 'imp', 'chats', 'category'];

    if (!cleanHash || cleanHash === 'inbox') {
      view = 'inbox';
    } else if (systemLabels.includes(cleanHash)) {
      view = cleanHash as any; // e.g. 'sent', 'all', etc
      params.labelName = cleanHash;
    } else if (cleanHash.startsWith('search/')) {
      view = 'search';
      params.query = decodeURIComponent(parts[1] || '');
    } else if (cleanHash.startsWith('label/')) {
      view = 'label';
      params.labelName = decodeURIComponent(parts[1] || '');
    } else if (cleanHash.startsWith('settings/')) {
      view = 'settings';
    } else if (parts.length === 2 && /^[a-zA-Z0-9_\-]+$/i.test(parts[1])) {
      // e.g. #inbox/ID, #sent/ID, #starred/ID
      view = 'thread';
      params.threadId = parts[1];
    } else if (parts.length === 1 && !systemLabels.includes(parts[0]) && /^[a-zA-Z0-9_\-]+$/i.test(parts[0])) {
      // Just the ID, not a system label
      view = 'thread';
      params.threadId = parts[0];
    }

    return {
      view,
      params,
      hash: cleanHash,
    };
  }

  private handleHashChange(): void {
    const hash = window.location.hash;
    const route = this.parseRoute(hash);
    const prevRoute = this.currentRoute;
    this.currentRoute = route;

    // ... (existing getBase logic) ...
    const getBase = (r: any) => {
        if (!r) return '';
        if (r.view === 'search') return 'search';
        if (r.view === 'settings') return 'settings';
        return r.hash.split('/')[0] || 'inbox';
    };

    const currentBase = getBase(route);
    const prevBase = getBase(prevRoute);
    const labelChanged = prevBase !== currentBase;
    const isListView = route.view !== 'thread' && route.view !== 'unknown';

    // Update global state
    stateManager.update(state => {
        const pendingId = state.ui.pendingActiveId;
        const newThreadId = route.params.threadId || null;
        let newThreads = state.threads;

        // ID MIGRATION: 
        if (pendingId && newThreadId && pendingId !== newThreadId) {
            console.log(`[Router] Migrating ID from ${pendingId} to ${newThreadId}`);
            const threadData = state.threads.get(pendingId);
            if (threadData) {
                newThreads = new Map(state.threads);
                // To preserve order, we map keys
                const newOrderedMap = new Map();
                for (const [key, val] of state.threads) {
                    if (key === pendingId) {
                        newOrderedMap.set(newThreadId, { ...val, id: newThreadId });
                    } else {
                        newOrderedMap.set(key, val);
                    }
                }
                newThreads = newOrderedMap;
                console.log('[Router] ID Migration successful');
            } else {
                console.warn('[Router] ID Migration failed: pendingId not found in state threads');
            }
        }

        return {
            ui: {
                ...state.ui,
                currentView: route.view === 'unknown' ? 'inbox' : (route.view as any),
                selectedThreadId: newThreadId,
                pendingActiveId: null, // Always clear after migration attempt
                isLoading: labelChanged && isListView ? true : state.ui.isLoading,
            },
            threads: labelChanged && isListView ? new Map() : newThreads
        };
    });

    this.notify(route);
  }

  /**
   * Subscribe to route changes.
   */
  subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    if (this.currentRoute) {
      listener(this.currentRoute);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(route: GmailRoute): void {
    this.listeners.forEach((listener) => listener(route));
  }
}

export const gmailRouter = new GmailRouter();