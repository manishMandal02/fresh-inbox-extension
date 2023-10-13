// get current selected category on the #inbox page
export const getSelectedCategory = () => {
  // get the active category element node
  const activeCategoryNode = document.querySelector(
    'tr[role="tablist"]>td>div[role="tab"][aria-selected="true"]'
  );
  // if not found return empty string
  if (!activeCategoryNode?.checkVisibility()) return '';
  // get the category label
};
