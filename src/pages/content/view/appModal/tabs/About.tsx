import { EmailAction } from '@src/pages/content/types/content.types';
import { ActionIcons } from '../../elements/action-button/ActionIcons';
import { disableApp } from '@src/pages/content/utils/disableApp';
import { Checkbox } from '../../elements/Checkbox';
import { useEffect, useState } from 'react';
import { getSyncStorageByKey } from '@src/pages/content/utils/getStorageByKey';
import { asyncHandler } from '@src/pages/content/utils/asyncHandler';
import { storageKeys } from '@src/pages/content/constants/app.constants';
import { showSnackbar } from '../../elements/snackbar';
import { createStorageKey } from '@src/pages/content/utils/createStorageKey';

type Props = {
  onAppDisable: () => void;
};

export const About = ({ onAppDisable }: Props) => {
  // local state
  const [isCheckedAlertMsg, setIsCheckedAlertMsg] = useState(false);

  useEffect(
    asyncHandler(async () => {
      // check user preference , if the user want's to see the delete confirmation message or not
      const shouldShowDeleteConfirmMsg = await getSyncStorageByKey<boolean>('DONT_SHOW_DELETE_CONFIRM_MSG');

      if (typeof shouldShowDeleteConfirmMsg === 'boolean') {
        setIsCheckedAlertMsg(shouldShowDeleteConfirmMsg);
      }
    }),
    []
  );

  // on update preference (checkbox)
  const handleCheckboxUpdate = async (value: boolean) => {
    // update checkbox state
    // if checked, update storage (sync) to save preference (checked = user doesn't want to see this message again)
    // create storage key
    const storageKey = createStorageKey(storageKeys.DONT_SHOW_DELETE_CONFIRM_MSG);

    await chrome.storage.sync.set({ [storageKey]: value });
    setIsCheckedAlertMsg(value);

    showSnackbar({ title: 'Updated preferences', emails: [] });
  };

  /// action icons
  const UnsubscribeIcon = ActionIcons[EmailAction.unsubscribe];
  const DeleteAllMailsIcon = ActionIcons[EmailAction.deleteAllMails];
  const WhitelistIcon = ActionIcons[EmailAction.whitelistEmail];
  const ReSubscribeIcon = ActionIcons[EmailAction.resubscribe];
  const UnsubscribeAndDeleteMailIcon = ActionIcons[EmailAction.unsubscribeAndDeeAllMails];

  // handle disable app
  const handleDisable = async () => {
    onAppDisable();
    await disableApp();
  };

  return (
    <div className='flex flex-col  py-8 px-6 relative h-full'>
      <div className='text-lg font-medium m-0 mb-1.5 '>
        Fresh Inbox is
        <span
          className='rounded-sm ml-2 px-[10px]  py-[2px] text-base relative bg-slate-800 text-slate-100'
          style={{
            borderRadius: '3px',
          }}
        >
          Active
          {/* active ping animation */}
          <span className='absolute flex h-3 w-3 -top-1 -right-1'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75'></span>
            <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400'></span>
          </span>
        </span>
      </div>

      {/*****  divider ****** */}
      <hr className='h-[.5px] w-full bg-slate-100  opacity-25 rounded-sm mt-2 mb-1' />
      <p className=' font-light text-slate-700 m-0 mb-px text-sm'>Update preferences</p>
      {/* checkbox  */}
      <div className='w-full flex items-center py-1.5 px-2'>
        <Checkbox isChecked={isCheckedAlertMsg} onChange={handleCheckboxUpdate} id='about-alertMsgCheckbox' />
        <label
          className='text-sm font-light text-slate-700 ml-1.5 cursor-pointer'
          htmlFor='about-alertMsgCheckbox'
        >
          Don't show alert message for delete actions.
        </label>
      </div>

      {/*****  divider ****** */}
      <hr className='h-[.5px] w-full bg-slate-100  opacity-25 rounded-sm my-1' />

      <span className='text-slate-900 text-[.9rem] my-0.5 leading-[1.6rem]'>
        Fresh Inbox helps you keep your inbox clean, it can&nbsp;
        <span className='bg-emerald-100 px-1 rounded-sm py-1 font-medium'>
          unsubscribe from unwanted emails
        </span>
        &nbsp;like newsletters, promotional mails, etc. <br /> and&nbsp;
        <span className='bg-emerald-100 px-1 rounded-sm py-1 font-medium'>
          bulk 🧹 delete 100s of emails in a single click
        </span>
        .
      </span>

      <span className='text-slate-900 text-[.9rem]  mt-1.5 mb-1 leading-[1.6rem]'>
        {' '}
        The best part?&nbsp;
        <span className='bg-emerald-100 px-1 rounded-sm py-1 font-medium'>
          Your data never leaves your browser
        </span>
        —every action is executed securely on your system. You can explore the open-source code on 🔗 GitHub
        to get an inside look at how Fresh Inbox operates.{' '}
        <a
          href='https://freshinbox.xyz/link/github'
          target='_blank'
          rel='noreferrer'
          className='appearance-none underline font-medium'
        >
          Github {'  '}
        </a>
        for you to see how Fresh Inbox works.
      </span>

      {/*****  divider ****** */}
      <hr className='h-[.5px] w-full bg-slate-100  opacity-25 rounded-sm mt-1.5 mb-1' />

      <span className='text-slate-700  leading-6 text-[.85rem]'>
        A quick walkthrough of Fresh Inbox can help you get started, if you're having trouble understanding
        it's features 🔗{' '}
        <a
          href='https://freshinbox.xyz/link/demo'
          target='_blank'
          rel='noreferrer'
          className='appearance-none underline font-medium'
        >
          Walkthrough
        </a>
      </span>

      {/* app walkthrough yt link */}
      <span className='text-slate-700 mt-0.5 leading-6 text-[.85rem]'>
        Enjoying Fresh Inbox? We'd love to hear your thoughts! Consider leaving a review if it's been helpful.
        🌟{' '}
        <a
          href='https://freshinbox.xyz/link/review'
          target='_blank'
          rel='noreferrer'
          className='appearance-none underline font-medium'
        >
          Review
        </a>
      </span>

      {/*****  divider ****** */}
      <hr className='h-[.5px] w-full bg-slate-100  opacity-25 rounded-sm mt-1.5 mb-1.5' />

      <p className=' font-normal text-slate-800 m-0 text-sm  mb-px'>
        Actions you can perform with FreshInbox
      </p>
      {/* actions block */}
      <div className='w-full'>
        {/* unsubscribe/block */}
        <span className='flex items-center mt-1.5 rounded w-full  '>
          <div
            className='w-4 flex items-center justify-center px-1 py-1 rounded'
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
          >
            {UnsubscribeIcon}
          </div>
          <span className=' w-full py-1 px-2 text-slate-700 font-light text-sm'>
            <u>Unsubscribe:</u> This action blocks emails from the sender.
          </span>
        </span>
        {/* delete all mails */}
        <span className='flex items-center mt-1.5 rounded w-full  '>
          <div
            className='w-4 flex items-center justify-center px-1 py-1 rounded'
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
          >
            {DeleteAllMailsIcon}
          </div>
          <span className=' w-full py-1 px-2 text-slate-700 font-light text-sm'>
            <u>Delete All Mails:</u> Deletes all emails from specific sender.
          </span>
        </span>

        {/* whitelist */}
        <span className='flex items-center mt-1.5 rounded w-full  '>
          <div
            className='w-4 flex items-center justify-center px-1 py-1 rounded'
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
          >
            {WhitelistIcon}
          </div>
          <span className=' w-full py-1 px-2 text-slate-700 font-light text-sm'>
            <u>Whitelist:</u> This action ensures that emails from the sender continue to arrive in your
            inbox.
          </span>
        </span>
        {/* re-subscribe */}
        <span className='flex items-center mt-1.5 rounded w-full  '>
          <div
            className='w-4 flex items-center justify-center px-1 py-1 rounded'
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
          >
            {ReSubscribeIcon}
          </div>
          <span className=' w-full py-1 px-2 text-slate-700 font-light text-sm'>
            <u>ReSubscribe:</u> Reverses an unsubscribe action, allowing you to resubscribe to an email sender
            you previously unsubscribed from.
          </span>
        </span>
        {/* unsubscribe + delete all */}
        <span className='flex items-center mt-1.5 rounded w-full  '>
          <div
            className='flex items-center justify-center p-0 w-12 h-6 px-1 py-0.5 rounded'
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
          >
            {UnsubscribeAndDeleteMailIcon}
          </div>
          <span className=' w-full py-1 px-2 text-slate-700 font-light text-sm'>
            Combines the actions of unsubscribing and deleting all emails from the sender.
          </span>
        </span>
      </div>

      <button
        className='w-max absolute bottom-2 left-[45%] px-2 py-px  underline font-light text-center cursor-pointer rounded-sm border-0 bg-transparent mx-auto text-sm text-slate-700 hover:text-slate-950 transition-all duration-150'
        onClick={handleDisable}
      >
        Disable Fresh Inbox
      </button>
    </div>
  );
};
2.5;
