import { dom } from '../../utils/dom';
import { EmailCard } from './emailCard';
import { EmailThread } from '../../../types/email';

const ROW_HEIGHT = 104; // 96px card + 8px margin
const BUFFER = 10; // Increase buffer to reduce blank space during fast scroll

export class VirtualScroller {
  private container: HTMLElement;
  private contentHeightEl: HTMLElement;
  private pool: EmailCard[] = [];
  private activeCards: Map<number, EmailCard> = new Map();
  private items: EmailThread[] = [];
  
  private scrollTop = 0;
  private viewportHeight = 0;
  private isTicking = false;
  
  // Selection State
  private selectedIds: Set<string> = new Set();
  private activeId: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.style.position = 'relative';
    this.container.style.overflowY = 'auto';
    this.container.style.contain = 'strict'; // optimize rendering

    // Spacer to force scrollbar
    this.contentHeightEl = dom.create('div', { 
      classes: ['fi-scroller-spacer'],
      attributes: { style: 'position: absolute; top: 0; left: 0; width: 1px; z-index: -1; opacity: 0; pointer-events: none;' }
    });
    this.container.appendChild(this.contentHeightEl);

    this.onScroll = this.onScroll.bind(this);
    this.container.addEventListener('scroll', this.onScroll, { passive: true });
    
    // Initial measure
    this.viewportHeight = this.container.clientHeight || window.innerHeight;
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.viewportHeight = this.container.clientHeight;
      this.render();
    });
  }

  setData(items: EmailThread[], selectedIds: Set<string>, activeId: string | null) {
    this.items = items;
    this.selectedIds = selectedIds;
    this.activeId = activeId;
    
    // Update total height
    this.contentHeightEl.style.height = `${items.length * ROW_HEIGHT}px`;
    
    // Force immediate render
    this.render();
  }

  private onScroll() {
    this.scrollTop = this.container.scrollTop;
    if (!this.isTicking) {
      window.requestAnimationFrame(() => {
        this.render();
        this.isTicking = false;
      });
      this.isTicking = true;
    }
  }

  private render() {
    const startIndex = Math.max(0, Math.floor(this.scrollTop / ROW_HEIGHT) - BUFFER);
    const endIndex = Math.min(
      this.items.length,
      Math.ceil((this.scrollTop + this.viewportHeight) / ROW_HEIGHT) + BUFFER
    );

    // Identify indices to keep
    const indicesToRender = new Set<number>();
    for (let i = startIndex; i < endIndex; i++) {
      indicesToRender.add(i);
    }

    // Remove cards no longer in view
    for (const [index, card] of this.activeCards) {
      if (!indicesToRender.has(index)) {
        this.recycleCard(index, card);
      }
    }

    // Add new cards
    for (let i = startIndex; i < endIndex; i++) {
      if (!this.activeCards.has(i)) {
        const item = this.items[i];
        const card = this.getCard();
        
        // Position
        card.element.style.transform = `translate3d(0, ${i * ROW_HEIGHT}px, 0)`; // translate3d forces GPU
        
        // Update Data
        card.update(
          item, 
          this.selectedIds.has(item.id), 
          this.activeId === item.id
        );
        
        this.activeCards.set(i, card);
      }
    }
  }

  private getCard(): EmailCard {
    let card: EmailCard;
    if (this.pool.length > 0) {
      card = this.pool.pop()!;
    } else {
      card = new EmailCard();
      card.element.style.position = 'absolute';
      card.element.style.top = '0';
      card.element.style.left = '0';
      card.element.style.width = '100%';
      card.element.style.height = `${ROW_HEIGHT - 8}px`; // Minus margin
      // Optimize
      card.element.style.willChange = 'transform';
      this.container.appendChild(card.element);
    }
    card.element.style.display = 'grid'; // Restore display (was grid)
    return card;
  }

  private recycleCard(index: number, card: EmailCard) {
    this.activeCards.delete(index);
    card.element.style.display = 'none';
    this.pool.push(card);
  }
}
