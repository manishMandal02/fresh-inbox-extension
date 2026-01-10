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
      <div class="fi-logo-area">
        <span class="fi-logo-icon">${icons.logo}</span>
        <span class="fi-logo-text">Fresh Inbox</span>
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
    stateManager.subscribe(state => {
      // Highlight active route
      const currentView = state.ui.currentView;
      // Simple mapping for demo
      const items = this.element.querySelectorAll('.fi-nav-item');
      items.forEach(el => {
        el.classList.remove('fi-active');
        if (el.getAttribute('href') === `#${currentView}`) {
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