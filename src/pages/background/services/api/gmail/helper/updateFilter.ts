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
  }
  return { sync: storageKeys.UNSUBSCRIBE_FILTER_ID, local: storageKeys.UNSUBSCRIBED_EMAILS };
};

// update filter helper
export const addEmailToFilter = async ({ token, emails, filterId, filterAction }: UpdateFilterParams) => {
  // sync storage (storage id)
  const storageKey = getStorageKeyByAction(filterAction);

  console.log('🚀 ~ file: updateFilter.ts:25 ~ addEmailToFilter ~ storageKey:', storageKey);

  const filter = await getFilterById(token, filterId);

  console.log('🚀 ~ file: updateFilter.ts:29 ~ addEmailToFilter ~ filter:', filter);

  // if email already present in the filter, do nothing (return back)
  const isEmailAlreadyPresent = filter.emails.filter(email => emails.includes(email));

  console.log(
    '🚀 ~ file: updateFilter.ts:34 ~ addEmailToFilter ~ isEmailAlreadyPresent:',
    isEmailAlreadyPresent
  );

  if (isEmailAlreadyPresent.length === emails.length) return true;

  // add email to existing filter emails
  const updatedFilterEmails = new Set([...filter.emails, ...emails]);

  console.log('🚀 ~ file: updateFilter.ts:44 ~ addEmailToFilter ~ updatedFilterEmails:', updatedFilterEmails);

  // delete existing filter
  await deleteFilter(token, filterId);

  // create new filter with updated emails
  const newFilterId = await createFilter({ token, filterAction, emails: [...updatedFilterEmails] });

  console.log('🚀 ~ file: updateFilter.ts:52 ~ addEmailToFilter ~ newFilterId:', newFilterId);

  // save new filter id to sync storage
  await chrome.storage.sync.set({ [storageKey.sync]: newFilterId });
  // save updated emails to local storage
  await chrome.storage.local.set({ [storageKey.local]: [...updatedFilterEmails] });

  return true;
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

  // get filter by id
  const filter = await getFilterById(token, filterId);

  console.log('🚀 ~ file: removeEmailFromFilter.ts:79  ~ filter:', filter);

  // update the email list, remove the email
  const updatedFilterEmails = filter.emails.filter(e => !emails.includes(e));

  console.log('🚀 ~ file: updateFilter.ts:80 ~ updatedFilterEmails:', updatedFilterEmails);

  // delete current  filter
  await deleteFilter(token, filterId);

  // create new one with new emails list
  const newFilterId = await createFilter({
    token,
    emails: [...updatedFilterEmails],
    filterAction: FILTER_ACTION.INBOX,
  });
  // save the filter id to chrome sync storage
  await chrome.storage.sync.set({ [storageKey.sync]: newFilterId });
  // save the updated  emails to chrome local storage
  await chrome.storage.local.set({ [storageKey.local]: updatedFilterEmails });
};
