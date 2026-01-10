import { GmailRoute, GmailView } from '../../types/gmail';
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

    if (!cleanHash || cleanHash === 'inbox') {
      view = 'inbox';
    } else if (cleanHash.startsWith('search/')) {
      view = 'search';
      params.query = decodeURIComponent(parts[1] || '');
    } else if (cleanHash.startsWith('label/')) {
      view = 'label';
      params.labelName = decodeURIComponent(parts[1] || '');
    } else if (cleanHash.startsWith('settings/')) {
      view = 'settings';
    } else if (parts.length === 2 && /^[a-zA-Z0-9_\-]+$/i.test(parts[1])) {
      // Thread view e.g. #inbox/FMfcgzQ...
      view = 'thread';
      params.threadId = parts[1];
    } else if (parts.length === 1 && /^[a-zA-Z0-9_\-]+$/i.test(parts[0])) {
      // Some thread views are just the ID
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
    const route = this.parseRoute(window.location.hash);
    console.log('[Router] Hash changed:', window.location.hash, 'Parsed:', route);
    this.currentRoute = route;

    // Update global state
    stateManager.setUI({
      currentView: route.view === 'unknown' ? 'inbox' : (route.view as any),
      selectedThreadId: route.params.threadId || null,
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