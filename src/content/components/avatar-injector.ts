/**
 * Avatar Injector
 * Scans the email list for rows without avatars and injects
 * a custom "Initials" circle based on the sender's name.
 */

// refined Muted Palette (Darker for Contrast, but still Soft)
const COLORS = [
  '#5c8ab5', // Muted Blue (Darker)
  '#5e9e85', // Muted Green (Darker)
  '#d69e45', // Muted Gold (Darker)
  '#c96f6f', // Muted Red (Darker)
  '#8e82bd', // Muted Purple (Darker)
  '#5fa8a0', // Muted Teal (Darker)
  '#a18e87', // Muted Brown (Darker)
  '#7986cb', // Indigo (Medium)
  '#78909c' // Blue Grey (Medium)
];

const getColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

export const avatarInjector = {
  observer: null as MutationObserver | null,

  init: () => {
    // 1. Immediate Run
    avatarInjector.processRows();

    // 2. Set up MutationObserver for INSTANT reaction to new rows
    const listContainer = document.querySelector('div[role="main"]') || document.body;

    // DEBOUNCE LOGIC (Performance Fix)
    let timeoutId: any = null;

    avatarInjector.observer = new MutationObserver(mutations => {
      let shouldProcess = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
      }

      if (shouldProcess) {
        // Clear pending execution
        if (timeoutId) clearTimeout(timeoutId);

        // Schedule new execution (50ms debounce)
        timeoutId = setTimeout(() => {
          avatarInjector.processRows();
          timeoutId = null;
        }, 50);
      }
    });

    avatarInjector.observer.observe(listContainer, {
      childList: true,
      subtree: true
    });

    // 3. Fallback Interval (keep it, but slower is fine - mostly for attribute changes)
    setInterval(avatarInjector.processRows, 1500);
  },

  processRows: () => {
    // OPTIMIZATION: Only find rows that lack the 'processed' marker.
    // This reduces the scan from O(n) to O(1) for most updates.
    const rows = document.querySelectorAll('tr.zA:not(.fi-avatar-processed)');

    rows.forEach(row => {
      const el = row as HTMLElement;
      el.classList.add('fi-avatar-processed');

      // 1. Find Sender Name
      // .yX is usually the sender name span in main list
      const senderEl = el.querySelector('.yX') || el.querySelector('.zF');
      if (!senderEl) return;

      // 2. Generate Initials (Refined V3)
      // Use innerText to ignore hidden accessibility text like "Unread" or "Starred"
      // Gmail often uses hidden spans for screen readers.
      let rawText = (senderEl as HTMLElement).innerText || '';

      // Fallback: If innerText is empty (some contexts), try textContent but strip known noise
      if (!rawText.trim()) {
        rawText = senderEl.textContent || '';
        // Strip common hidden prefixes if they sneak in via textContent
        rawText = rawText.replace(/unread|starred|important|me,|,\s*me/gi, '');
      }

      const senders = rawText.split(',').map(s => s.trim());

      let targetName = senders[0]; // Default to first

      // Find first sender that is NOT "me" (case insensitive)
      const meaningfulSender = senders.find(s => s.toLowerCase() !== 'me');
      if (meaningfulSender) {
        targetName = meaningfulSender;
      }

      // Clean up: Remove numbers, special chars (&, (), ., ", -)
      const cleanName = targetName.replace(/[0-9"().,&+\-]/g, ' ').trim();

      // Generate Initials
      const parts = cleanName.split(/\s+/).filter(p => p.length > 0 && /^[a-zA-Z]/.test(p));
      let initials = '?';

      if (parts.length >= 2) {
        // First + Last
        initials = (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts.length === 1) {
        // Single word
        initials = parts[0][0].toUpperCase();
      } else if (cleanName.length > 0) {
        initials = cleanName[0].toUpperCase();
      }

      // Color Logic: Use the full CLEAN name for the hash to ensure variety
      // If the name was capturing "Unread" before, everyone had the same color.
      // Now it should be unique per sender.
      const avatarColor = getColor(cleanName || '?');
      // 3. Find Injection Target (Checkbox Cell container)
      // .oZ-x3 is the wrapper inside the checkbox TD usually
      const checkboxCell = el.querySelector('.oZ-x3');
      if (!checkboxCell) return;

      // 4. Create Avatar Element
      const avatar = document.createElement('div');
      avatar.className = 'fi-avatar';
      avatar.textContent = initials;
      avatar.style.backgroundColor = avatarColor;

      // 5. Inject Avatar
      // Prepend so it sits behind/under the checkbox z-index wise if needed
      checkboxCell.appendChild(avatar);

      // --- 6. STAR PROXY (Fresh Inbox Feature) ---
      // We CANNOT move the native star (.T-KT) because it breaks React/Closure events.
      // Instead, we create a PROXY button in the sender cell that clicks the real invisible star.

      const realStarBtn = el.querySelector('.T-KT') as HTMLElement;

      // senderEl is the element containing the text/name
      if (realStarBtn && senderEl) {
        const senderTd = senderEl.closest('td');
        if (senderTd && !el.querySelector('.fi-star-proxy')) {
          // check if proxy exists

          // 1. Create the Proxy Star
          const proxyStar = document.createElement('span');
          // Reuse usage classes so it picks up our styling, plus a marker
          proxyStar.className = 'T-KT fi-star-proxy';
          proxyStar.setAttribute('role', 'button');

          // 2. Sync State (Initial)
          const updateProxyState = () => {
            const checked = realStarBtn.getAttribute('aria-checked') || 'false';
            const label = realStarBtn.getAttribute('aria-label') || '';
            const starredClass = realStarBtn.classList.contains('T-KT-Jp');

            proxyStar.setAttribute('aria-checked', checked);
            proxyStar.setAttribute('aria-label', label);

            if (starredClass) {
              proxyStar.classList.add('T-KT-Jp');
            } else {
              proxyStar.classList.remove('T-KT-Jp');
            }
          };
          updateProxyState();

          // 3. Click Handler: Trigger Real Star
          proxyStar.addEventListener('click', e => {
            e.stopPropagation(); // Stop row click
            e.preventDefault();
            realStarBtn.click(); // Trigger native action

            // Optimistic update (optional, but waiting for mutation observer is safer)
            setTimeout(updateProxyState, 50);
            setTimeout(updateProxyState, 200);
          });

          // 4. Inject Proxy
          senderTd.appendChild(proxyStar);
          senderTd.classList.add('fi-sender-cell');

          // 5. Hide Real Star (Visually only, keep it in DOM)
          // We add a class to the ROW to let CSS hide the original .T-KT that is NOT our proxy
          el.classList.add('fi-has-star-proxy');

          // 6. CONTINUOUS SYNC (Crucial for external changes)
          // Since we are in a setInterval loop (processRows), we can just re-sync here.
          // We attach the sync function to the element to be called on subsequent passes?
          // Actually, simply checking it in the main loop is easier.
          (proxyStar as any)._syncFn = updateProxyState;
        }

        // --- 7. SYNC (Every Loop) ---
        // If we already passed this row, update the state just in case network updated it
        const existingProxy = el.querySelector('.fi-star-proxy');
        if (existingProxy && (existingProxy as any)._syncFn) {
          (existingProxy as any)._syncFn();
        }
      }
    });
  }
};
