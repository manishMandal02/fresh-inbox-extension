import { asyncHandler } from '@src/pages/content/utils/asyncHandler';
import { getUnsubscribedEmails } from '@src/pages/content/utils/getEmailsFromStorage';
import { useEffect, useState } from 'react';
import ActionButton from '../../elements/ActionButton';
import { Checkbox } from '../../elements/Checkbox';
import { Spinner } from '../../elements/Spinner';
import type { IActionInProgress } from '@src/pages/content/types/content.types';
import { handleReSubscribeAction } from '@src/pages/content/utils/emailActions';

//TODO: dummy data, remove later
const data = [
  'test1@gmail.com',
  'test2@gmail.com',
  'test3@gmail.com',
  'test4@gmail.com',
  'test5@gmail.com',
  'test6@gmail.com',
  'test7@gmail.com',
  'test8@gmail.com',
  'test9@gmail.com',
  'test10@gmail.com',
  'test11@gmail.com',
  'test12@gmail.com',
  'test13@gmail.com',
  'test14@gmail.com',
];

const Unsubscribed = () => {
  // unsubscribed emails
  const [unsubscribedEmails, setUnsubscribedEmails] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  // loading state
  const [isFetchingNewsletterEmails, setIsFetchingNewsletterEmails] = useState(false);
  // selected emails
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  // email actions states
  // current email/emails that are being unsubscribed, deleted, whitelisted, etc.
  const [actionInProgressFor, setEmailActionsInProgressFor] = useState<IActionInProgress | null>(null);

  // get unsubscribed emails
  useEffect(
    asyncHandler(async () => {
      // set loading sta
      setIsFetchingNewsletterEmails(true);
      // get unsubscribed emails from background
      const unsubscribedEmails = await getUnsubscribedEmails();

      if (unsubscribedEmails) {
        setUnsubscribedEmails(unsubscribedEmails);
      } else {
        setErrorMsg('❌ Failed to get unsubscribed emails list');
      }

      // reset loading state
      setIsFetchingNewsletterEmails(false);
    }),
    []
  );

  // handle email action (re-subscribe)
  useEffect(
    asyncHandler(async () => {
      // do nothing if no email action in progress
      if (!actionInProgressFor || actionInProgressFor.emails.length < 1) return;

      if (actionInProgressFor.action === 'resubscribe') {
        const isSuccess = await handleReSubscribeAction({ emails: actionInProgressFor.emails });

        if (isSuccess) {
          // reset state
          const unsubscribedEmails = await getUnsubscribedEmails();
          if (unsubscribedEmails) {
            setUnsubscribedEmails(unsubscribedEmails);
          } else {
            setErrorMsg('❌ Failed to get unsubscribed emails list');
          }
          setEmailActionsInProgressFor(null);
          setSelectedEmails([]);
        }
      }
    }),
    [actionInProgressFor]
  );

  const renderTable = () => {
    return unsubscribedEmails.length > 0 ? (
      <>
        {/* emails table */}
        {/* table container */}
        <div className='w-full  h-[90%] overflow-x-hidden overflow-y-auto z-20'>
          <table className='w-full h-full bg-slate-50 relative  z-30'>
            {/* table header */}
            <tr className='w-full sticky top-0 left-0 text-sm font-medium text-slate-600 bg-slate-200 flex items-center justify-between px-4 py-1.5 z-20'>
              <td className='w-[5%]'>
                <Checkbox
                  isChecked={selectedEmails.length === unsubscribedEmails.length}
                  onChange={isChecked => {
                    if (!isChecked) {
                      // handle select all
                      setSelectedEmails([]);
                      return;
                    }

                    // handle deselect all
                    setSelectedEmails([...unsubscribedEmails.map(email => email.email)]);
                  }}
                />{' '}
              </td>
              <td className='w-[5%]'>#</td>
              <td className='w-[30%] ml-1'>Name</td>
              <td className='w-[30%] ml-1'>Email</td>
              <td className='w-[30%] text-center'>Action </td>
            </tr>
            {unsubscribedEmails.map(({ email, name }, idx) => (
              <tr
                key={email + name}
                className='w-full flex items-center  justify-between px-4 odd:bg-slate-100 py-1.5 hover:bg-slate-200/60 transition-all duration-150 z-20'
              >
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
                <td className='text-sm ml-1 w-[30%]'>{name.replaceAll(`\\`, '').trim()}</td>
                <td className='text-sm w-[30%]'>{email}</td>
                {/* <td className='text-sm w-[30%] flex items-center justify-between pl-8 pr-6'> */}
                {/* render action button or loading spinner (if action in progress) */}
                {/* {renderActionButtons(email)} */}
                {/* </td> */}
              </tr>
            ))}
            {/* refresh table button */}
            <tr>
              <td colSpan={5} className='w-full flex justify-center items-center'></td>
            </tr>
          </table>
        </div>

        {/* selected emails */}
        <div className='h-[10%] max-w-full overflow-hidden z-50 w-full bg-slate-200 flex justify-between items-center border-t border-slate-500/50'>
          <div className='px-4'>
            {selectedEmails.length < 1 ? (
              // no email selected
              <span className='text-xs text-slate-600 font-extralight'>
                Select multiple emails to perform bulk actions or click on action button for individual email
                actions
              </span>
            ) : (
              <>
                {/* email selected  */}
                <span className='text-sm text-slate-600 font-extralight w-[75%]'>
                  {selectedEmails.length} {selectedEmails.length > 1 ? 'Emails' : 'Email'} selected
                </span>
                <div className='mr-10 w-[25%]  '>
                  {actionInProgressFor?.emails.length > 0 ? (
                    // show loading spinner if action in progress
                    <Spinner size='sm' />
                  ) : (
                    // show possible actions for selected emails
                    <div className='flex items-centers justify-between min-w-fit z-50'>
                      <ActionButton
                        text={'✅'}
                        tooltipLabel='ReSubscribe'
                        onClick={() =>
                          setEmailActionsInProgressFor({
                            emails: [...selectedEmails],
                            action: 'resubscribe',
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </>
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
      <p>
        Fresh Inbox has unsubscribed <u>{unsubscribedEmails.length}</u> emails to keep your 📨 inbox clean
      </p>

      <div className='h-px w-full bg-slate-300' />

      {/* bottom container */}
      <div className='w-full h-full flex flex-col justify-center items-start'>
        {/* render table after loading or show error msg if failed */}
        {isFetchingNewsletterEmails ? (
          <Spinner size='lg' />
        ) : !errorMsg ? (
          renderTable()
        ) : (
          <p className='text-red-400 bg-red-100/75 px-8  py-2 text font-light '>{errorMsg}</p>
        )}
      </div>
    </div>
  );
};

export default Unsubscribed;
