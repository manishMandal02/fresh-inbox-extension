import { EmailThread } from '../../../types/email';
import { dom } from '../../utils/dom';
import { format } from '../../utils/format';
import { icons } from '../icons';

export class EmailCard {
  element: HTMLElement;
  private currentThreadId: string = '';

  constructor() {
    this.element = this.createDOM();
  }

  private createDOM(): HTMLElement {
    const el = dom.create('div', { classes: ['fi-email-card'] });
    el.innerHTML = `
      <div class="fi-card-avatar"></div>
      <div class="fi-card-content">
        <div class="fi-card-sender"></div>
        <div class="fi-card-subject"></div>
        <div class="fi-card-snippet"></div>
      </div>
      <div class="fi-card-meta">
        <span class="fi-card-date"></span>
        <div class="fi-card-actions">
           <button class="fi-action-btn" title="Archive" data-action="archive">${icons.archive}</button>
           <button class="fi-action-btn" title="Delete" data-action="delete">${icons.trash}</button>
           <button class="fi-action-btn" title="Mark as read" data-action="read">${icons.mail}</button>
        </div>
      </div>
    `;
    return el;
  }

  update(thread: EmailThread, isSelected: boolean, isActive: boolean): void {
    if (this.currentThreadId === thread.id && !isSelected && !isActive) {
      // Optimization: Skip if data is same
    }

    this.currentThreadId = thread.id;
    this.element.setAttribute('data-id', thread.id);

    // Toggle Classes
    this.element.classList.toggle('fi-selected', isSelected);
    this.element.classList.toggle('fi-active', isActive);
    this.element.classList.toggle('fi-unread', thread.isUnread);

    // Update Content
    const avatarEl = this.element.querySelector('.fi-card-avatar') as HTMLElement;
    const senderEl = this.element.querySelector('.fi-card-sender') as HTMLElement;
    const subjectEl = this.element.querySelector('.fi-card-subject') as HTMLElement;
    const snippetEl = this.element.querySelector('.fi-card-snippet') as HTMLElement;
    const dateEl = this.element.querySelector('.fi-card-date') as HTMLElement;

    // Use parsed data
    const senderName = (thread as any).from?.name || 'Unknown';
    const avatarUrl = (thread as any).from?.avatarUrl;
    const dateText = (thread as any).date || '';

    // Avatar Logic
    if (avatarUrl && avatarUrl.indexOf('cleardot') === -1) {
      // Ignore cleardot (transparent spacer)
      avatarEl.style.backgroundImage = `url(${avatarUrl})`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.textContent = '';
      avatarEl.style.backgroundColor = 'transparent';
    } else {
      const initial = (senderName[0] || '?').toUpperCase();
      avatarEl.textContent = initial;
      avatarEl.style.backgroundColor = format.avatarColor(senderName);
      avatarEl.style.color = '#fff';
      avatarEl.style.backgroundImage = 'none';
    }

    senderEl.textContent = senderName;
    subjectEl.textContent = thread.subject;
    snippetEl.textContent = thread.snippet;
    dateEl.textContent = dateText;
  }
}
