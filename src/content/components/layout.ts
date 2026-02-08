import { stateManager } from '../core/state';
import { sidebar } from './sidebar/index';
import { fab } from './fab';
import { dom } from '../utils/dom';

export class Layout {
  private sidebarMounted = false;

  render() {
    document.documentElement.classList.add('fi-enhanced-gmail');

    stateManager.subscribe(state => {
      document.body.setAttribute('data-theme', state.settings.theme);
    });

    // Start injection
    this.injectSidebar();
    this.injectFAB();

    const observer = new MutationObserver(() => {
      this.injectSidebar();
      this.injectFAB();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Router / Body Class Manager
    const updateBodyClass = () => {
      const hash = window.location.hash;
      document.body.classList.remove('fi-view-finance', 'fi-view-updates', 'fi-view-promos');

      if (hash.includes('category:finance')) document.body.classList.add('fi-view-finance');
      if (hash.includes('category:updates')) document.body.classList.add('fi-view-updates');
      if (hash.includes('category:promotions')) document.body.classList.add('fi-view-promos');
    };
    window.addEventListener('hashchange', updateBodyClass);
    updateBodyClass();

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

      // Observe for Collapse State
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // Gmail collapsed sidebar is usually around 72px. Expanded is ~256px.
          // We'll use 150px as a safe threshold.
          if (entry.contentRect.width < 150) {
            root.classList.add('fi-collapsed');
          } else {
            root.classList.remove('fi-collapsed');
          }
        }
      });
      resizeObserver.observe(gmailSidebar);
    }
  }

  private injectFAB() {
    if (document.getElementById('fi-fab-root')) return;

    const fabBtn = fab.render();
    fabBtn.id = 'fi-fab-root';
    document.body.appendChild(fabBtn);
  }
}

export const layout = new Layout();
