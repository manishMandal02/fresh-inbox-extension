import '../styles/gmail-main-view.css';
import '../styles/email-page.css';
import '../styles/main.css';

import { lifecycle } from './core/lifecycle';
import { layout } from './components/layout';
import { avatarInjector } from './components/avatar-injector';

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

  // Run cleanup for email brackets
  stripEmailBrackets();
  cleanDateText();
  hideHeaderEmoji();
};

const stripEmailBrackets = () => {
  // Find all sender email containers
  const emails = document.querySelectorAll('.go');
  emails.forEach(el => {
    // Check if it has brackets
    if (el.textContent && (el.textContent.includes('<') || el.textContent.includes('>'))) {
      // Replace only the brackets, safer than regex replacing everything
      el.textContent = el.textContent.replace(/[<>]/g, '').trim();
    }
  });
};

const cleanDateText = () => {
  // Find date elements (usually .g3 in opened emails)
  const dates = document.querySelectorAll('.g3');
  dates.forEach(el => {
    // Look for text like "(6 days ago)"
    if (el.textContent && el.textContent.includes('ago)')) {
      // Logic: Split by '(' and keep the first part, or regex replace the "ago" parenthetical
      // Regex: Find ( ... ago) and remove it.
      el.textContent = el.textContent.replace(/\s*\(.*?ago\)/g, '').trim();
    }
  });
};

const hideHeaderEmoji = () => {
  // Aggressively find 'Add reaction' buttons in the Thread View (.Nh .aoI)
  const buttons = document.querySelectorAll(
    '.Nh .aoI [aria-label="Add reaction"], .Nh .aoI [data-tooltip="Add reaction"]'
  );
  buttons.forEach(btn => {
    (btn as HTMLElement).style.display = 'none';
  });
};

const boot = async () => {
  console.log('[Fresh Inbox] Enhancement Booted');

  // 1. Initialize Layout (Applies Theme classes)
  layout.render();

  // 2. Initialize Core
  lifecycle.init();

  // 3. Brutal Compose Hiding Loop
  setInterval(findAndHideCompose, 1000);

  // 4. Start Avatar Injection
  avatarInjector.init();
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
