import wait from '../../utils/wait';

const addTooltip = (parentEl: HTMLElement, title: string) => {
  // tooltip message el
  const tooltipMsg = document.createElement('span');

  tooltipMsg.innerText = title;
  tooltipMsg.classList.add('mailMagic-tooltip');

  // add relative pos to parent el
  if (parentEl.style.position !== 'absolute' && parentEl.style.position !== 'relative') {
    parentEl.style.position = 'relative';
  }

  // add tooltip
  parentEl.addEventListener('mouseenter', () => {
    parentEl.appendChild(tooltipMsg);
  });

  // remove tooltip
  parentEl.addEventListener('mouseleave', () => {
    if (parentEl.contains(tooltipMsg)) {
      parentEl.removeChild(tooltipMsg);
    }
  });
};

export { addTooltip };
