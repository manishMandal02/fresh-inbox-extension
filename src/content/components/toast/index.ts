import { dom } from '../../utils/dom';

type ToastType = 'success' | 'error' | 'info';

export class ToastManager {
  private container: HTMLElement;

  constructor() {
    this.container = dom.create('div', { id: 'fi-toast-container', classes: ['fi-toast-container'] });
    this.mount();
  }

  private mount() {
    // Always mount to body to avoid clipping and grid constraints
    if (document.body && !document.getElementById('fi-toast-container')) {
      document.body.appendChild(this.container);
    }
  }

  show(message: string, type: ToastType = 'info', duration = 3000) {
    console.log(`[Toast] Show ${type}: ${message}`);
    
    // Ensure container is still in DOM
    if (!document.contains(this.container)) {
      this.mount();
    }
    
    const toast = dom.create('div', { 
      classes: ['fi-toast', `fi-toast-${type}`],
      text: message 
    });

    this.container.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toast.offsetHeight; // Force reflow
      toast.classList.add('fi-toast-visible');
    });

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('fi-toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error', 5000); }
  info(msg: string) { this.show(msg, 'info'); }
}

export const toast = new ToastManager();
