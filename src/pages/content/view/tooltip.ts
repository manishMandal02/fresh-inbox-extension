const addTooltip = (parentEl: HTMLElement, title: string) => {
  // tooltip message el
  const tooltipMsg = document.createElement('span');

  tooltipMsg.innerText = title;
  tooltipMsg.id = 'mailMagic-tooltip';

  // add relative pos to parent el
  if (parentEl.style.position !== 'absoulte' && parentEl.style.position !== 'relative') {
    parentEl.style.position = 'relative';
    // parentEl.style.display = 'inline-block';
  }

  parentEl.appendChild(tooltipMsg);

  parentEl.addEventListener('mouseenter', ev => {
    ev.stopPropagation();
    parentEl.appendChild(tooltipMsg);
  });
  parentEl.addEventListener('mouseleave', ev => {
    ev.stopPropagation();
    parentEl.removeChild(tooltipMsg);
  });
};

const removeTooltip = (parentEl: HTMLElement) => {
  // remove tooltip element
  parentEl.querySelector('span#mailMagic-tooltip')?.remove();
  // remove parent el
  parentEl.remove();
};

export { addTooltip, removeTooltip };
