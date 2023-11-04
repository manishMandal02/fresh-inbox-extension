export const General = () => {
  return (
    <div className='flex flex-col  py-12 px-6 '>
      <h2 className='text-lg font-medium m-0 mb-1.5 '>
        Fresh Inbox is <span className='bg-emerald-300 px-2 rounded-sm py-px text-slate-800'>Active</span>
      </h2>

      <p className='  my-4 leading-6'>
        Fresh Inbox helps you keep your inbox clean, it can{' '}
        <strong className='bg-emerald-100 px-2 rounded-sm py-px'> unsubscribe to unwanted emails </strong>{' '}
        like newsletter and bulk{' '}
        <strong className='bg-emerald-100 px-2 rounded-sm py-px'>
          {' '}
          delete 🧹 100s of emails in a single click
        </strong>
        .
      </p>

      <p className='text-slate-900  my-2 leading-7'>
        <strong className='bg-emerald-100 px-2 rounded-sm py-px'>
          The best part is that no data ever leaves your browser
        </strong>
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
      </p>
      <p className='text-slate-900  my-2 leading-6'>
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
      </p>

      <button className='w-max mt-36  px-2 py-px  underline font-light text-center cursor-pointer rounded-sm border-0 bg-transparent mx-auto text-sm text-slate-700 hover:text-slate-950 transition-all duration-150'>
        Disable Fresh Inbox
      </button>
    </div>
  );
};
