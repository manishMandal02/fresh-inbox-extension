import { dom } from '../../utils/dom';
import { stateManager } from '../../core/state';
import { icons } from '../icons';

interface NavItem {
  id: string;
  label: string;
  icon: string; 
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'inbox', label: 'Inbox', icon: icons.inbox, path: '#inbox' },
  { id: 'starred', label: 'Starred', icon: icons.star, path: '#starred' },
  { id: 'sent', label: 'Sent', icon: icons.send, path: '#sent' },
  { id: 'drafts', label: 'Drafts', icon: icons.draft, path: '#drafts' },
  { id: 'all', label: 'All Mail', icon: icons.archive, path: '#all' },
  { id: 'trash', label: 'Trash', icon: icons.trash, path: '#trash' },
];

export class Sidebar {
  element: HTMLElement;

  constructor() {
    this.element = this.createDOM();
    this.initListeners();
  }

  private createDOM(): HTMLElement {
    const el = dom.create('aside', { classes: ['fi-sidebar'] });
    el.innerHTML = `
      <div class="fi-sidebar-top">
        <button class="fi-compose-btn">
          <span class="fi-compose-icon">${icons.compose}</span>
          <span class="fi-compose-text">Compose</span>
        </button>
      </div>
      <nav class="fi-nav-list"></nav>
    `;

    const navList = el.querySelector('.fi-nav-list')!;
    NAV_ITEMS.forEach(item => {
      const link = dom.create('a', {
        classes: ['fi-nav-item'],
        attributes: { 
          href: item.path,
          'data-id': item.id
        }
      });
      link.innerHTML = `
        <span class="fi-nav-icon">${item.icon}</span>
        <span class="fi-nav-label">${item.label}</span>
      `;
      navList.appendChild(link);
    });

    return el;
  }

  private initListeners() {
    // Compose button click
    const composeBtn = this.element.querySelector('.fi-compose-btn') as HTMLElement;
    composeBtn?.addEventListener('click', (e) => {
        // Stop propagation to prevent bubbling
        e.stopPropagation();
        
        // Trigger Gmail's compose button
        const gmailCompose = document.querySelector('.T-I.T-I-KE') as HTMLElement;
        if (gmailCompose) {
            // Just click. If it doesn't work, we'll try dispatchEvent
            gmailCompose.click();
        } else {
            // Fallback
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }));
        }
    });

    stateManager.subscribe(state => {
      const currentView = state.ui.currentView;
      const items = this.element.querySelectorAll('.fi-nav-item');
      items.forEach(el => {
        el.classList.remove('fi-active');
        const href = el.getAttribute('href');
        if (href === `#${currentView}` || (currentView === 'inbox' && href === '#inbox')) {
          el.classList.add('fi-active');
        }
      });
    });
  }

  render(): HTMLElement {
    return this.element;
  }
}

export const sidebar = new Sidebar();