import { GmailSelectors } from '../../types/gmail';
import { EmailThread } from '../../types/email';
import { dom } from '../utils/dom';
import { stateManager } from '../core/state';

// Gmail class constants
export const GMAIL_SELECTORS: GmailSelectors = {
  mainContainer: '[role="main"]',
  leftSidebar: '[role="navigation"]',
  topHeader: 'header',
  threadList: '.Cp table',
  threadRow: 'tr.zA',
  threadSubject: '.bog',
  threadSender: '.yW',
  threadSnippet: '.y2',
  threadDate: '.xW',
  threadIdAttr: 'data-thread-id',
  legacyThreadIdAttr: 'data-legacy-thread-id'
} as any;

export class GmailService {
  /**
   * Parse the email thread list from the DOM.
   */
  getThreadsOnPage(): EmailThread[] {
    const mains = Array.from(document.querySelectorAll('[role="main"]')) as HTMLElement[];
    const activeMain = mains.find(m => m.offsetHeight > 0) || mains[0];

    if (!activeMain) return [];

    let rows = Array.from(activeMain.querySelectorAll('tr.zA')) as HTMLElement[];

    if (rows.length === 0) {
      rows = Array.from(activeMain.querySelectorAll('tr[role="row"]')).filter(r =>
        r.querySelector('[role="checkbox"]')
      ) as HTMLElement[];
    }

    const visibleRows = rows.filter(row => row.offsetHeight > 0);

    return visibleRows.map(row => this.parseThreadRow(row)).filter(Boolean) as EmailThread[];
  }

  /**
   * Syncs the current page's threads to the global state.
   */
  syncThreads(): void {
    const view = stateManager.get().ui.currentView;
    const threads = this.getThreadsOnPage();

    const listViewTypes = [
      'inbox',
      'search',
      'label',
      'starred',
      'sent',
      'drafts',
      'trash',
      'all',
      'spam',
      'imp',
      'chats',
      'category',
      'unknown'
    ];
    const isListView = listViewTypes.includes(view);

    stateManager.update(state => {
      const currentThreads = state.threads;

      const threadsChanged =
        threads.length !== currentThreads.size ||
        threads.some(t => {
          const existing = currentThreads.get(t.id);
          return (
            !existing ||
            existing.isUnread !== t.isUnread ||
            existing.isStarred !== t.isStarred ||
            existing.participantCount !== t.participantCount
          ); // Sync if count changed
        });

      if (!threadsChanged && isListView) return {};

      let newThreadMap: Map<string, EmailThread>;

      if (isListView) {
        newThreadMap = new Map();
        threads.forEach(t => {
          const existing = currentThreads.get(t.id);
          if (existing) {
            newThreadMap.set(t.id, {
              ...existing,
              ...t,
              messages: existing.messages.length > 0 ? existing.messages : t.messages,
              subject: existing.subject !== 'Loading subject...' ? existing.subject : t.subject
            });
          } else {
            newThreadMap.set(t.id, t);
          }
        });
      } else {
        newThreadMap = new Map(currentThreads);
        threads.forEach(t => {
          const existing = currentThreads.get(t.id);
          if (existing) {
            newThreadMap.set(t.id, { ...existing, ...t });
          }
        });
      }

      return {
        threads: newThreadMap,
        ui: { ...state.ui, isLoading: false }
      };
    });
  }

  private parseThreadRow(row: HTMLElement): EmailThread | null {
    try {
      // 1. Try data-thread-id (Canonical ID for URLs)
      let id = row.getAttribute('data-thread-id') || row.getAttribute('data-legacy-thread-id');
      
      // 2. Fallback to row links (extracting from href="#inbox/ID")
      if (!id) {
          const link = row.querySelector('a[href*="#"]') as HTMLAnchorElement;
          if (link) {
              const href = link.getAttribute('href') || '';
              id = href.split('/').pop() || '';
          }
      }

      // 3. Last resort fallback
      if (!id) id = row.id;

      if (!id || id.length < 3 || id.includes('?')) return null;
      const subjectEl = row.querySelector('.bog');
      const senderEl = row.querySelector('.yW');
      const snippetEl = row.querySelector('.y2');
      const dateEl = row.querySelector('.xW') || row.querySelector('.yE');

      const isUnread = row.classList.contains('zE');
      const isStarred = !!row.querySelector('[aria-label="Starred"]');

      let senderName = 'Unknown';
      let senderEmail = '';

      if (senderEl) {
        const nameSpan = senderEl.querySelector('span[name]') || senderEl.querySelector('span[email]');
        if (nameSpan) {
          senderName = nameSpan.textContent || '';
          senderEmail = nameSpan.getAttribute('email') || '';
        } else {
          senderName = senderEl.textContent || '';
          senderEmail = senderEl.getAttribute('email') || '';
        }
      }

      // Date Parsing
      const dateText = dateEl ? dateEl.getAttribute('title') || dateEl.textContent || '' : '';

                  // Thread Count Parsing

                  // 1. Find the parent TD container

                  const countContainer = row.querySelector('td.yX.xY.ulKHrd');

                  // 2. Find the specific count element within that container

                  const countEl = countContainer?.querySelector('span.bx0') || 

                                  row.querySelector('.ru, .Y2, .bsU');

                  

                  const countMatch = countEl?.textContent?.match(/\d+/);

                  const participantCount = countMatch ? parseInt(countMatch[0], 10) : 1;

      console.log(`[GmailService] Found thread with ${participantCount} messages: ${id}`);

      let snippet = snippetEl?.textContent || '';
      snippet = snippet.replace(/^ - /, '');

      return {
        id,
        subject: subjectEl?.textContent?.trim() || '(No Subject)',
        snippet: snippet.trim(),
        from: {
          name: senderName.trim(),
          email: senderEmail.trim()
        },
        date: dateText,
        isUnread,
        isStarred,
        lastMessageAt: Date.now(),
        participantCount,
        messages: [],
        labels: []
      } as any;
    } catch (e) {
      console.warn('Failed to parse thread row', e);
      return null;
    }
  }

  async expandThread(): Promise<void> {
    const expandAllBtn = dom.query('img[alt="Expand all"], img[aria-label="Expand all"]') as HTMLElement;
    if (expandAllBtn && dom.isInViewport(expandAllBtn)) {
      expandAllBtn.click();
      return new Promise(resolve => setTimeout(resolve, 1500));
    }

    const legacyCollapsed = dom.queryAll('.kQ, .kv');
    if (legacyCollapsed.length > 0) {
      legacyCollapsed.forEach(el => (el as HTMLElement).click());
      return new Promise(resolve => setTimeout(resolve, 1500));
    }

    return Promise.resolve();
  }

  getOpenedThreadData(): { messages: any[]; subject: string } {
    const subjectEl = dom.query('.hP');
    const subject = subjectEl?.textContent || '';

    let messageEls = dom.queryAll('.adn, [role="listitem"]');

    if (messageEls.length === 0) {
      const bodies = dom.queryAll('.a3s');
      if (bodies.length > 0) {
        messageEls = bodies
          .map(b => b.closest('.gs') || b.closest('.adn') || b.closest('[role="listitem"]'))
          .filter(Boolean) as HTMLElement[];
        messageEls = Array.from(new Set(messageEls));
      }
    }

    const messages = this.parseMessagesFromEls(messageEls);

    const uniqueMessages: any[] = [];
    const seenBodies = new Set<string>();

    messages.forEach(msg => {
      const key = msg.body.substring(0, 50) + msg.date;
      if (!seenBodies.has(key)) {
        seenBodies.add(key);
        uniqueMessages.push(msg);
      }
    });

    return { messages: uniqueMessages, subject };
  }

  private parseMessagesFromEls(messageEls: HTMLElement[]): any[] {
    return messageEls
      .map(el => {
        const senderEl = el.querySelector('.gD') || el.querySelector('.qu');
        const dateEl = el.querySelector('.g3') || el.querySelector('.xW');
        const bodyEl = el.querySelector('.a3s') || el.querySelector('.ii.gt');

        let body = '';
        if (bodyEl) {
          const clone = bodyEl.cloneNode(true) as HTMLElement;
          const hidden = clone.querySelectorAll(
            '.adL, .im, [style*="display:none"], [style*="display: none"]'
          );
          hidden.forEach(h => {
            (h as HTMLElement).style.setProperty('display', 'block', 'important');
            (h as HTMLElement).style.setProperty('visibility', 'visible', 'important');
            (h as HTMLElement).style.setProperty('height', 'auto', 'important');
            h.classList.remove('adL', 'im');
          });
          const expanders = clone.querySelectorAll('[aria-label="Show trimmed content"], .adM, .ajR, .mq');
          expanders.forEach(btn => btn.remove());
          body = clone.innerHTML;
        }

        const name = senderEl?.textContent || 'Unknown';
        const email = senderEl?.getAttribute('email') || '';
        const date = dateEl?.getAttribute('title') || dateEl?.textContent || '';

        if (!body) return null;

        return {
          id: Math.random().toString(),
          from: { name, email },
          date,
          body,
          snippet: bodyEl?.textContent?.substring(0, 100) || ''
        };
      })
      .filter(Boolean);
  }

  public isSyncingEnabled = true;

  observeThreadList(): () => void {
    const container = document.body;

    let timeout: any;
    const observer = new MutationObserver(mutations => {
      if (!this.isSyncingEnabled) return;

      const isRelevant = mutations.some(m => {
        const target = m.target as HTMLElement;
        return target.closest?.('[role="main"]') || target.getAttribute?.('role') === 'main';
      });

      if (isRelevant) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.syncThreads();
        }, 500);
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-checked', 'data-thread-id']
    });

    return () => observer.disconnect();
  }
}

export const gmailService = new GmailService();
