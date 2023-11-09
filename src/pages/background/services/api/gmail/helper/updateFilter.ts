import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { createFilter, deleteFilter, getFilterById } from './gmailFilters';
import { storageKeys } from '@src/pages/background/constants/app.constants';

type UpdateFilterParams = {
  token: string;
  emails: string[];
  filterId: string;
  filterAction: FILTER_ACTION;
};

// set storage key based on filter action
const getStorageKeyByAction = (filterAction: FILTER_ACTION) => {
  if (filterAction === FILTER_ACTION.INBOX) {
    return { sync: storageKeys.WHITELIST_FILTER_ID, local: storageKeys.WHITELISTED_EMAILS };
  } else if (filterAction === FILTER_ACTION.TRASH) {
    return { sync: storageKeys.UNSUBSCRIBE_FILTER_ID, local: storageKeys.UNSUBSCRIBED_EMAILS };
  }
};

// update filter helper
export const addEmailToFilter = async ({ token, emails, filterId, filterAction }: UpdateFilterParams) => {
  // sync storage (storage id)
  const storageKey = getStorageKeyByAction(filterAction);

  const filter = await getFilterById(token, filterId);

  // add email to existing filter emails
  const updatedFilterEmails = new Set([...filter.emails, ...emails]);

  // delete existing filter
  await deleteFilter(token, filterId);

  // create new filter with updated emails
  const newFilterId = await createFilter({ token, emails: [...updatedFilterEmails], filterAction });

  // save new filter id to sync storage
  await chrome.storage.sync.set({ [storageKey.sync]: newFilterId });
  // save updated emails to local storage
  await chrome.storage.local.set({ [storageKey.local]: updatedFilterEmails });
};

// remove email from filter
export const removeEmailFromFilter = async ({
  token,
  emails,
  filterId,
  filterAction,
}: UpdateFilterParams) => {
  // sync storage (storage id)
  const storageKey = getStorageKeyByAction(filterAction);

  // get  filter id
  // get filter by id
  const filter = await getFilterById(token, filterId);
  // update the email list, remove the email
  const updatedFilterEmails = filter.emails.filter(e => !emails.includes(e));
  // delete current whitelist/inbox filter
  await deleteFilter(token, filterId);
  // create new one with new emails list
  const newFilterId = await createFilter({
    token,
    emails: [...updatedFilterEmails],
    filterAction: FILTER_ACTION.INBOX,
  });
  // save the new whitelist filter id
  await chrome.storage.sync.set({ [storageKey.sync]: newFilterId });
  // save the updated whitelisted emails
  await chrome.storage.local.set({ [storageKey.local]: updatedFilterEmails });
};
