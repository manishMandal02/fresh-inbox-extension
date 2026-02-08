import '../styles/gmail-main-view.css';
import '../styles/email-page.css';
import '../styles/main.css';

import { lifecycle } from './core/lifecycle';
import { layout } from './components/layout';
import { avatarInjector } from './components/avatar-injector';
import { dateHeaders } from './components/date-headers';

const findAndHideCompose = () => {
  // Find all elements containing "Compose" text
  const xpath = "//*[contains(text(), 'Compose')]";
  const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  for (let i = 0; i < result.snapshotLength; i++) {
    const el = result.snapshotItem(i) as HTMLElement;
    // Skip our own buttons
    if (el.closest('.fi-compose-btn') || el.closest('.fi-fab')) continue;

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
  fixSenderLayout();
};

const fixSenderLayout = () => {
  // Target the Sender Wrapper
  const wrappers = document.querySelectorAll('.gE');

  wrappers.forEach(wrapper => {
    const email = wrapper.querySelector('.go');
    if (!email) return;

    // Find "Unsubscribe" - rigorous search
    let unsub: HTMLElement | null = null;

    // 1. Try common selectors
    unsub = wrapper.querySelector('.Ca, .ca, a[href*="unsubscribe"]') as HTMLElement;

    // 2. Try text search on all links/spans if selector failed
    if (!unsub) {
      const candidates = Array.from(wrapper.querySelectorAll('a, span[role="link"], span'));
      unsub =
        (candidates.find(el => el.textContent && /unsubscribe/i.test(el.textContent)) as HTMLElement) || null;
    }

    // 3. SPECIAL: Sometimes it's inside the email bracket < ... > which we want to avoid breaking,
    // but usually it's a sibling or child of .go

    if (unsub && email && email.parentElement) {
      // We want it to be a DIRECT child of email's parent, placed BEFORE the email (.go)
      // This positions it on Line 1 (along with Name/Icon), while Email breaks to Line 2.

      // Check if it's already in the right spot (prev sibling of email)
      if (unsub.nextElementSibling !== email) {
        // console.log('[Fresh Inbox] Moving Unsubscribe:', unsub);

        // CAPTURE OLD PARENT to clean up ghost rows
        const oldParent = unsub.parentElement;

        // SAFELY insert using the specific parent of the email element
        try {
          email.parentElement.insertBefore(unsub, email);

          // Add our classes for styling
          unsub.classList.add('fi-move-unsub');
          if (!unsub.classList.contains('Ca')) unsub.classList.add('Ca');

          // CLEANUP: If old parent is now empty (or just whitespace), hide it
          if (oldParent && oldParent !== email.parentElement) {
            const textContent = oldParent.textContent || '';
            // If it has no other element children and text is just whitespace
            if (oldParent.children.length === 0 && textContent.trim() === '') {
              oldParent.style.display = 'none';
            }
          }
        } catch (e) {
          // Ignore errors if nodes are detaching
          console.warn('[Fresh Inbox] Move failed', e);
        }
      }
    }
  });
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

  // 5. Start Date Headers
  dateHeaders.init();
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
