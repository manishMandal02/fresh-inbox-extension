import { dom } from '../utils/dom';
import { stateManager } from '../core/state';
import { emailList } from './emailList/index';
import { sidebar } from './sidebar/index';
import { header } from './header/index';
import { threadPanelContent } from './threadPanel/index';

export class Layout {
  private container: HTMLElement | null = null;
  private sidebarContainer: HTMLElement | null = null;
  private headerContainer: HTMLElement | null = null;
  private mainContent: HTMLElement | null = null;
  private threadPanel: HTMLElement | null = null;

  render(): HTMLElement {
    // 1. Create Main Container (Overlay)
    this.container = dom.create('div', {
      id: 'fi-root',
      classes: ['fi-root', 'fi-layout']
    });

    // 2. Create Structure based on new Grid
    this.sidebarContainer = sidebar.render(); 
    this.headerContainer = header.render();

    this.mainContent = dom.create('div', { classes: ['fi-main-content'] });
    
    // Main Content holds Email List + Sliding Panel
    const emailListEl = emailList.render();
    emailListEl.classList.add('fi-email-list');
    
    // Thread Panel
    this.threadPanel = dom.create('main', { classes: ['fi-thread-panel'] });
    this.threadPanel.appendChild(threadPanelContent.render());

    this.mainContent.appendChild(emailListEl);
    this.mainContent.appendChild(this.threadPanel);

    // 3. Assemble Grid
    this.container.appendChild(this.sidebarContainer);
    this.container.appendChild(this.headerContainer);
    this.container.appendChild(this.mainContent);

    // 4. Initialize State Listeners
    this.initStateListeners();

    return this.container;
  }

  private initStateListeners() {
    stateManager.subscribe(state => {
      if (!this.container || !this.threadPanel) return;

      if (state.settings.sidebarCollapsed) {
        this.container.classList.add('fi-sidebar-collapsed');
      } else {
        this.container.classList.remove('fi-sidebar-collapsed');
      }

      // Thread Panel Slide
      if (state.ui.selectedThreadId) {
        console.log('[Layout] Opening thread panel for:', state.ui.selectedThreadId);
        this.threadPanel.classList.add('fi-open');
      } else {
        this.threadPanel.classList.remove('fi-open');
      }
    });
  }
}

export const layout = new Layout();
