import { isEmailListPage } from '../utils/dom';

const DATE_LABELS = {
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
  THIS_MONTH: 'This month',
  LAST_YEAR: 'Last year' // Fallback/General
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/**
 * Parses the weird Gmail date formats into a comparable Date object
 * Gmail formats: "8:45 PM", "Jan 10", "1/10/24"
 */
const parseGmailDate = (dateText: string): Date => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const text = dateText.trim();

  // 1. Time only (e.g., "8:45 PM") -> It's TODAY
  if (text.match(/^\d{1,2}:\d{2}\s?[AP]M$/i) || text.match(/^\d{1,2}:\d{2}$/)) {
    return now;
  }

  // 2. Short Date (e.g., "Jan 10") -> This year
  const shortDateMatch = text.match(/^([a-zA-Z]{3})\s(\d{1,2})$/);
  if (shortDateMatch) {
    const monthStr = shortDateMatch[1];
    const day = parseInt(shortDateMatch[2], 10);
    const monthIndex = MONTHS.findIndex(m => m.startsWith(monthStr));
    if (monthIndex !== -1) {
      const d = new Date(currentYear, monthIndex, day);
      // If result is in future (e.g. Dec 31 when today is Jan 1), it might be last year?
      // Gmail usually adds year if it's not this year. So this is safe.
      return d;
    }
  }

  // 3. Full Date (e.g., "1/10/23" or "Jan 10, 2023")
  // Let standard parser try
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Fallback
  return now;
};

const getLabelForDate = (date: Date): string => {
  const now = new Date();

  // Reset times for pure date comparison
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = n.getTime() - d.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);

  if (diffDays < 1 && n.getDate() === d.getDate()) return DATE_LABELS.TODAY;
  if (diffDays < 2 && diffDays >= 0) return DATE_LABELS.YESTERDAY; // Handles yesterday crossing months

  // If same month and year
  if (n.getMonth() === d.getMonth() && n.getFullYear() === d.getFullYear()) {
    return DATE_LABELS.THIS_MONTH;
  }

  // Otherwise return Month Name (e.g. "January") or Year if very old
  if (n.getFullYear() === d.getFullYear()) {
    return MONTHS[d.getMonth()];
  }

  return d.getFullYear().toString();
};

const insertHeader = (row: HTMLElement, label: string) => {
  // Check if header already exists
  const prev = row.previousElementSibling;
  if (prev && prev.classList.contains('fi-date-header')) {
    if (prev.textContent === label) return; // Correct header exists
    prev.remove(); // Wrong header (stale), remove it
  }

  const headerRow = document.createElement('tr');
  headerRow.className = 'fi-date-header';

  // Structure: A single cell spanning the table
  const cell = document.createElement('td');
  cell.colSpan = 10; // Span full width
  cell.textContent = label;

  headerRow.appendChild(cell);
  row.insertAdjacentElement('beforebegin', headerRow);
};

export const dateHeaders = {
  observer: null as MutationObserver | null,
  timeoutId: null as any,

  init() {
    if (this.observer) return;
    console.log('[Fresh Inbox] Date Headers Initialized (Observer Mode)');

    const observeTarget = document.querySelector('div[role="main"]') || document.body;

    this.observer = new MutationObserver(mutations => {
      let shouldUpdate = false;
      for (const m of mutations) {
        // Only care if nodes are added/removed (list update)
        if (m.addedNodes.length > 0 || m.removedNodes.length > 0) {
          shouldUpdate = true;
          break;
        }
      }

      if (shouldUpdate) {
        this.debouncedProcess();
      }
    });

    this.observer.observe(observeTarget, {
      childList: true,
      subtree: true
    });

    // Initial run
    this.debouncedProcess();
  },

  debouncedProcess() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      // Check if we are even on a list page before doing heavy work
      if (!isEmailListPage()) return;
      this.processRows();
    }, 100); // 100ms debounce
  },

  processRows() {
    if (!this.observer) return;

    // 1. PAUSE OBSERVER (Crucial to prevent infinite loop)
    this.observer.disconnect();

    try {
      // 2. Fast read: Get all email rows
      const rows = Array.from(document.querySelectorAll('tr.zA'));
      if (rows.length === 0) return;

      let lastLabel = '';
      const headersToRemove: HTMLElement[] = [];
      const headersToInsert: { row: HTMLElement; label: string }[] = [];

      // 3. Read Phase
      rows.forEach(row => {
        const emailRow = row as HTMLElement;

        // Check if there is a header immediately preceding this row
        const prev = emailRow.previousElementSibling;
        const existingHeader =
          prev && prev.classList.contains('fi-date-header') ? (prev as HTMLElement) : null;

        // Get Date
        const dateEl = emailRow.querySelector('.xW span') || emailRow.querySelector('.xW');
        if (!dateEl) return;

        const dateText = (dateEl.getAttribute('title') || dateEl.textContent || '').split('\n')[0];
        if (!dateText) return;

        const date = parseGmailDate(dateText);
        const label = getLabelForDate(date);

        if (label !== lastLabel) {
          // Needs a header here
          if (existingHeader) {
            if (existingHeader.textContent !== label) {
              headersToRemove.push(existingHeader);
              headersToInsert.push({ row: emailRow, label });
            }
          } else {
            headersToInsert.push({ row: emailRow, label });
          }
          lastLabel = label;
        } else {
          // Should NOT have a header here
          if (existingHeader) {
            headersToRemove.push(existingHeader);
          }
        }
      });

      // 4. Write Phase
      headersToRemove.forEach(h => h.remove());

      headersToInsert.forEach(({ row, label }) => {
        // USE DIV instad of TR to avoid breaking Gmail's table index
        const headerDiv = document.createElement('div');
        headerDiv.className = 'fi-date-header';
        headerDiv.textContent = label;

        // Insert before the row
        row.insertAdjacentElement('beforebegin', headerDiv);
      });
    } finally {
      // 5. RESUME OBSERVER
      const observeTarget = document.querySelector('div[role="main"]') || document.body;
      this.observer.observe(observeTarget, {
        childList: true,
        subtree: true
      });
    }
  }
};
