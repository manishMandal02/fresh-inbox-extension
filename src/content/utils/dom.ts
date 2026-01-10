/**
 * DOM Utilities for interacting with Gmail's complex structure.
 */

export const dom = {
  /**
   * Wait for an element to appear in the DOM.
   */
  waitForEl(selector: string, timeout = 10000): Promise<HTMLElement | null> {
    return new Promise((resolve) => {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector) as HTMLElement;
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      if (timeout > 0) {
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, timeout);
      }
    });
  },

  /**
   * Safely query for an element.
   */
  query<T extends HTMLElement>(selector: string, parent: Element | Document = document): T | null {
    return parent.querySelector(selector) as T | null;
  },

  /**
   * Safely query for all elements matching a selector.
   */
  queryAll<T extends HTMLElement>(selector: string, parent: Element | Document = document): T[] {
    return Array.from(parent.querySelectorAll(selector)) as T[];
  },

  /**
   * Create an element with optional classes and attributes.
   */
  create<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options: {
      classes?: string[];
      id?: string;
      attributes?: Record<string, string>;
      text?: string;
      html?: string;
    } = {}
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (options.classes) el.classList.add(...options.classes);
    if (options.id) el.id = options.id;
    if (options.attributes) {
      for (const [key, val] of Object.entries(options.attributes)) {
        el.setAttribute(key, val);
      }
    }
    if (options.text) el.textContent = options.text;
    if (options.html) el.innerHTML = options.html;
    return el;
  },

  /**
   * Remove all children from an element.
   */
  empty(el: HTMLElement): void {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  },

  /**
   * Check if an element is currently visible in the viewport.
   */
  isInViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
};