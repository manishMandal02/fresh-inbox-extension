import '../styles/gmail-overrides.css';
import '../styles/main.css';
import { lifecycle } from './core/lifecycle';
import { layout } from './components/layout';

const findAndHideCompose = () => {
  // Find all elements containing "Compose" text
  const xpath = "//*[contains(text(), 'Compose')]";
  const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  for (let i = 0; i < result.snapshotLength; i++) {
    const el = result.snapshotItem(i) as HTMLElement;
    // Skip our own button
    if (el.closest('.fi-compose-btn')) continue;
    
    // Find the button wrapper (usually a few levels up)
    const buttonWrapper = el.closest('[role="button"]') || el.closest('.T-I');
    
    if (buttonWrapper) {
      console.log('[Fresh Inbox] Hiding Native Compose:', buttonWrapper);
      (buttonWrapper as HTMLElement).style.display = 'none';
      (buttonWrapper as HTMLElement).style.visibility = 'hidden';
    } else {
        // Fallback: Hide the text span's parent if it looks like a button
        el.parentElement!.style.display = 'none';
    }
  }
  
  // Also look for the FAB (Floating Action Button) which might just have an icon
  const fab = document.querySelector('.z0');
  if (fab) (fab as HTMLElement).style.display = 'none';
};

const boot = async () => {
  console.log('[Fresh Inbox] Enhancement Booted');
  
  // 1. Initialize Layout (Applies Theme classes)
  layout.render();
  
  // 2. Initialize Core
  lifecycle.init();

  // 3. Brutal Compose Hiding Loop
  setInterval(findAndHideCompose, 1000);
};

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
