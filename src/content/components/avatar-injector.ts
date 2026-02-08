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

    // 3. Fallback Interval: REMOVED for performance. Observer is sufficient.
    // setInterval(avatarInjector.processRows, 1500);
  },

  processRows: () => {
    // OPTIMIZATION: Only find rows that lack the 'processed' marker.
    // We trust that once processed, they are hooked up.
    // If the star state changes, we need a separate attribute observer if we really want to be perfect,
    // but typically star proxy events handle the sync.
    const rows = document.querySelectorAll('tr.zA:not(.fi-avatar-processed)');

    rows.forEach(row => {
      const el = row as HTMLElement;
      el.classList.add('fi-avatar-processed');

      // 1. Find Sender Name
      const senderEl = el.querySelector('.yX') || (el.querySelector('.zF') as HTMLElement);
      if (!senderEl) return;

      // 2. Generate Initials
      let rawText = senderEl.innerText || '';
      if (!rawText.trim()) {
        rawText = senderEl.textContent || '';
        rawText = rawText.replace(/unread|starred|important|me,|,\s*me/gi, '');
      }

      const senders = rawText.split(',').map(s => s.trim());
      const meaningfulSender = senders.find(s => s.toLowerCase() !== 'me') || senders[0];
      const cleanName = (meaningfulSender || '?').replace(/[0-9"().,&+\-]/g, ' ').trim();

      // Initials logic
      const parts = cleanName.split(/\s+/).filter(p => p.length > 0 && /^[a-zA-Z]/.test(p));
      let initials = '?';
      if (parts.length >= 2) initials = (parts[0][0] + parts[1][0]).toUpperCase();
      else if (parts.length === 1) initials = parts[0][0].toUpperCase();
      else if (cleanName.length > 0) initials = cleanName[0].toUpperCase();

      const avatarColor = getColor(cleanName || '?');

      // 3. Find Injection Target
      const checkboxCell = el.querySelector('.oZ-x3');
      if (checkboxCell && !checkboxCell.querySelector('.fi-avatar')) {
        const avatar = document.createElement('div');
        avatar.className = 'fi-avatar';
        avatar.textContent = initials;
        avatar.style.backgroundColor = avatarColor;
        checkboxCell.appendChild(avatar);
      }

      // 4. STAR PROXY LOGIC
      const realStarBtn = el.querySelector('.T-KT') as HTMLElement;
      if (realStarBtn && senderEl) {
        const senderTd = senderEl.closest('td');
        if (senderTd && !senderTd.querySelector('.fi-star-proxy')) {
          const proxyStar = document.createElement('span');
          proxyStar.className = 'T-KT fi-star-proxy';
          proxyStar.setAttribute('role', 'button');

          const updateProxyState = () => {
            const checked = realStarBtn.getAttribute('aria-checked') || 'false';
            const label = realStarBtn.getAttribute('aria-label') || '';
            const starredClass = realStarBtn.classList.contains('T-KT-Jp');

            proxyStar.setAttribute('aria-checked', checked);
            proxyStar.setAttribute('aria-label', label);

            if (starredClass) proxyStar.classList.add('T-KT-Jp');
            else proxyStar.classList.remove('T-KT-Jp');
          };
          updateProxyState();

          // Listen for clicks on proxy
          proxyStar.addEventListener('click', e => {
            e.stopPropagation();
            e.preventDefault();
            realStarBtn.click();
            setTimeout(updateProxyState, 50); // Optimistic sync
          });

          // OBSERVE the real star for changes (instead of polling)
          const starObserver = new MutationObserver(updateProxyState);
          starObserver.observe(realStarBtn, { attributes: true, attributeFilter: ['aria-checked', 'class'] });

          senderTd.appendChild(proxyStar);
          senderTd.classList.add('fi-sender-cell');
          el.classList.add('fi-has-star-proxy');
        }
      }
    });
  }
};
