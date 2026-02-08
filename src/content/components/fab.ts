import { dom } from '../utils/dom';
import { icons } from './icons';

export class FloatingActionButton {
  element: HTMLElement;

  constructor() {
    this.element = this.createDOM();
    this.initListeners();
  }

  private createDOM(): HTMLElement {
    const el = dom.create('button', {
      classes: ['fi-fab'],
      attributes: {
        'aria-label': 'Compose Email',
        title: 'Compose'
      }
    });

    // Plus icon only
    el.innerHTML = `
      <span class="fi-fab-icon">${icons.compose}</span>
    `;

    return el;
  }

  private initListeners() {
    this.element.addEventListener('click', e => {
      e.stopPropagation();
      this.triggerNativeCompose();
    });
  }

  private triggerNativeCompose() {
    // Try to find the native compose button
    const selectors = [
      '.T-I.T-I-KE.L3', // Standard "Compose"
      '.jw', // Sometimes used
      '[gh="cm"]' // "Compose Mail" keyboard shortcut handler usually targets this
    ];

    for (const selector of selectors) {
      const btn = document.querySelector(selector) as HTMLElement;
      if (btn) {
        btn.click();
        return;
      }
    }

    console.warn('[Fresh Inbox] Native Compose button not found.');
  }

  render(): HTMLElement {
    return this.element;
  }
}

export const fab = new FloatingActionButton();
