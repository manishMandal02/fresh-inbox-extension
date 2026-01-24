/**
 * Utility to detect and cache Gmail's frequently-changing CSS selectors
 * Reduces brittleness when Gmail updates their UI
 */

export class GmailSelectorDetector {
  private static selectorCache = new Map<string, string | null>();
  private static testElements = new Map<string, string[]>([
    // Thread/email row selectors
    ['threadRow', ['.zA', 'tr.zA', '[role="option"]', '.EBmjof']],

    // Subject line selectors
    ['subject', ['.bog', '.bqe', '[data-subject]', '.PF9o5e']],

    // Sender/from field selectors
    ['sender', ['.yW', '.Hk', '.iCJqb', '.a4W']],

    // Email snippet/preview selectors
    ['snippet', ['.y2', '.y3', '.Fxmcyf', '.vwWDMd']],

    // Date selectors
    ['date', ['.xW', '.y3', '.oJePAe', '.u9k6o']],

    // Star/toggle icon selectors
    ['star', ['.ams', '.y6', '[aria-label*="Not starred"]', '[aria-label*="Starred"]']],

    // Toolbar selectors for action buttons
    ['toolbar', ['.G-atb', '.btC', '[role="toolbar"]', '.HkgZ2d']],

    // Archive button in toolbar
    ['archiveBtn', ['.By8jEe', '[aria-label*="Archive"]', '[data-tooltip*="Archive"]']],

    // Delete button in toolbar
    ['deleteBtn', ['.pvN6Ec', '[aria-label*="Delete"]', '[data-tooltip*="Delete"]']],

    // Mark as read button
    ['readBtn', ['.T-I.J-J5-Ji', '[aria-label*="Mark as read"]', '[aria-label*="Mark as unread"]']],

    // Snooze button
    ['snoozeBtn', ['.gVNoLb', '[aria-label*="Snooze"]', '[data-tooltip*="Snooze"]']],

    // Compose button selectors
    ['composeBtn', ['.T-I.T-I-KE.L3', '[aria-label="Compose"]', '.Tl ']],

    // Compose window/dialog
    ['composeWindow', ['[role="dialog"]', '.dw', '.aSs', '.lhSoJf']],

    // Send button in compose
    ['sendBtn', ['.T-I.J-J5-Ji.aoO.v7s5Kf', '[aria-label="Send"]', '[data-tooltip="Send"]']],

    // Body/content area
    ['mainContent', ['[role="main"]', '.Rv8yCc', '.AHe75']],

    // Sidebar/navigation
    ['sidebar', ['[role="navigation"]', '.rP2Dde', '.nvA13d']]
  ]);

  /**
   * Find the best selector for a Gmail element by testing them against the DOM
   */
  static findSelector(selectorType: string): string | null {
    // Check cache first
    if (this.selectorCache.has(selectorType)) {
      return this.selectorCache.get(selectorType) || null;
    }

    const selectors = this.testElements.get(selectorType);
    if (!selectors) {
      console.warn(`[GmailSelector] Unknown selector type: ${selectorType}`);
      return null;
    }

    // Test each selector and use the first that finds elements
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Cache the working selector
          this.selectorCache.set(selectorType, selector);
          return selector;
        }
      } catch (e) {
        // Invalid selector, skip to next
        continue;
      }
    }

    // No working selector found - cache null
    this.selectorCache.set(selectorType, null);
    console.warn(`[GmailSelector] No valid selector found for: ${selectorType}`, selectors);
    return null;
  }

  /**
   * Safely query Gmail elements using detected selectors
   */
  static query(selectorType: string, context: Document | Element = document): Element | null {
    const selector = this.findSelector(selectorType);
    if (!selector) return null;

    try {
      return context.querySelector(selector);
    } catch (e) {
      return null;
    }
  }

  /**
   * Safely query all Gmail elements using detected selectors
   */
  static queryAll(selectorType: string, context: Document | Element = document): Element[] {
    const selector = this.findSelector(selectorType);
    if (!selector) return [];

    try {
      return Array.from(context.querySelectorAll(selector));
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear the cache (useful for testing or after Gmail updates)
   */
  static clearCache(): void {
    this.selectorCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { cached: number; failed: number; total: number } {
    let cached = 0;
    let failed = 0;

    this.selectorCache.forEach(value => {
      if (value === null) {
        failed++;
      } else {
        cached++;
      }
    });

    return {
      cached,
      failed,
      total: this.testElements.size
    };
  }

  /**
   * Add or update selector fallbacks
   */
  static addSelectors(selectorType: string, selectors: string[]): void {
    this.testElements.set(selectorType, selectors);
    this.selectorCache.delete(selectorType); // Clear cache for this type
  }
}
