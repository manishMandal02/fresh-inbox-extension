import { dom } from '../utils/dom';

export class BulkActions {
  private isOpen = false;
  private modal: HTMLElement | null = null;

  public open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.render();
  }

  public close() {
    if (!this.modal) return;
    this.modal.remove();
    this.modal = null;
    this.isOpen = false;
  }

  private render() {
    this.modal = dom.create('div', {
      classes: ['fi-modal-backdrop'],
      attributes: { id: 'fi-bulk-actions-modal' }
    });

    // Content
    const content = dom.create('div', { classes: ['fi-modal-content'] });
    content.innerHTML = `
      <div class="fi-modal-header">
        <h2>Inbox Cleaner</h2>
        <button class="fi-close-btn">×</button>
      </div>
      <div class="fi-modal-body">
        <div class="fi-cleaner-step" id="step-scan">
            <div class="fi-spinner"></div>
            <p>Scanning for newsletters and promotions...</p>
        </div>
        <div class="fi-cleaner-step" id="step-results" style="display: none;">
            <p>Found <strong>3 active subscriptions</strong> from visible emails.</p>
            <ul class="fi-subscription-list">
                <!-- Mock Data for Visual Demo -->
                <li>
                    <span>Newsletter Weekly</span>
                    <button class="fi-btn-danger">Unsubscribe</button>
                </li>
                <li>
                    <span>Daily Deals</span>
                    <button class="fi-btn-danger">Unsubscribe</button>
                </li>
            </ul>
        </div>
      </div>
    `;

    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    // Close handlers
    this.modal.addEventListener('click', e => {
      if (e.target === this.modal) this.close();
    });
    content.querySelector('.fi-close-btn')?.addEventListener('click', () => this.close());

    // Mock Scan Process
    // Use window.setTimeout to avoid TS issues with NodeJS.Timeout vs number
    window.setTimeout(() => {
      const stepScan = content.querySelector('#step-scan') as HTMLElement;
      const stepResults = content.querySelector('#step-results') as HTMLElement;
      if (stepScan && stepResults) {
        stepScan.style.display = 'none';
        stepResults.style.display = 'block';
      }
    }, 1500);
  }
}

export const bulkActions = new BulkActions();
