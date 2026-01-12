import { dom } from '../../utils/dom';
import { stateManager } from '../../core/state';
import { EmailThread } from '../../../types/email';
import { icons } from '../icons';
import { gmailActions } from '../../services/actions';
import { toast } from '../toast';
import { gmailService } from '../../services/gmail';

export class ThreadPanel {
  element: HTMLElement;
  private currentThreadId: string | null = null;
  private isPerformingAction = false;

  constructor() {
    this.element = this.createDOM();
    this.initListeners();
  }

  private createDOM(): HTMLElement {
    const el = dom.create('div', { classes: ['fi-thread-content'] });
    el.innerHTML = `
      <header class="fi-thread-header">
        <div class="fi-thread-actions-left">
          <button class="fi-btn-icon" id="fi-close-thread" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
          </button>
        </div>
        <div class="fi-thread-actions-right">
          <button class="fi-btn-icon fi-action-star" title="Pin">${icons.star}</button>
          <button class="fi-btn-icon fi-action-archive" title="Archive">${icons.archive}</button>
          <button class="fi-btn-icon fi-action-delete" title="Delete">${icons.trash}</button>
          <button class="fi-btn-icon fi-action-snooze" title="Remind Later">${icons.snooze}</button>
          <button class="fi-btn-icon fi-action-read" title="Mark Unread">${icons.mail}</button>
        </div>
      </header>
      <div class="fi-thread-scroll-area">
        <h1 class="fi-thread-subject"></h1>
        <div class="fi-messages-list"></div>
      </div>
    `;
    return el;
  }

  private initListeners() {
    stateManager.subscribe(state => {
      const threadId = state.ui.selectedThreadId;
      // console.log('[ThreadPanel] State selectedThreadId:', threadId);
      if (threadId) {
        this.currentThreadId = threadId;
        const thread = state.threads.get(threadId);
        if (thread) {
          this.renderThread(thread);
        } else {
          this.renderLoading();
        }
      } else {
        this.currentThreadId = null;
      }
    });

    this.element.querySelector('#fi-close-thread')?.addEventListener('click', () => this.close());

    this.element
      .querySelector('.fi-action-archive')
      ?.addEventListener('click', () => this.handleAction('archive'));
    this.element
      .querySelector('.fi-action-delete')
      ?.addEventListener('click', () => this.handleAction('delete'));
    this.element.querySelector('.fi-action-read')?.addEventListener('click', () => this.handleAction('read'));
    this.element
      .querySelector('.fi-action-snooze')
      ?.addEventListener('click', () => this.handleAction('snooze'));
    this.element.querySelector('.fi-action-star')?.addEventListener('click', () => this.handleAction('star'));

    document.addEventListener(
      'keydown',
      e => {
        if (e.key === 'Escape' && stateManager.get().ui.selectedThreadId) {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        }
      },
      true
    ); // Use capture phase to catch it first
  }

  private async handleAction(action: 'archive' | 'delete' | 'read' | 'snooze' | 'star') {
    if (!this.currentThreadId || this.isPerformingAction) return;
    this.isPerformingAction = true;

    // Trigger the Gmail action.
    const actionSuccess = gmailActions.performOpenedAction(action);

    if (actionSuccess) {
      if (action === 'snooze') {
        toast.success('Select a time to remind you');
      } else {
        toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)}d`);
      }

      if (action !== 'read' && action !== 'star') {
        this.close();
        stateManager.update(state => {
          const newThreads = new Map(state.threads);
          newThreads.delete(this.currentThreadId!);

          return { threads: newThreads };
        });
      }
    } else {
      toast.error('Gmail action failed');
    }

    setTimeout(() => {
      this.isPerformingAction = false;
    }, 500);
  }

  private close() {
    // SINGLE SOURCE OF TRUTH: Just change the URL.
    // The GmailRouter will detect this, set selectedThreadId to null,
    // and this panel will slide closed automatically via the state subscription.
    const hash = window.location.hash;
    if (hash.includes('/')) {
      window.location.hash = hash.substring(0, hash.lastIndexOf('/'));
    } else {
      window.location.hash = '#inbox';
    }
  }

  private renderLoading() {
    const subjectEl = this.element.querySelector('.fi-thread-subject')!;
    const listEl = this.element.querySelector('.fi-messages-list')!;

    subjectEl.innerHTML = `<div class="fi-skeleton fi-skeleton-title"></div>`;
    listEl.innerHTML = `
      <div class="fi-message-card">
        <div class="fi-message-header">
          <div class="fi-meta">
            <div class="fi-skeleton fi-skeleton-header"></div>
            <div class="fi-skeleton fi-skeleton-header" style="width: 20%"></div>
          </div>
        </div>
        <div class="fi-skeleton fi-skeleton-text"></div>
        <div class="fi-skeleton fi-skeleton-text"></div>
        <div class="fi-skeleton fi-skeleton-text" style="width: 80%"></div>
      </div>
    `;
  }

  private renderThread(thread: EmailThread) {
    const subjectEl = this.element.querySelector('.fi-thread-subject')!;
    const listEl = this.element.querySelector('.fi-messages-list')!;

    subjectEl.textContent = thread.subject === 'Loading subject...' ? '' : thread.subject;
    if (thread.subject === 'Loading subject...') {
      subjectEl.innerHTML = `<div class="fi-skeleton fi-skeleton-title"></div>`;
    }

    if (thread.messages && thread.messages.length > 0) {
      // Prevent re-render if content is same (simple check)
      if (listEl.childElementCount === thread.messages.length && !listEl.querySelector('.fi-skeleton')) {
        return;
      }

      listEl.innerHTML = '';

      thread.messages.forEach((msg: any) => {
        const msgEl = dom.create('div', { classes: ['fi-message-card'] });

        msgEl.innerHTML = `
              <div class="fi-message-header">
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
      // If we have no messages but thread exists, show skeletons
      if (listEl.querySelector('.fi-skeleton')) return;
      this.renderLoading();
    }
  }

  render(): HTMLElement {
    return this.element;
  }
}

export const threadPanelContent = new ThreadPanel();
