/**
 * Debug tools injected directly into the page
 * This runs immediately and makes debug tools available in console
 */

// Run this immediately when the script loads
(function () {
  const debugComposeModal = () => {
    console.log('\n%c=== COMPOSE MODAL DEBUG ===', 'font-size: 14px; font-weight: bold; color: #0066cc;');

    const selectors = ['[role="dialog"]', '.dw', '.aSs', '.lhSoJf', '[aria-label="Compose"]'];

    let composeElement = null;
    let foundWith = '';

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        composeElement = el;
        foundWith = selector;
        break;
      }
    }

    if (!composeElement) {
      console.log('%c❌ Compose modal NOT FOUND in DOM', 'color: red; font-weight: bold;');
      console.log('Searched for:', selectors.join(', '));
      return;
    }

    console.log(`%c✅ Found compose with selector: ${foundWith}`, 'color: green; font-weight: bold;');
    console.log('Element:', composeElement);

    const styles = window.getComputedStyle(composeElement);

    console.log('%c--- VISUAL PROPERTIES ---', 'font-weight: bold; color: #666;');
    console.log('display:', styles.display);
    console.log('visibility:', styles.visibility);
    console.log('opacity:', styles.opacity);
    console.log('z-index:', styles.zIndex);
    console.log('pointer-events:', styles.pointerEvents);

    console.log('%c--- POSITIONING ---', 'font-weight: bold; color: #666;');
    console.log('position:', styles.position);
    console.log('top:', styles.top);
    console.log('left:', styles.left);
    console.log('right:', styles.right);
    console.log('bottom:', styles.bottom);
    console.log('transform:', styles.transform);

    console.log('%c--- DIMENSIONS ---', 'font-weight: bold; color: #666;');
    console.log('width:', styles.width);
    console.log('height:', styles.height);
    console.log('max-width:', styles.maxWidth);
    console.log('max-height:', styles.maxHeight);
    console.log('overflow:', styles.overflow);

    console.log('%c--- ACTUAL METRICS ---', 'font-weight: bold; color: #666;');
    const rect = composeElement.getBoundingClientRect();
    console.log(`Position on screen: top=${rect.top}, left=${rect.left}`);
    console.log(`Size: ${rect.width}x${rect.height}`);
    console.log(`Visible on screen:`, {
      left: rect.left >= 0,
      right: rect.right <= window.innerWidth,
      top: rect.top >= 0,
      bottom: rect.bottom <= window.innerHeight
    });

    console.log('%c--- PARENT CONTEXT ---', 'font-weight: bold; color: #666;');
    const parent = composeElement.parentElement;
    if (parent) {
      const parentStyles = window.getComputedStyle(parent);
      console.log('Parent:', parent.className || parent.tagName);
      console.log('Parent position:', parentStyles.position);
      console.log('Parent display:', parentStyles.display);
      console.log('Parent overflow:', parentStyles.overflow);
    }

    console.log('%c--- ISSUES DETECTED ---', 'font-weight: bold; color: #ff6600;');
    const issues = [];

    if (styles.display === 'none') {
      issues.push('❌ display: none - Element is hidden!');
    }
    if (styles.visibility === 'hidden') {
      issues.push('❌ visibility: hidden - Element is hidden!');
    }
    if (styles.opacity === '0') {
      issues.push('❌ opacity: 0 - Element is transparent!');
    }
    if (styles.pointerEvents === 'none') {
      issues.push('❌ pointer-events: none - Cannot click element!');
    }
    if (styles.zIndex && parseInt(styles.zIndex) < 1000) {
      issues.push(`⚠️  z-index is low: ${styles.zIndex}`);
    }
    if (rect.top > window.innerHeight || rect.bottom < 0) {
      issues.push('❌ Element is off-screen vertically!');
    }
    if (rect.left > window.innerWidth || rect.right < 0) {
      issues.push('❌ Element is off-screen horizontally!');
    }
    if (rect.width === 0 || rect.height === 0) {
      issues.push('❌ Element has zero size!');
    }

    if (issues.length === 0) {
      console.log('%c✅ No obvious issues detected!', 'color: green; font-weight: bold;');
    } else {
      issues.forEach(issue => console.log(issue));
    }

    console.log('\n%c=== END DEBUG ===', 'font-size: 14px; font-weight: bold; color: #0066cc;');
  };

  const forceShowCompose = () => {
    console.log('%c=== FORCE SHOWING COMPOSE ===', 'font-size: 12px; font-weight: bold; color: #0066cc;');

    const selectors = ['[role="dialog"]', '.dw', '.aSs', '.lhSoJf', '[aria-label="Compose"]'];
    let count = 0;

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el: any) => {
        el.style.display = 'block !important';
        el.style.visibility = 'visible !important';
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.style.zIndex = '2147483647';
        el.style.transform = 'none';

        count++;
        console.log(`Applied force-show to: ${selector}`);
      });
    }

    if (count === 0) {
      console.log('%c⚠️  No compose elements found to force show', 'color: orange;');
    } else {
      console.log(`%c✅ Force-showed ${count} element(s)`, 'color: green; font-weight: bold;');
    }
  };

  // Make globally available
  (window as any).__freshInboxDebug = {
    compose: {
      debug: debugComposeModal,
      forceShow: forceShowCompose
    }
  };

  console.log('%c✅ Fresh Inbox Debug Tools Ready!', 'color: green; font-weight: bold;');
  console.log('Try: window.__freshInboxDebug.compose.debug()');
})();
