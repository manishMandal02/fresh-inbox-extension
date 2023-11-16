// get current selected category on the #inbox page
export const getSelectedCategory = () => {
  // get the active category element node
  const activeCategoryNode = document.querySelector(
    'tr[role="tablist"]>td>div[role="tab"][aria-selected="true"]'
  );

  console.log(
    '🚀 ~ file: getSelectedCategory.ts:8 ~ getSelectedCategory ~ activeCategoryNode:',
    activeCategoryNode
  );

  // if not found return empty string
  //@ts-ignore
  if (!activeCategoryNode?.checkVisibility()) return '';
  // get the category label
  const selectedCategory = activeCategoryNode.getAttribute('aria-label').toLowerCase().split(',')[0];

  return selectedCategory;
};
