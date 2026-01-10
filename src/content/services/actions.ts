import { dom } from '../utils/dom';

export class GmailActions {
  /**
   * Execute a search in Gmail.
   */
  search(query: string): void {
    const input = document.querySelector('input[name="q"]') as HTMLInputElement;
    const btn = document.querySelector('button[aria-label*="Search"]') as HTMLElement;

    if (input && btn) {
      input.value = query;
      // Trigger input events so Gmail knows value changed
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('focus', { bubbles: true }));
      
      // Click search
      btn.click();
    } else {
      console.error('[Actions] Search bar not found');
    }
  }

  /**
   * Select a specific thread by ID (using Gmail's checkbox).
   * Note: This requires the thread to be visible in the list.
   */
  selectThread(threadId: string, select = true): boolean {
    const row = document.querySelector(`tr[data-thread-id="${threadId}"]`);
    if (!row) return false;

    const checkbox = row.querySelector('div[role="checkbox"]') as HTMLElement;
    if (!checkbox) return false;

    const isChecked = checkbox.getAttribute('aria-checked') === 'true';
    if (isChecked !== select) {
      checkbox.click(); // Trigger Gmail's selection logic
    }
    return true;
  }

  /**
   * Archive selected threads.
   */
  archiveSelected(): void {
    // Find the Archive button in the sticky toolbar
    // Usually has aria-label="Archive"
    this.clickToolbarButton('Archive');
  }

  /**
   * Delete selected threads.
   */
  deleteSelected(): void {
    this.clickToolbarButton('Delete');
  }

  /**
   * Mark selected as read.
   */
  markAsRead(): void {
    this.clickToolbarButton('Mark as read');
  }

  private clickToolbarButton(ariaLabelPart: string): void {
    // The toolbar is usually in .G-tF or .aqK depending on view
    // We search for a button/div with matching aria-label
    const buttons = Array.from(document.querySelectorAll('[role="button"], [role="menuitem"]'));
    const target = buttons.find(b => {
      const label = b.getAttribute('aria-label') || b.getAttribute('title');
      return label && label.includes(ariaLabelPart);
    }) as HTMLElement;

    if (target) {
      // Mouse down/up is sometimes required for Gmail buttons
      const opts = { bubbles: true, cancelable: true, view: window };
      target.dispatchEvent(new MouseEvent('mousedown', opts));
      target.dispatchEvent(new MouseEvent('mouseup', opts));
      target.click();
      console.log(`[Actions] Clicked "${ariaLabelPart}"`);
    } else {
      console.warn(`[Actions] Toolbar button "${ariaLabelPart}" not found`);
    }
  }
}

export const gmailActions = new GmailActions();