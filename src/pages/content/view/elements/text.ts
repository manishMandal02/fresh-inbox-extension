// common text message el
const renderTextMsg = (text: string) => {
  // text container
  const container = document.createElement('div');
  // text element
  const textEl = document.createElement('p');

  // add a class
  container.classList.add('mailMagic-TextMsg');

  // add text content
  textEl.innerHTML = text;

  // append element
  container.appendChild(textEl);

  return container;
};

export { renderTextMsg };
