import { dom } from '../../utils/dom';
import { stateManager } from '../../core/state';
import { VirtualScroller } from './virtualScroll';
import { EmailThread } from '../../../types/email';
import { gmailActions } from '../../services/actions';
import { gmailRouter } from '../../core/router';

export class EmailList {
  container: HTMLElement;
  private scroller: VirtualScroller;
  private threads: EmailThread[] = [];

  constructor() {
    this.container = dom.create('div', { 
      classes: ['fi-list-container'],
      attributes: { tabindex: '0' } // Make focusable for keyboard events
    });
    
    this.scroller = new VirtualScroller(this.container);
    
    this.initListeners();
    this.initKeyboard();
  }

  private initListeners() {
    stateManager.subscribe(state => {
      // Convert Map to Array for list
      // Note: In real app, we might sort/filter here
      this.threads = Array.from(state.threads.values());
      
      console.log(`[EmailList] Received ${this.threads.length} threads from state.`);

      this.scroller.setData(
        this.threads,
        state.ui.selection,
        state.ui.selectedThreadId
      );
    });

    // Click Delegation
    this.container.addEventListener('click', (e) => {
      // console.log('[EmailList] Clicked:', e.target);
      const target = e.target as HTMLElement;
      const card = target.closest('.fi-email-card');
      
      if (card) {
        const id = card.getAttribute('data-id');
        // console.log('[EmailList] Card selected:', id);
        
        if (id) {
          stateManager.setUI({ selectedThreadId: id });
          
          // Strategy: Simulate click on the real Gmail row to let Gmail handle navigation
          // This avoids hash format mismatches
          const gmailRow = document.querySelector(`tr[data-thread-id="${id}"]`) || 
                           document.querySelector(`tr[data-legacy-thread-id="${id}"]`) ||
                           document.getElementById(id); // fallback
                           
          if (gmailRow) {
              console.log('[EmailList] Triggering Gmail row click');
              // Gmail requires mousedown + mouseup + click sequence often
              const opts = { bubbles: true, cancelable: true, view: window };
              gmailRow.dispatchEvent(new MouseEvent('mousedown', opts));
              gmailRow.dispatchEvent(new MouseEvent('mouseup', opts));
              (gmailRow as HTMLElement).click();
          } else {
              console.warn('[EmailList] Could not find underlying Gmail row for navigation');
              // Fallback to manual hash if row not found (e.g. virtualized out by Gmail?)
              window.location.hash = `#inbox/${id}`;
          }
        }
      }
    });
  }

  private initKeyboard() {
    this.container.addEventListener('keydown', (e) => {
      // Only handle if we have focus or body has focus (global shortcuts)
      // For now, let's assume global shortcuts for J/K
      
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
          // Toggle selection
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
        if (currentId) {
          // Navigate to thread
          window.location.hash = `#inbox/${currentId}`; // Gmail's hash structure
        }
      }
    });
  }

  private selectThreadAtIndex(index: number) {
    if (index >= 0 && index < this.threads.length) {
      const thread = this.threads[index];
      stateManager.setUI({ selectedThreadId: thread.id });
      
      // Also update Gmail's internal selection logic if needed? 
      // Usually we just want to update our view state. 
      // Gmail might sync via URL hash if we want full sync.
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}

export const emailList = new EmailList();