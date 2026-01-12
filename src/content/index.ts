import './hide-gmail.css'; // Load this FIRST to hide Gmail
import '../styles/main.css';
import { lifecycle } from './core/lifecycle';
import { layout } from './components/layout';
import { stateManager } from './core/state';

const boot = async () => {
  // 1. Render UI IMMEDIATELY
  // This replaces the white screen with our layout shell
  const appRoot = layout.render();
  document.body.appendChild(appRoot);
  
  // 2. Initialize Core/Data in background
  // We don't 'await' this before rendering because we want the UI visible now
  lifecycle.init().then(() => {
    // 3. Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      const state = stateManager.get();
      const threadId = state.ui.selectedThreadId;
      
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (threadId) {
        if (e.key === 'e') {
          const archiveBtn = document.querySelector('.fi-action-archive') as HTMLElement;
          archiveBtn?.click();
        } else if (e.key === '#') {
          const deleteBtn = document.querySelector('.fi-action-delete') as HTMLElement;
          deleteBtn?.click();
        }
      }
    });
  });
};

// Use a more robust check for body existence
if (document.body) {
  boot();
} else {
  const observer = new MutationObserver(() => {
    if (document.body) {
      observer.disconnect();
      boot();
    }
  });
  observer.observe(document.documentElement, { childList: true });
}
