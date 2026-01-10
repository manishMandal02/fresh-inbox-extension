import { dom } from '../../utils/dom';
import { gmailActions } from '../../services/actions';
import { stateManager } from '../../core/state';

export class Header {
  element: HTMLElement;

  constructor() {
    this.element = this.createDOM();
    this.initListeners();
  }

  private createDOM(): HTMLElement {
    const el = dom.create('header', { classes: ['fi-header'] });
    
    el.innerHTML = `
      <div class="fi-search-bar">
        <input type="text" placeholder="Search mail..." class="fi-search-input" />
      </div>
      <div class="fi-header-actions">
        <!-- Add settings/theme toggle here later -->
        <button class="fi-btn-icon" id="fi-theme-toggle">Theme</button>
      </div>
    `;
    
    return el;
  }

  private initListeners() {
    const input = this.element.querySelector('.fi-search-input') as HTMLInputElement;
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = input.value;
        if (query) {
          gmailActions.search(query);
        }
      }
    });

    const themeBtn = this.element.querySelector('#fi-theme-toggle');
    themeBtn?.addEventListener('click', () => {
      const current = stateManager.get().settings.theme;
      stateManager.setSettings({ 
        theme: current === 'dark' ? 'light' : 'dark' 
      });
    });
  }

  render(): HTMLElement {
    return this.element;
  }
}

export const header = new Header();
