import { EmailAction } from '@src/pages/content/types/content.types';
import { ActionIcons } from '../../elements/action-buttons/ActionIcons';

export const General = () => {
  const UnsubscribeIcon = ActionIcons[EmailAction.unsubscribe];
  const DeleteAllMailsIcon = ActionIcons[EmailAction.deleteAllMails];
  const WhitelistIcon = ActionIcons[EmailAction.whitelistEmail];
  const ReSubscribeIcon = ActionIcons[EmailAction.resubscribe];
  const UnsubscribeAndDeleteMailIcon = ActionIcons[EmailAction.unsubscribeAndDeeAllMails];
  return (
    <div className='flex flex-col  py-8 px-6 relative h-full'>
      <div className='text-lg font-medium m-0 mb-1 '>
        Fresh Inbox is
        <span
          className='rounded-sm ml-2 px-3  py-1  relative bg-slate-800 text-slate-100'
          style={{
            borderRadius: '3px',
          }}
        >
          Active
          {/* active ping animation */}
          <span className='absolute flex h-3 w-3 -top-1 -right-1'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75'></span>
            <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-400'></span>
          </span>
        </span>
      </div>

      <span className='  my-2 leading-6'>
        Fresh Inbox helps you keep your inbox clean, it can{' '}
        <span className='bg-emerald-100 px-2 rounded-sm py-1 font-medium'>
          unsubscribe to unwanted emails
        </span>
        {'  '} like newsletter and bulk <br />
        <span className='bg-emerald-100 px-2 rounded-sm py-1 font-medium'>
          delete 🧹 100s of emails in a single click
        </span>
        .
      </span>

      <span className='text-slate-900  my-1 leading-7'>
        <span className='bg-emerald-100 px-2 rounded-sm py-1 font-medium'>
          The best part is that no data ever leaves your browser
        </span>
        , all the actions are executed on your system. I've open-sourced the code on 🔗{' '}
        <a
          href='https://github.com/manishMandal02/fresh-Inbox'
          target='_blank'
          rel='noreferrer'
          className='appearance-none underline font-medium'
        >
          Github {'  '}
        </a>
        for you to see how Fresh Inbox works.
      </span>
      <span className='text-slate-700  mt-2 leading-6'>
        A quick walkthrough of Fresh Inbox can help you get started, if you're having trouble understanding
        it's features 🔗{' '}
        <a
          href='https://www.youtube.com/watch?v=testvideo'
          target='_blank'
          rel='noreferrer'
          className='appearance-none underline font-medium'
        >
          Walkthrough
        </a>
      </span>

      {/*****  divider ****** */}
      <hr className='h-[.5px] w-full bg-slate-100  opacity-25 rounded-sm my-1.5' />

      {/* understanding action icons */}
      <p className=' font-light text-slate-700 m-0 mb-px'>Actions you can perform with FreshInbox</p>
      <div className='w-full'>
        {/* unsubscribe/block */}
        <span className='flex items-center mt-2 rounded-sm w-full  '>
          <div
            className='w-6 flex items-center justify-center px-1.5 py-1 rounded-sm'
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
        <span className='flex items-center mt-2 rounded-sm w-full  '>
          <div
            className='w-6 flex items-center justify-center px-1.5 py-1 rounded-sm'
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
        <span className='flex items-center mt-2 rounded-sm w-full  '>
          <div
            className='w-6 flex items-center justify-center px-1.5 py-1 rounded-sm'
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
        <span className='flex items-center mt-2 rounded-sm w-full  '>
          <div
            className='w-6 flex items-center justify-center px-1.5 py-1 rounded-sm'
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
        <span className='flex items-center mt-2 rounded-sm w-full  '>
          <div
            className='flex items-center justify-center p-0 w-14 h-6 px-1.5 py-1 rounded-sm'
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

      <button className='w-max absolute bottom-4 left-[45%] px-2 py-px  underline font-light text-center cursor-pointer rounded-sm border-0 bg-transparent mx-auto text-sm text-slate-700 hover:text-slate-950 transition-all duration-150'>
        Disable Fresh Inbox
      </button>
    </div>
  );
};
