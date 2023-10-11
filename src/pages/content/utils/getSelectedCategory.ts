// get current selected category on the #inbox page
export const getSelectedCategory = () => {
  // get the active category element node
  let activeCategoryNode = document.querySelector(
    'tr[role="tablist"]>td>div[role="tab"][aria-selected="true"]'
  );
  // if not found return empty string
  if (!activeCategoryNode || !activeCategoryNode.checkVisibility()) return '';
  // get the category label
  const selectedCategory = activeCategoryNode.getAttribute('aria-label').toLowerCase().split(',')[0];

  return selectedCategory;
};
