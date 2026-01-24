import { stateManager } from '../core/state';
import { sidebar } from './sidebar/index';
import { dom } from '../utils/dom';

export class Layout {
  private sidebarMounted = false;

  render() {
    document.documentElement.classList.add('fi-enhanced-gmail');
    
    stateManager.subscribe((state) => {
      document.body.setAttribute('data-theme', state.settings.theme);
    });

    // Start injection
    this.injectSidebar();
    const observer = new MutationObserver(() => this.injectSidebar());
    observer.observe(document.body, { childList: true, subtree: true });

    return document.createDocumentFragment(); 
  }

  private injectSidebar() {
    if (this.sidebarMounted && document.getElementById('fi-sidebar-root')) return;
    
    // Find Gmail's Sidebar Container
    // .aeN is the standard container for navigation
    const gmailSidebar = document.querySelector('.aeN');
    if (gmailSidebar) {
        const root = dom.create('div', { id: 'fi-sidebar-root', classes: ['fi-injected-sidebar'] });
        root.appendChild(sidebar.render());
        
        // Prepend to ensure it's at the top
        gmailSidebar.prepend(root);
        this.sidebarMounted = true;
    }
  }
}

export const layout = new Layout();