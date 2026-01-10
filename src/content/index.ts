// Entry point
import '../styles/main.css';
import '../styles/hide-gmail.css'; // Import here so Vite bundles it, or add to manifest
import { lifecycle } from './core/lifecycle';
import { layout } from './components/layout';

// 1. Immediately mark body as loading (this might happen after some Gmail load)
document.body.classList.add('fi-loading');

const boot = async () => {
  console.log('[Fresh Inbox] Booting...');
  
  // 2. Initialize Core
  await lifecycle.init();

  // 3. Render UI
  const appRoot = layout.render();
  document.body.appendChild(appRoot);
  
  console.log('[Fresh Inbox] UI Injected');
  
  // 4. Reveal (The CSS handles visibility, no need to remove class if our CSS only targets :not(.fi-root))
  // But removing it is cleaner if we want to toggle back.
  // For now, we keep it to ensure Gmail remains hidden.
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
