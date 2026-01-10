import { dom } from '../../utils/dom';
import { stateManager } from '../../core/state';
import { EmailThread } from '../../../types/email';
import { icons } from '../icons';

export class ThreadPanel {
  element: HTMLElement;
  private currentThreadId: string | null = null;

  constructor() {
    this.element = this.createDOM();
    this.initListeners();
  }

  private createDOM(): HTMLElement {
    const el = dom.create('div', { classes: ['fi-thread-content'] });
    el.innerHTML = `
      <header class="fi-thread-header">
        <div class="fi-thread-actions-left">
          <button class="fi-btn-icon" id="fi-close-thread" title="Close">${icons.archive}</button> <!-- Using archive icon as placeholder for back/close or add generic back icon -->
        </div>
        <div class="fi-thread-actions-right">
          <button class="fi-btn-icon" title="Archive">${icons.archive}</button>
          <button class="fi-btn-icon" title="Delete">${icons.trash}</button>
          <button class="fi-btn-icon" title="Mark Unread">${icons.mail}</button>
        </div>
      </header>
      <div class="fi-thread-scroll-area">
        <h1 class="fi-thread-subject"></h1>
        <div class="fi-thread-labels"></div>
        <div class="fi-messages-list">
           <!-- Messages go here -->
        </div>
      </div>
    `;

    // Fix Close Icon
    el.querySelector(
      '#fi-close-thread'
    )!.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>`; // X icon

    return el;
  }

  private initListeners() {
    // State subscription
    stateManager.subscribe(state => {
      const threadId = state.ui.selectedThreadId;
      if (threadId) {
        // Always try to render if selected, data might have updated (e.g. messages loaded)
        this.currentThreadId = threadId;
        const thread = state.threads.get(threadId);

        if (thread) {
          // Optimization: Could check if data actually changed hash/timestamp
          this.renderThread(thread);
        } else {
          this.renderLoading();
        }
      } else {
        this.currentThreadId = null;
      }
    });

    // Close button
    this.element.querySelector('#fi-close-thread')?.addEventListener('click', () => {
      this.close();
    });

    // Global Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && stateManager.get().ui.selectedThreadId) {
        this.close();
      }
    });
  }

  private close() {
    stateManager.setUI({ selectedThreadId: null });
    this.currentThreadId = null;
    window.location.hash = '#inbox'; // Reset URL
  }

  private renderLoading() {
    const subjectEl = this.element.querySelector('.fi-thread-subject')!;
    const listEl = this.element.querySelector('.fi-messages-list')!;
    subjectEl.textContent = '';

    // CSS Spinner
    listEl.innerHTML = `
      <div style="display: flex; justify-content: center; padding: 40px;">
        <div class="fi-spinner"></div>
      </div>
    `;
  }

  private renderThread(thread: EmailThread) {
    // console.log('[ThreadPanel] Rendering thread:', thread.id, 'Messages:', thread.messages?.length);
    const subjectEl = this.element.querySelector('.fi-thread-subject')!;
    const listEl = this.element.querySelector('.fi-messages-list')!;

    // Update subject if changed
    if (subjectEl.textContent !== thread.subject) {
      subjectEl.textContent = thread.subject;
    }

    // Check if we have messages
    if (thread.messages && thread.messages.length > 0) {
      // Simple diff: If message count matches, assume it's the same for now to prevent flash
      if (listEl.childElementCount === thread.messages.length && !listEl.querySelector('.fi-spinner')) {
        return;
      }

      listEl.innerHTML = ''; // Clear previous/spinner

      // Render full conversation
      thread.messages.forEach((msg: any) => {
        const msgEl = dom.create('div', { classes: ['fi-message-card'] });

        // Avatar logic
        const senderName = msg.from?.name || '?';
        const initial = (senderName[0] || '?').toUpperCase();
        const avatarStyle = msg.from?.avatarUrl
          ? `background-image: url(${msg.from.avatarUrl}); background-color: transparent; color: transparent; background-size: cover;`
          : '';

        msgEl.innerHTML = `
              <div class="fi-message-header">
                <div class="fi-avatar" style="${avatarStyle}">${initial}</div>
                <div class="fi-meta">
                  <div class="fi-sender-name">${
                    msg.from?.name || 'Unknown'
                  } <span class="fi-sender-email">&lt;${msg.from?.email || ''}&gt;</span></div>
                  <div class="fi-message-date">${msg.date || ''}</div>
                </div>
              </div>
              <div class="fi-message-body">
                ${msg.body || '(No content)'}
              </div>
            `;
        listEl.appendChild(msgEl);
      });
    } else {
      // If no messages, Show Spinner!
      // Don't re-render spinner if already there
      if (listEl.querySelector('.fi-spinner')) return;

      listEl.innerHTML = `
          <div style="display: flex; justify-content: center; padding: 40px;">
            <div class="fi-spinner"></div>
          </div>
        `;
    }
  }

  render(): HTMLElement {
    return this.element;
  }
}

export const threadPanelContent = new ThreadPanel();
