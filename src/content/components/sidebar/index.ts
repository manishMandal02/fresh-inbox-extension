import { dom } from '../../utils/dom';
import { stateManager } from '../../core/state';
import { icons } from '../icons';
import { bulkActions } from '../bulk-actions';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  type: 'system' | 'bundle' | 'action';
  action?: () => void;
}

// "Virtual Bundles" simply link to search queries that group these emails
const PREDEFINED_BUNDLES: NavItem[] = [
  {
    id: 'bundle-finance',
    label: 'Finance',
    icon: icons.finance || '💰',
    path: '#search/category:finance',
    type: 'bundle'
  },
  {
    id: 'bundle-updates',
    label: 'Updates',
    icon: icons.updates || '🔔',
    path: '#search/category:updates',
    type: 'bundle'
  },
  {
    id: 'bundle-promos',
    label: 'Promos',
    icon: icons.promos || '🏷️',
    path: '#search/category:promotions',
    type: 'bundle'
  }
];

const SYSTEM_nav: NavItem[] = [
  { id: 'inbox', label: 'Inbox', icon: icons.inbox, path: '#inbox', type: 'system' },
  { id: 'starred', label: 'Starred', icon: icons.star, path: '#starred', type: 'system' },
  { id: 'sent', label: 'Sent', icon: icons.send, path: '#sent', type: 'system' },
  { id: 'drafts', label: 'Drafts', icon: icons.draft, path: '#drafts', type: 'system' }
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
      <!-- Compose Button Moved to Floating Action Button -->
      <!-- <div class="fi-sidebar-top">...</div> -->
      <div style="height: 16px;"></div> <!-- Spacer -->
      
      <div class="fi-nav-group">
        <div class="fi-nav-title">Mailboxes</div>
        <nav class="fi-nav-list" id="fi-nav-system"></nav>
      </div>

      <div class="fi-nav-group">
        <div class="fi-nav-title">Bundles</div>
        <nav class="fi-nav-list" id="fi-nav-bundles"></nav>
      </div>

      <div class="fi-nav-group">
        <div class="fi-nav-title">Tools</div>
        <nav class="fi-nav-list">
            <button class="fi-nav-item" id="fi-clean-btn">
                <span class="fi-nav-icon">${icons.clean}</span>
                <span class="fi-nav-label">Clean Inbox</span>
            </button>
        </nav>
      </div>

      <div class="fi-sidebar-footer">
        <button class="fi-nav-item" id="fi-settings-btn">
            <span class="fi-nav-icon">⚙️</span>
            <span class="fi-nav-label">Settings</span>
        </button>
      </div>
    `;

    // Render System Nav
    this.renderList(el.querySelector('#fi-nav-system')!, SYSTEM_nav);

    // Render Bundles
    this.renderList(el.querySelector('#fi-nav-bundles')!, PREDEFINED_BUNDLES);

    return el;
  }

  private renderList(container: HTMLElement, items: NavItem[]) {
    items.forEach(item => {
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
      container.appendChild(link);
    });
  }

  private initListeners() {
    // Compose button click
    const composeBtn = this.element.querySelector('.fi-compose-btn') as HTMLElement;
    composeBtn?.addEventListener('click', e => {
      e.stopPropagation();
      this.triggerNativeCompose();
    });

    // Clean Button
    const cleanBtn = this.element.querySelector('#fi-clean-btn');
    cleanBtn?.addEventListener('click', () => {
      bulkActions.open();
    });

    // Settings Toggle
    const settingsBtn = this.element.querySelector('#fi-settings-btn');
    settingsBtn?.addEventListener('click', () => {
      alert('Fresh Inbox Settings: Coming Soon!');
    });

    // State Subscription for Active Route
    stateManager.subscribe(state => {
      this.updateActiveRoute();
    });

    // Listen to hashchange as well for faster updates
    window.addEventListener('hashchange', () => this.updateActiveRoute());
    this.updateActiveRoute(); // Initial check
  }

  private updateActiveRoute() {
    const currentHash = window.location.hash;
    const items = this.element.querySelectorAll('.fi-nav-item');
    items.forEach(el => {
      el.classList.remove('fi-active');
      const href = el.getAttribute('href');

      // Exact match or partial for inbox
      if (
        href === currentHash ||
        (currentHash === '#inbox' && href === '#inbox') ||
        (currentHash.startsWith('#inbox/') && href === '#inbox')
      ) {
        el.classList.add('fi-active');
      }
    });
  }

  private triggerNativeCompose() {
    const gmailCompose = document.querySelector('.T-I.T-I-KE') as HTMLElement;
    if (gmailCompose) {
      gmailCompose.click();
    } else {
      console.warn('[Fresh Inbox] Native Compose button not found.');
    }
  }

  render(): HTMLElement {
    return this.element;
  }
}

export const sidebar = new Sidebar();
