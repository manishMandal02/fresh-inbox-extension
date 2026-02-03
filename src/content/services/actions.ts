export class GmailActions {
  /**
   * Execute a search in Gmail.
   */
  search(query: string): void {
    const input = document.querySelector('input[name="q"]') as HTMLInputElement;
    const btn = document.querySelector('button[aria-label*="Search"]') as HTMLElement;

    if (input && btn) {
      input.value = query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('focus', { bubbles: true }));
      btn.click();
    }
  }

  refresh(): void {
    // Try native refresh button (often div with act="20" or .nu)
    const refreshBtn = document.querySelector('div[act="20"], .nu[role="button"]') as HTMLElement;
    if (refreshBtn) {
      refreshBtn.click();
    } else {
      window.location.reload();
    }
  }

  /**
   * Select a specific thread by ID.
   */
  selectThread(threadId: string, select = true): boolean {
    const row =
      document.querySelector(`tr[data-thread-id="${threadId}"]`) ||
      document.querySelector(`tr[data-legacy-thread-id="${threadId}"]`) ||
      document.getElementById(threadId);

    if (!row) return false;

    const checkbox = (row.querySelector('[role="checkbox"]') || row.querySelector('.oZ-jc')) as HTMLElement;

    if (!checkbox) return false;

    const isChecked = checkbox.getAttribute('aria-checked') === 'true';
    if (isChecked !== select) {
      const opts = { bubbles: true, cancelable: true, view: window };
      checkbox.dispatchEvent(new MouseEvent('mousedown', opts));
      checkbox.dispatchEvent(new MouseEvent('mouseup', opts));
      checkbox.click();
    }
    return true;
  }

  archiveSelected(): boolean {
    return this.clickToolbarButton('Archive');
  }
  deleteSelected(): boolean {
    return this.clickToolbarButton('Delete');
  }
  markAsRead(): boolean {
    return this.clickToolbarButton('Mark as read') || this.clickToolbarButton('Mark as unread');
  }
  snooze(): boolean {
    return this.clickToolbarButton('Snooze');
  }

  toggleStar(threadId: string): boolean {
    const row =
      document.querySelector(`tr[data-thread-id="${threadId}"]`) ||
      document.querySelector(`tr[data-legacy-thread-id="${threadId}"]`);
    if (!row) return false;

    const starBtn = row
      .querySelector('[role="checkbox"]')
      ?.parentElement?.parentElement?.querySelector('.T-KT') as HTMLElement;

    if (starBtn) {
      starBtn.click();
      return true;
    }
    return false;
  }

  performOpenedAction(action: 'archive' | 'delete' | 'read' | 'snooze' | 'star'): boolean {
    switch (action) {
      case 'archive':
        return this.archiveSelected();
      case 'delete':
        return this.deleteSelected();
      case 'read':
        return this.markAsRead();
      case 'snooze':
        return this.snooze();
      case 'star': {
        // In opened thread, star is usually at the top right of the message
        const starBtn = document.querySelector('.T-KT') as HTMLElement;
        if (starBtn) {
          starBtn.click();
          return true;
        }
        return false;
      }
      default:
        return false;
    }
  }

  private clickToolbarButton(ariaLabelPart: string): boolean {
    const toolbars = Array.from(document.querySelectorAll('.G-atb:not([style*="display: none"])'));
    const allButtons: HTMLElement[] = [];
    toolbars.forEach(t => {
      allButtons.push(
        ...(Array.from(
          t.querySelectorAll('[role="button"], [role="menuitem"], .T-I, [aria-label], [title]')
        ) as HTMLElement[])
      );
    });

    const searchTerms = [ariaLabelPart.toLowerCase()];
    if (ariaLabelPart.toLowerCase() === 'archive') searchTerms.push('archive (e)');
    if (ariaLabelPart.toLowerCase() === 'delete') searchTerms.push('delete (#)', 'move to trash');
    if (ariaLabelPart.toLowerCase() === 'mark as read') searchTerms.push('mark as read (i)');
    if (ariaLabelPart.toLowerCase() === 'snooze') searchTerms.push('snooze (b)');

    const target = allButtons.find(b => {
      const label = (b.getAttribute('aria-label') || b.getAttribute('title') || '').toLowerCase();
      return searchTerms.some(term => label === term || label.includes(term));
    });

    if (target) {
      const mouseEvent = (type: string) =>
        new MouseEvent(type, { bubbles: true, cancelable: true, view: window, buttons: 1 });
      target.dispatchEvent(mouseEvent('mousedown'));
      target.dispatchEvent(mouseEvent('mouseup'));
      target.click();
      return true;
    }
    return false;
  }
}

export const gmailActions = new GmailActions();
