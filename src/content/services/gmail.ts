import { GmailSelectors } from '../../types/gmail';
import { EmailThread } from '../../types/email';
import { dom } from '../utils/dom';
import { stateManager } from '../core/state';

// Gmail class constants (obfuscated classes that are relatively stable or widely known)
export const GMAIL_SELECTORS: GmailSelectors = {
  mainContainer: '[role="main"]',
  leftSidebar: '[role="navigation"]',
  topHeader: 'header',
  
  // Table rows
  threadList: '.Cp table', // Main table
  threadRow: 'tr.zA', // Email row
  
  // Content inside row
  threadSubject: '.bog', // Subject container
  threadSender: '.yW', // Sender name
  threadSnippet: '.y2', // Preview text
  threadDate: '.xW', // Date/Time
  
  // Attributes
  threadIdAttr: 'data-thread-id',
  legacyThreadIdAttr: 'data-legacy-thread-id'
} as any;

export class GmailService {
  /**
   * Parse the email thread list from the DOM.
   */
  getThreadsOnPage(): EmailThread[] {
    // Try primary selector first
    let rows = dom.queryAll(GMAIL_SELECTORS.threadRow);
    
    // Fallback: Try generic role="row" that looks like an email
    if (rows.length === 0) {
      console.log('[GmailService] Primary selector failed, trying fallback...');
      // Look for rows with a checkbox, which usually indicates an item
      rows = dom.queryAll('tr[role="row"]'); // Very broad, might need filtering
      rows = rows.filter(r => r.querySelector('[role="checkbox"]'));
    }

    console.log(`[GmailService] Found ${rows.length} thread rows.`);
    return rows.map((row) => this.parseThreadRow(row)).filter(Boolean) as EmailThread[];
  }

  /**
   * Syncs the current page's threads to the global state.
   */
  syncThreads(): void {
    const threads = this.getThreadsOnPage();
    // console.log(`[GmailService] Parsed ${threads.length} valid threads.`);
    
    stateManager.update(state => {
        const currentThreads = state.threads;
        const newThreadMap = new Map(currentThreads);

        threads.forEach(t => {
            const existing = currentThreads.get(t.id);
            if (existing) {
                // Merge: Preserve messages and detailed info from opened view
                newThreadMap.set(t.id, {
                    ...existing,
                    ...t, // Update list props (unread, starred, snippet)
                    messages: existing.messages.length > 0 ? existing.messages : t.messages,
                    subject: existing.subject !== 'Loading subject...' ? existing.subject : t.subject
                });
            } else {
                newThreadMap.set(t.id, t);
            }
        });

        return {
            threads: newThreadMap,
            ui: { ...state.ui, isLoading: false }
        };
    });
  }

  private parseThreadRow(row: HTMLElement): EmailThread | null {
    try {
      let id = row.getAttribute('data-thread-id') || row.getAttribute('data-legacy-thread-id') || '';
      
      // Fallback ID extraction logic
      if (!id && row.id) id = row.id;
      if (!id) {
        const input = row.querySelector('input[name="t"]');
        if (input) id = input.getAttribute('value') || '';
      }

      if (!id) return null;

      // Selectors within the row
      const subjectEl = row.querySelector('.bog');
      const senderEl = row.querySelector('.yW');
      const snippetEl = row.querySelector('.y2');
      // Date is usually the last cell
      const dateEl = row.querySelector('.xW') || row.querySelector('.yE');
      
      const isUnread = row.classList.contains('zE'); 
      const isStarred = !!row.querySelector('[aria-label="Starred"]');

      // Avatar Parsing
      let avatarUrl: string | undefined;
      
      // Strategy 1: Look for any image with a google profile URL pattern
      const images = Array.from(row.querySelectorAll('img'));
      const profileImg = images.find(img => {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
          return src.includes('googleusercontent.com') || src.includes('/photos/');
      });
      
      if (profileImg) {
          avatarUrl = profileImg.getAttribute('src') || profileImg.getAttribute('data-src') || undefined;
      }

      // Strategy 2: Standard selectors if Strategy 1 failed
      if (!avatarUrl) {
          const avatarEl = row.querySelector('.oZ-x3 img') || row.querySelector('.bA img');
          if (avatarEl) {
              avatarUrl = avatarEl.getAttribute('src') || avatarEl.getAttribute('data-src') || undefined;
          }
      }
      
      // Validation
      if (avatarUrl && (avatarUrl.includes('cleardot') || avatarUrl.includes('transparent'))) {
          avatarUrl = undefined;
      }

      // DEBUG: Log avatar info for first row
      if (!(window as any)['__fi_logged_avatar']) {
          console.log('[GmailService] Extracted URL:', avatarUrl);
          (window as any)['__fi_logged_avatar'] = true;
      }

      // Sender Parsing
      let senderName = 'Unknown';
      let senderEmail = '';

      if (senderEl) {
        const nameSpan = senderEl.querySelector('span[name]') || senderEl.querySelector('span[email]');
        if (nameSpan) {
            senderName = nameSpan.textContent || '';
            senderEmail = nameSpan.getAttribute('email') || '';
        } else {
            senderName = senderEl.textContent || '';
            // Sometimes email is in 'email' attr of the parent or senderEl itself
            senderEmail = senderEl.getAttribute('email') || '';
        }
      }

      // Date Parsing
      const dateText = dateEl ? (dateEl.getAttribute('title') || dateEl.textContent || '') : '';

      // Snippet Parsing
      let snippet = snippetEl?.textContent || '';
      snippet = snippet.replace(/^ - /, '');

      return {
        id,
        subject: subjectEl?.textContent?.trim() || '(No Subject)',
        snippet: snippet.trim(),
        from: {
            name: senderName.trim(),
            email: senderEmail.trim(), 
            avatarUrl, 
        },
        date: dateText,
        isUnread,
        isStarred,
        lastMessageAt: Date.now(), 
        participantCount: 1,
        messages: [],
        labels: [],
      } as any; 
    } catch (e) {
      console.warn('Failed to parse thread row', e);
      return null;
    }
  }

  /**
   * Attempt to expand all messages in the open thread view.
   */
  async expandThread(): Promise<void> {
    // 1. Try "Expand all" button (usually img with alt="Expand all")
    const expandAllBtn = dom.query('img[alt="Expand all"], img[aria-label="Expand all"]');
    if (expandAllBtn && dom.isInViewport(expandAllBtn)) {
        console.log('[GmailService] Clicking "Expand all"');
        expandAllBtn.click();
        return new Promise(resolve => setTimeout(resolve, 1000)); // Wait for render
    }

    // 2. Try clicking individual collapsed messages
    // Collapsed rows often have class 'kQ' or contain 'span.adx' (though adx is usually quotes)
    // Actually, collapsed *messages* in a thread are often div.kv (summary) inside a wrapper
    // We want to turn them into div.h7 (open)
    const collapsedMessages = dom.queryAll('[role="listitem"] img[src*="cleardot"]'); // The toggle often has a cleardot
    // This is hard to pinpoint generically.
    // Better strategy: Look for the specific "number of hidden messages" circle if it exists?
    
    // Let's rely on the Expand All button for now as it's standard for grouped threads.
    
    return Promise.resolve();
  }

  /**
   * Parse the currently opened thread view for messages.
   */
  getOpenedThreadData(): { messages: any[], subject: string } {
    // Subject
    const subjectEl = dom.query('.hP');
    const subject = subjectEl?.textContent || '';

    // Selectors for message containers
    let messageEls = dom.queryAll('.adn, [role="listitem"]'); 
    
    // ... (Fallback logic)
    if (messageEls.length === 0) {
        const bodies = dom.queryAll('.a3s'); 
        if (bodies.length > 0) {
            console.log('[GmailService] Found bodies via .a3s, traversing up...');
            messageEls = bodies.map(b => b.closest('.gs') || b.closest('.adn') || b.closest('[role="listitem"]')).filter(Boolean) as HTMLElement[];
            // Dedupe elements
            messageEls = Array.from(new Set(messageEls));
        }
    }

    console.log(`[GmailService] found ${messageEls.length} potential message elements.`);
    
    // Parse
    const messages = this.parseMessagesFromEls(messageEls);
    
    // Deduplicate messages based on body content (simple check)
    // Gmail often has collapsed versions.
    const uniqueMessages: any[] = [];
    const seenBodies = new Set<string>();
    
    messages.forEach(msg => {
        // Use a snippet as key to detect dupe
        const key = msg.body.substring(0, 50) + msg.date; 
        if (!seenBodies.has(key)) {
            seenBodies.add(key);
            uniqueMessages.push(msg);
        }
    });

    return { messages: uniqueMessages, subject };
  }

  private parseMessagesFromEls(messageEls: HTMLElement[]): any[] {
    const results = messageEls.map(el => {
      // Sender: .gD (name), email in 'email' attr
      const senderEl = el.querySelector('.gD') || el.querySelector('.qu'); 
      // ...
      const emailEl = el.querySelector('.gD'); 
      // Date: .g3
      const dateEl = el.querySelector('.g3') || el.querySelector('.xW'); 
      // Body: .a3s (content)
      const bodyEl = el.querySelector('.a3s') || el.querySelector('.ii.gt'); 
      
      let body = '';
      if (bodyEl) {
          // Clone to modify
          const clone = bodyEl.cloneNode(true) as HTMLElement;
          
          // 1. Remove "Show trimmed content" buttons
          const expanders = clone.querySelectorAll('[aria-label="Show trimmed content"], .adM, .ajR, .mq');
          expanders.forEach(btn => btn.remove());

          // 2. Unhide hidden content (.adL, .im, etc)
          // Gmail uses 'display: none' in style attribute or classes
          const hidden = clone.querySelectorAll('.adL, .im, [style*="display: none"]');
          hidden.forEach(h => {
              (h as HTMLElement).style.display = 'block';
              h.classList.remove('adL', 'im'); // Remove obfuscated classes that might hide it
          });
          
          body = clone.innerHTML;
      }
      
      const name = senderEl?.textContent || 'Unknown';
      
      // Avatar?
      const avatarImg = el.querySelector('.bA img') || el.querySelector('.yf img') || el.querySelector('img.bA');
      const avatarUrl = avatarImg?.getAttribute('src');

      if (!body) {
          // console.log('[GmailService] Skipping message with no body (header?)');
          return null; 
      }

      return {
        id: Math.random().toString(), 
        from: { name, email, avatarUrl },
        date,
        body,
        snippet: bodyEl?.textContent?.substring(0, 100) || ''
      };
    });
    
    const valid = results.filter(Boolean);
    console.log(`[GmailService] Valid messages parsed: ${valid.length} out of ${messageEls.length}`);
    return valid;
  }

  /**
   * Observe the thread list for changes (new emails arriving, scrolling).
   */
  observeThreadList(): () => void {
    const threadListTable = document.querySelector('.Cp table');
    // Often the table wrapper is '.Cp' or '.AO'
    const container = document.querySelector('.AO'); 

    if (!container) {
      console.warn('[GmailService] Could not find thread list container to observe.');
      return () => {};
    }

    // Debounced sync
    let timeout: any;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => this.syncThreads(), 200);
    });

    observer.observe(container, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['class', 'aria-checked'] // Watch for read/unread/select changes
    });

    return () => observer.disconnect();
  }
}

export const gmailService = new GmailService();