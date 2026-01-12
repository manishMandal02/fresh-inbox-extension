import { dom } from '../../utils/dom';
import { gmailActions } from '../../services/actions';
import { stateManager } from '../../core/state';
import { icons } from '../icons';
import { gmailService } from '../../services/gmail';
import { toast } from '../toast';

export class Header {
  element: HTMLElement;

  constructor() {
    this.element = this.createDOM();
    this.initListeners();
  }

  private createDOM(): HTMLElement {
    const el = dom.create('header', { classes: ['fi-header'] });
    
    el.innerHTML = `
      <div class="fi-header-left">
        <div class="fi-search-bar">
          <span class="fi-search-icon">${icons.search}</span>
          <input type="text" placeholder="Search mail..." class="fi-search-input" />
        </div>
      </div>
      <div class="fi-header-actions">
        <button class="fi-btn-icon" id="fi-sync-btn" title="Refresh">${icons.sync}</button>
        <button class="fi-btn-icon" id="fi-theme-toggle" title="Toggle Theme"></button>
      </div>
    `;
    
    return el;
  }

  private initListeners() {
    const input = this.element.querySelector('.fi-search-input') as HTMLInputElement;
    const themeBtn = this.element.querySelector('#fi-theme-toggle') as HTMLElement;
    const syncBtn = this.element.querySelector('#fi-sync-btn');

    // 1. Search
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value;
        if (query) {
          gmailActions.search(query);
          stateManager.setUI({ searchQuery: query });
        }
      }
    });

    // 2. Theme Toggle
    themeBtn?.addEventListener('click', () => {
      const current = stateManager.get().settings.theme;
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      stateManager.setSettings({ theme: nextTheme });
    });

    // 3. Refresh
    syncBtn?.addEventListener('click', () => {
      toast.info('Refreshing...');
      gmailActions.refresh();
      // Gmail's refresh will trigger our MutationObserver to call syncThreads() automatically
    });

    // 4. State Sub
    stateManager.subscribe(state => {
      // Update theme icon - ensure we show the NEXT state's icon or representative icon
      themeBtn.innerHTML = state.settings.theme === 'dark' ? icons.lightMode : icons.darkMode;
    });
  }

  render(): HTMLElement {
    return this.element;
  }
}

export const header = new Header();