import { asyncHandler } from '@src/pages/content/utils/asyncHandler';
import { useEffect, useState } from 'react';
import { Spinner } from '../../elements/Spinner';
import { Checkbox } from '../../elements/Checkbox';
import { IMessageEvent, type EmailAction } from '@src/pages/content/types/content.types';
import { storageKeys } from '@src/pages/content/constants/app.constants';
import { getLocalStorageByKey } from '@src/pages/content/utils/getStorageByKey';

type NewsletterData = {
  email: string;
  name: string;
};

type ActionInProgress = {
  emails: string[];
  action: EmailAction;
};

const data: NewsletterData[] = [
  { email: 'test1@gmail.com', name: 'test mandal' },
  { email: 'test2@gmail.com', name: 'test mandal' },
  { email: 'test3@gmail.com', name: 'test mandal' },
  { email: 'test4@gmail.com', name: 'test mandal' },
  { email: 'test5@gmail.com', name: 'test mandal' },
  { email: 'test6@gmail.com', name: 'test mandal' },
  { email: 'test7@gmail.com', name: 'test mandal' },
  { email: 'test8@gmail.com', name: 'test mandal' },
  { email: 'test9@gmail.com', name: 'test mandal' },
  { email: 'test10@gmail.com', name: 'test mandal' },
  { email: 'test11@gmail.com', name: 'test mandal' },
  { email: 'test12@gmail.com', name: 'test mandal' },
  { email: 'test13@gmail.com', name: 'test mandal' },
  { email: 'test14@gmail.com', name: 'test mandal' },
];

const getNewsletterEmailsData = async (shouldRefreshData = false) => {
  let newsletterEmails: NewsletterData[] = [];
  const getNewsletterEmailsFromBackground = async () => {
    // send message to background to get data
    newsletterEmails = await chrome.runtime.sendMessage({ event: IMessageEvent.GET_NEWSLETTER_EMAILS });

    console.log(
      '🚀 ~ file: Newsletter.tsx:42 ~ getNewsletterEmailsFromBackground ~ newsletterEmails:',
      newsletterEmails
    );

    // save newsletter data to chrome local storage
    await chrome.storage.local.set({ [storageKeys.NEWSLETTER_EMAILS]: newsletterEmails });
  };

  if (shouldRefreshData) {
    await getNewsletterEmailsFromBackground();
  } else {
    //T check if the newsletter emails data is already stored in chrome.storage.local
    // get local storage data
    const storageData = await getLocalStorageByKey<NewsletterData[]>(storageKeys.NEWSLETTER_EMAILS);

    console.log('🚀 ~ file: Newsletter.tsx:53 ~ getNewsletterEmailsData ~ storageData:', storageData);

    // check if newsletters data already exists
    if (storageData.length > 0) {
      // data already exists, use it
      newsletterEmails = storageData;
    } else {
      // data doesn't exist, fetch from background script
      await getNewsletterEmailsFromBackground();
    }
  }

  console.log('🚀 ~ file: Newsletter.tsx:65 ~ getNewsletterEmailsData ~ newsletterEmails:', newsletterEmails);
  return newsletterEmails;
};

// TODO: take out the common fn/cmp to reuse for other tabs
//TODO: fire actions👇
// TODO: build other tabs

// TODO: confirm modal  - bit design update

// TODO: snackbar - bit design update

export const Newsletter = () => {
  // newsletter emails
  const [newsletterEmails, setNewsletterEmails] = useState<NewsletterData[]>([]);
  // selected emails
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  // loading state while fetching emails
  const [isFetchingNewsletterEmails, setIsFetchingNewsletterEmails] = useState(false);

  // email actions states
  // current email/emails that are being unsubscribed, deleted, whitelisted, etc.
  const [actionInProgressFor, setEmailActionsInProgressFor] = useState<ActionInProgress | null>(null);

  // get newsletter emails data
  useEffect(
    asyncHandler(async () => {
      setIsFetchingNewsletterEmails(true);
      const data = await getNewsletterEmailsData();

      setNewsletterEmails(data);
      setIsFetchingNewsletterEmails(false);
    }),

    []
  );

  // email action
  useEffect(
    asyncHandler(async () => {
      // TODO: fire email action
    }),
    [actionInProgressFor]
  );

  const renderTable = () => {
    const actionButtons = (email: string) => (
      <>
        <button
          className='text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer transition-all duration-200 disabled:grayscale  disabled:cursor-default disabled:opacity-70'
          onClick={() => setEmailActionsInProgressFor({ emails: [email], action: 'whitelistEmail' })}
          disabled={selectedEmails.length > 0 || actionInProgressFor?.emails.length > 1}
        >
          ✅
        </button>
        <button
          className='text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer transition-all duration-200 disabled:grayscale  disabled:cursor-default disabled:opacity-70'
          onClick={() => setEmailActionsInProgressFor({ emails: [email], action: 'unsubscribe' })}
          disabled={selectedEmails.length > 0 || actionInProgressFor?.emails.length > 1}
        >
          ❌
        </button>
        <button
          className='text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer transition-all duration-200 disabled:grayscale  disabled:cursor-default disabled:opacity-70'
          onClick={() => setEmailActionsInProgressFor({ emails: [email], action: 'deleteAllMails' })}
          disabled={selectedEmails.length > 0 || actionInProgressFor?.emails.length > 1}
        >
          🗑️
        </button>
        <button
          className='text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer transition-all duration-200 disabled:grayscale  disabled:cursor-default disabled:opacity-70'
          onClick={() =>
            setEmailActionsInProgressFor({ emails: [email], action: 'unsubscribeAndDeeAllMails' })
          }
          disabled={selectedEmails.length > 0 || actionInProgressFor?.emails.length > 1}
        >
          ❌ + 🗑️
        </button>
      </>
    );

    const renderActionButtons = (email: string) => {
      if (
        selectedEmails.length < 1 &&
        actionInProgressFor?.emails.length === 1 &&
        actionInProgressFor?.emails.includes(email)
      ) {
        // render loading spinner if a action is in progress for this email
        return <Spinner size='sm' />;
      }

      return actionButtons(email);
    };

    return newsletterEmails.length > 0 ? (
      //  emails table
      <table className='w-full px-4 py-2 z-10 bg-slate-50 relative'>
        {/* table header */}
        <tr className='w-full sticky top-0 left-0 text-sm font-medium text-slate-600 bg-slate-200 flex items-center justify-between px-6 py-1.5 z-20'>
          {/* left container */}
          <td className='w-[5%]'>
            <Checkbox
              isChecked={selectedEmails.length === newsletterEmails.length}
              onChange={isChecked => {
                if (!isChecked) {
                  // handle select all
                  setSelectedEmails([]);
                  return;
                }

                // handle deselect all
                setSelectedEmails([...newsletterEmails.map(email => email.email)]);
              }}
            />{' '}
          </td>
          <td className='w-[5%]'>#</td>
          <td className='w-[30%] ml-1'>Name</td>
          <td className='w-[30%] ml-1'>Email</td>
          <td className='w-[30%] text-center'>Action </td>
        </tr>
        {newsletterEmails.map(({ email, name }, idx) => (
          <tr
            key={email + name}
            className='w-full flex items-center  justify-between px-6 odd:bg-slate-100 py-1.5 hover:bg-slate-200/60 transition-all duration-150'
          >
            {/* left container */}
            <td className='w-[5%]'>
              <Checkbox
                isChecked={selectedEmails.includes(email)}
                onChange={isChecked => {
                  if (!isChecked) {
                    // unchecked, remove the email from the list
                    setSelectedEmails(prevEmails => prevEmails.filter(e => e !== email));
                    return;
                  }

                  // checked, add the email to the list
                  setSelectedEmails(prevEmails => [...prevEmails, email]);
                }}
              />
            </td>
            <td className='text-sm w-[5%]'>{idx + 1}.</td>
            <td className='text-sm ml-1 w-[30%]'>{name.replace(`\\`, '').trim()}</td>
            <td className='text-sm w-[30%]'>{email}</td>
            {/* right container */}
            <td className='text-sm w-[30%] flex items-center justify-between z-10 pl-8 pr-6'>
              {/* render action button or loading spinner (if action in progress) */}
              {renderActionButtons(email)}
            </td>
          </tr>
        ))}
      </table>
    ) : (
      <div className='text-slate-800 mt-16 font-light'>
        📭 No Newsletter or mailing list emails found in your Inbox.
        <br />
        <p className='ml-2 mt-3 opacity-60 font-extralight text-sm'>
          {' '}
          Emails already unsubscribed by Fresh Inbox won't be visible here.
        </p>
      </div>
    );
  };

  return (
    <div className='w-full h-full max-h-full'>
      <h2 className=' text-slate-700 text-center mb-[.4rem] font-light text-sm'>
        Fresh Inbox has identified <u id='newsletterTab-numNewsletterEmails'>{newsletterEmails.length}</u>{' '}
        emails as newsletters or as part of a mailing list.
      </h2>

      <hr className='h-px w-full bg-slate-400' />

      {/* table container */}
      <div className='h-full'>
        <div className='w-full h-[90%] flex justify-center items-start overflow-x-hidden overflow-y-auto'>
          {isFetchingNewsletterEmails ? <Spinner size='lg' /> : renderTable()}
        </div>

        {/* selected emails */}
        <div className='h-[10%] w-full bg-slate-200 flex justify-between items-center px-6 border-t border-slate-500/50'>
          {selectedEmails.length < 1 ? (
            // no email selected
            <span className='text-xs text-slate-600 font-extralight'>
              Select multiple emails to perform bulk actions or click on action button for individual email
              actions
            </span>
          ) : (
            <>
              {/* email selected  */}
              <span className='text-sm text-slate-600 font-extralight'>
                {selectedEmails.length} {selectedEmails.length > 1 ? 'Emails' : 'Email'} selected
              </span>
              {/*  email action  */}
              <div className='mr-10'>
                {actionInProgressFor?.emails.length > 0 ? (
                  <Spinner size='sm' />
                ) : (
                  <>
                    <button
                      className='border border-slate-300 rounded-md px-1.5 py-px cursor-pointer text-sm h-max mr-2.5 z-[150]'
                      onClick={() => {
                        setEmailActionsInProgressFor({
                          emails: [...selectedEmails],
                          action: 'whitelistEmail',
                        });
                      }}
                    >
                      ✅
                    </button>
                    <button
                      className='border border-slate-300 rounded-md px-1.5 py-px cursor-pointer text-sm h-max mr-2.5'
                      onClick={() =>
                        setEmailActionsInProgressFor({ emails: [...selectedEmails], action: 'unsubscribe' })
                      }
                    >
                      ❌
                    </button>
                    <button
                      className='border border-slate-300 rounded-md px-1.5 py-px cursor-pointer text-sm h-max mr-2.5'
                      onClick={() =>
                        setEmailActionsInProgressFor({
                          emails: [...selectedEmails],
                          action: 'deleteAllMails',
                        })
                      }
                    >
                      🗑️
                    </button>
                    <button
                      className='border border-slate-300 rounded-md px-1.5 py-px cursor-pointer text-sm h-max'
                      onClick={() =>
                        setEmailActionsInProgressFor({
                          emails: [...selectedEmails],
                          action: 'unsubscribeAndDeeAllMails',
                        })
                      }
                    >
                      ❌ + 🗑️
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
