import { EmailThread } from '../../../../types/email';
import { dom } from '../../utils/dom';
import { sha256 } from '../../utils/crypto';
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
      <div class="fi-card-content">
        <div class="fi-card-sender-row">
          <span class="fi-card-sender"></span>
          <span class="fi-card-count"></span>
          <span class="fi-card-star-indicator" title="Pinned">${icons.starFilled}</span>
        </div>
        <div class="fi-card-subject"></div>
        <div class="fi-card-snippet"></div>
      </div>
      <div class="fi-card-meta">
        <span class="fi-card-date"></span>
        <div class="fi-card-actions">
           <button class="fi-action-btn" title="Pin" data-action="star">${icons.star}</button>
           <button class="fi-action-btn" title="Archive" data-action="archive">${icons.archive}</button>
           <button class="fi-action-btn" title="Delete" data-action="delete">${icons.trash}</button>
           <button class="fi-action-btn" title="Remind Later" data-action="snooze">${icons.snooze}</button>
           <button class="fi-action-btn fi-btn-read-toggle" title="Mark Read/Unread" data-action="read"></button>
        </div>
      </div>
    `;
    return el;
  }

  update(thread: EmailThread | null, isSelected: boolean, isActive: boolean) {
    const senderEl = this.element.querySelector('.fi-card-sender') as HTMLElement;
    const countEl = this.element.querySelector('.fi-card-count') as HTMLElement;
    const subjectEl = this.element.querySelector('.fi-card-subject') as HTMLElement;
    const snippetEl = this.element.querySelector('.fi-card-snippet') as HTMLElement;
    const dateEl = this.element.querySelector('.fi-card-date') as HTMLElement;
    const actionsEl = this.element.querySelector('.fi-card-actions') as HTMLElement;
    const starIndicator = this.element.querySelector('.fi-card-star-indicator') as HTMLElement;
    const readToggleBtn = this.element.querySelector('.fi-btn-read-toggle') as HTMLElement;
    const starActionBtn = this.element.querySelector('[data-action="star"]') as HTMLElement;

    if (!thread) {
        this.element.classList.add('fi-card-skeleton');
        this.element.classList.remove('fi-unread', 'fi-selected', 'fi-active');
        senderEl.innerHTML = '<div class="fi-skeleton" style="width: 80px; height: 12px;"></div>';
        countEl.style.display = 'none';
        subjectEl.innerHTML = '<div class="fi-skeleton" style="width: 150px; height: 10px;"></div>';
        snippetEl.innerHTML = '<div class="fi-skeleton" style="width: 200px; height: 8px;"></div>';
        dateEl.innerHTML = '<div class="fi-skeleton" style="width: 30px; height: 8px;"></div>';
        actionsEl.style.display = 'none';
        starIndicator.style.display = 'none';
        return;
    }

    this.element.classList.remove('fi-card-skeleton');
    actionsEl.style.display = ''; 
    
    this.currentThreadId = thread.id;
    this.element.setAttribute('data-id', thread.id);
    this.element.classList.toggle('fi-selected', isSelected);
    this.element.classList.toggle('fi-active', isActive);
    this.element.classList.toggle('fi-unread', thread.isUnread);

    // Star/Pin logic
    starIndicator.style.display = thread.isStarred ? 'flex' : 'none';
    starActionBtn.innerHTML = thread.isStarred ? icons.starFilled : icons.star;
    starActionBtn.classList.toggle('fi-starred', thread.isStarred);

    // Read Toggle State
    readToggleBtn.innerHTML = thread.isUnread ? icons.mail : icons.mailOpen;
    readToggleBtn.title = thread.isUnread ? 'Mark as Read' : 'Mark as Unread';

    const senderName = (thread as any).from?.name || 'Unknown';
    const dateText = (thread as any).date || '';
    const count = thread.participantCount || 1;
    
    senderEl.textContent = senderName;
    countEl.textContent = count > 1 ? count.toString() : '';
    countEl.style.display = count > 1 ? 'inline-block' : 'none';
    
    subjectEl.textContent = thread.subject;
    snippetEl.textContent = thread.snippet;
    dateEl.textContent = dateText;
  }
}