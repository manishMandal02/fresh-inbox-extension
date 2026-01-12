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
        const emailListEl = emailList.render();
        emailListEl.classList.add('fi-email-list');
        this.mainContent.appendChild(emailListEl);
    
        // Thread Panel - sibling of mainContent in the grid
        this.threadPanel = dom.create('main', { classes: ['fi-thread-panel'] });
        this.threadPanel.appendChild(threadPanelContent.render());
    
        // 3. Assemble Grid
        this.container.appendChild(this.sidebarContainer);
        this.container.appendChild(this.headerContainer);
        this.container.appendChild(this.mainContent);
        this.container.appendChild(this.threadPanel); // Correct: Append to grid root
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
        this.container.classList.add('fi-thread-open');
        this.threadPanel.classList.add('fi-open');
      } else {
        this.container.classList.remove('fi-thread-open');
        this.threadPanel.classList.remove('fi-open');
      }
    });
  }
}

export const layout = new Layout();
