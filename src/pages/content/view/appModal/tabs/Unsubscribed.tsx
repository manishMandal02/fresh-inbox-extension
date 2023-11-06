import { asyncHandler } from '@src/pages/content/utils/asyncHandler';
import { getUnsubscribedEmails } from '@src/pages/content/utils/getEmailsFromStorage';
import { useEffect, useState } from 'react';
import ActionButton from '../../elements/action-buttons';
import { Checkbox } from '../../elements/Checkbox';
import { Spinner } from '../../elements/Spinner';
import { EmailAction, type IActionInProgress } from '@src/pages/content/types/content.types';
import { handleReSubscribeAction } from '@src/pages/content/utils/emailActions';
import { limitCharLength } from '@src/pages/content/utils/limitCharLength';

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
    // action button for each email
    const actionButton = (email: string) => (
      <>
        <ActionButton
          action={EmailAction.whitelistEmail}
          tooltipLabel='ReSubscribe'
          onClick={() =>
            setEmailActionsInProgressFor({
              emails: [email],
              action: 'resubscribe',
            })
          }
          isDisabled={selectedEmails.length > 0 || actionInProgressFor?.emails.length > 1}
        />
      </>
    );

    // render action buttons or spinner based on loading state
    const renderActionButtons = (email: string) => {
      if (
        selectedEmails.length < 1 &&
        actionInProgressFor?.emails.length === 1 &&
        actionInProgressFor?.emails.includes(email)
      ) {
        // render loading spinner if a action is in progress for this email
        return <Spinner size='sm' />;
      }

      return actionButton(email);
    };

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
                      // handle deselect all
                      setSelectedEmails([]);
                      return;
                    }

                    // handle select all
                    setSelectedEmails([...unsubscribedEmails]);
                  }}
                />{' '}
              </td>
              <td className='w-[5%]'>#</td>
              <td className='w-[50%] ml-1'>Email</td>
              <td className='w-[40%] text-center'>Action </td>
            </tr>
            {unsubscribedEmails.map((email, idx) => (
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
                <td className='text-sm w-[50%]'>{limitCharLength(email, 32)}</td>
                <td className='text-sm w-[40%] flex items-center justify-center'>
                  {/* render action button or loading spinner (if action in progress) */}
                  {renderActionButtons(email)}
                </td>
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
          <div className='px-4 w-full h-full flex justify-between items-center'>
            {selectedEmails.length < 1 ? (
              // no email selected
              <span className='text-xs text-slate-600 font-extralight'>
                Select one or more emails to reSubscribe them
              </span>
            ) : (
              <>
                {/* email selected  */}
                <span className='text-sm text-slate-600 font-extralight w-[75%]'>
                  {selectedEmails.length}{' '}
                  {selectedEmails.length > 1 ? 'Emails' : `Email (${selectedEmails[0]})`} selected
                </span>
                <div className='mr-10 w-[25%]  '>
                  {actionInProgressFor?.emails.length > 0 ? (
                    // show loading spinner if action in progress
                    <Spinner size='sm' />
                  ) : (
                    // show possible actions for selected emails
                    <div className='flex items-centers justify-center min-w-fit z-50'>
                      <ActionButton
                        action={EmailAction.whitelistEmail}
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
      <div className='text-slate-800 w-full text-center font-light'>
        📭 No Unsubscribed emails found, Start unsubscribing unwanted emails to see them here.
      </div>
    );
  };

  return (
    <div className='w-full h-full max-h-full'>
      <p className='h-[5%] m-0 text-slate-700 mb-[.4rem] font-light text-sm flex items-center justify-center'>
        Fresh Inbox has unsubscribed <u className='mx-1'>{unsubscribedEmails.length}</u> emails to keep your
        📨 inbox clean
      </p>

      <div className='h-px w-full bg-slate-300' />

      {/* bottom container */}
      <div className='w-full h-[95%] flex flex-col justify-center items-start'>
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
