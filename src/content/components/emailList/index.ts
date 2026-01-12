import { dom } from '../../utils/dom';
import { stateManager } from '../../core/state';
import { EmailCard } from './emailCard';
import { EmailThread } from '../../../types/email';
import { gmailActions } from '../../services/actions';
import { toast } from '../toast';

const MAX_EMAILS = 50;

export class EmailList {
  container: HTMLElement;
  private threads: EmailThread[] = [];

  constructor() {
    this.container = dom.create('div', { 
      classes: ['fi-list-container'],
      attributes: { tabindex: '0' } 
    });
    
    this.initListeners();
    this.initKeyboard();
  }

  private initListeners() {
    stateManager.subscribe(state => {
      if (state.ui.isLoading) {
          this.renderSkeletons();
          return;
      }

      this.threads = Array.from(state.threads.values()).slice(0, MAX_EMAILS);
      this.renderThreads(state.ui.selection, state.ui.selectedThreadId);
    });

    // Click Delegation
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // 1. Check for action buttons
      const actionBtn = target.closest('.fi-action-btn');
      const starBtn = target.closest('.fi-card-star-btn');
      const card = target.closest('.fi-email-card');
      
      if ((actionBtn || starBtn) && card) {
        e.stopPropagation(); 
        const id = card.getAttribute('data-id');
        const action = actionBtn?.getAttribute('data-action') || 'star';
        if (id && action) this.performAction(id, action, target);
        return;
      }
      
      if (card) {
        const id = card.getAttribute('data-id');
        if (id) {
          // BRIDGE: Save the local ID before navigation
          stateManager.setUI({ pendingActiveId: id });
          
          const gmailRow = document.querySelector(`tr[data-thread-id="${id}"]`) || 
                           document.querySelector(`tr[data-legacy-thread-id="${id}"]`) ||
                           document.getElementById(id); 
//...
                           
          if (gmailRow) {
              const opts = { bubbles: true, cancelable: true, view: window };
              gmailRow.dispatchEvent(new MouseEvent('mousedown', opts));
              gmailRow.dispatchEvent(new MouseEvent('mouseup', opts));
              (gmailRow as HTMLElement).click();
          } else {
              // Fallback to manual hash if row is missing
              window.location.hash = `#inbox/${id}`;
          }
        }
      }
    });
  }

  private renderThreads(selection: Set<string>, activeId: string | null) {
    this.container.innerHTML = '';
    
    this.threads.forEach(thread => {
        const card = new EmailCard();
        // Simple exact match now works because IDs are migrated to match the URL
        const isActive = activeId === thread.id;
        
        card.update(thread, selection.has(thread.id), isActive);
        this.container.appendChild(card.element);
    });
  }

  private renderSkeletons() {
    this.container.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const card = new EmailCard();
        card.update(null, false, false);
        this.container.appendChild(card.element);
    }
  }

  private async performAction(id: string, action: string, target: HTMLElement) {
    const success = gmailActions.selectThread(id, true);
    if (!success) {
      toast.error('Could not select thread');
      return;
    }

    await new Promise(r => setTimeout(r, 200));

    // 3. Click the toolbar button
    let actionSuccess = false;
    switch (action) {
      case 'archive':
        actionSuccess = gmailActions.archiveSelected();
        if (actionSuccess) toast.success('Thread archived');
        break;
      case 'delete':
        actionSuccess = gmailActions.deleteSelected();
        if (actionSuccess) toast.success('Thread deleted');
        break;
      case 'read':
        actionSuccess = gmailActions.markAsRead();
        if (actionSuccess) toast.success('Status updated');
        break;
      case 'snooze':
        actionSuccess = gmailActions.snooze();
        if (actionSuccess) toast.success('Select a time to remind you');
        break;
    }

    // Special case for Star (doesn't use toolbar in list usually)
    if (target.closest('.fi-card-star-btn')) {
        actionSuccess = gmailActions.toggleStar(id);
        if (actionSuccess) toast.success('Pin updated');
    }

    if (!actionSuccess && !target.closest('.fi-card-star-btn')) {
        toast.error(`Action failed`);
        return;
    }

    if (action === 'delete' || action === 'archive' || action === 'snooze') {
      stateManager.update(state => {
        const newThreads = new Map(state.threads);
        newThreads.delete(id);
        return { threads: newThreads };
      });
    }
  }

  private initKeyboard() {
    this.container.addEventListener('keydown', (e) => {
      const state = stateManager.get();
      const currentId = state.ui.selectedThreadId;
      const currentIndex = this.threads.findIndex(t => t.id === currentId);

      if (e.key === 'j' || e.key === 'ArrowDown') {
        const nextIndex = Math.min(this.threads.length - 1, currentIndex + 1);
        this.selectThreadAtIndex(nextIndex);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        const prevIndex = Math.max(0, currentIndex - 1);
        this.selectThreadAtIndex(prevIndex);
      } else if (e.key === 'x') {
        if (currentId) {
          const newSelection = new Set(state.ui.selection);
          if (newSelection.has(currentId)) {
            newSelection.delete(currentId);
            gmailActions.selectThread(currentId, false);
          } else {
            newSelection.add(currentId);
            gmailActions.selectThread(currentId, true);
          }
          stateManager.setUI({ selection: newSelection });
        }
      } else if (e.key === 'Enter') {
        if (currentId) window.location.hash = `#inbox/${currentId}`;
      }
    });
  }

  private selectThreadAtIndex(index: number) {
    if (index >= 0 && index < this.threads.length) {
      const thread = this.threads[index];
      // Find row and click it
      const gmailRow = document.querySelector(`tr[data-thread-id="${thread.id}"]`) || 
                       document.querySelector(`tr[data-legacy-thread-id="${thread.id}"]`);
      if (gmailRow) {
          (gmailRow as HTMLElement).click();
      } else {
          window.location.hash = `#inbox/${thread.id}`;
      }
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}

export const emailList = new EmailList();