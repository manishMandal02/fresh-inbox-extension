import { FILTER_ACTION } from '@src/pages/background/types/background.types';
import { createFilter, deleteFilter, getFilterById } from './gmailFilters';
import { storageKeys } from '@src/pages/background/constants/app.constants';

type UpdateFilterParams = {
  userToken: string;
  emails: string[];
  filterId: string;
  filterAction: FILTER_ACTION;
};

// set storage key based on filter action
const getStorageKeyByAction = (filterAction: FILTER_ACTION) => {
  if (filterAction === FILTER_ACTION.INBOX) {
    return { sync: storageKeys.WHITELIST_FILTER_ID, local: storageKeys.WHITELISTED_EMAILS };
  }
  return { sync: storageKeys.UNSUBSCRIBE_FILTER_ID, local: storageKeys.UNSUBSCRIBED_EMAILS };
};

// update filter helper
export const addEmailToFilter = async ({ userToken, emails, filterId, filterAction }: UpdateFilterParams) => {
  // sync storage (storage id)
  const storageKey = getStorageKeyByAction(filterAction);

  const filter = await getFilterById(userToken, filterId);

  // if email already present in the filter, do nothing (return back)
  const isEmailAlreadyPresent = filter.emails.filter(email => emails.includes(email));

  if (isEmailAlreadyPresent.length === emails.length) return true;

  // add email to existing filter emails
  const updatedFilterEmails = new Set([...filter.emails, ...emails]);

  // delete existing filter
  await deleteFilter(userToken, filterId);

  // create new filter with updated emails
  const newFilterId = await createFilter({ userToken, filterAction, emails: [...updatedFilterEmails] });

  // save new filter id to sync storage
  await chrome.storage.sync.set({ [storageKey.sync]: newFilterId });
  // save updated emails to local storage
  await chrome.storage.local.set({ [storageKey.local]: [...updatedFilterEmails] });

  return true;
};

// remove email from filter
export const removeEmailFromFilter = async ({
  userToken,
  emails,
  filterId,
  filterAction,
}: UpdateFilterParams) => {
  // sync storage (storage id)
  const storageKey = getStorageKeyByAction(filterAction);

  // get filter by id
  const filter = await getFilterById(userToken, filterId);

  // update the email list, remove the email
  const updatedFilterEmails = filter.emails.filter(e => !emails.includes(e));

  // delete current  filter
  await deleteFilter(userToken, filterId);

  // create new one with new emails list
  const newFilterId = await createFilter({
    userToken,
    emails: [...updatedFilterEmails],
    filterAction: filterAction,
  });
  // save the filter id to chrome sync storage
  await chrome.storage.sync.set({ [storageKey.sync]: newFilterId });
  // save the updated  emails to chrome local storage
  await chrome.storage.local.set({ [storageKey.local]: updatedFilterEmails });
};
