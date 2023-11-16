import { getAnchorIdFromURL } from '@src/pages/content/view/assistant-button/helper/getAnchorIdFromURL';

// checks if the current url is supported (inbox, starred, all, spam, search)
export const isSupportedURL = () => {
  // get anchor id form the url

  const anchorId = getAnchorIdFromURL();

  // labels/pages to embed the assistant button on
  const supportedLabels = ['inbox', 'starred', 'all', 'spam', 'search'];

  // check if anchor id is present and it is one of the supported labels
  if (anchorId && supportedLabels.includes(anchorId)) {
    // supported url
    return true;
  }
  // not supported url
  return false;
};
