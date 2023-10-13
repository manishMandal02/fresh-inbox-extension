// get active id (#inbox or #spam) from url
import type { GmailFolder } from '../../../types/content.types';

export const getAnchorIdFromURL = (): GmailFolder => {
  let currentId = location.href.split('#')[1];

  // if the id has a path remove it
  if (currentId.indexOf('/') !== -1) {
    currentId = currentId.split('/')[0];
  }

  return currentId as GmailFolder;
};
