import type { EmailAction } from '@src/pages/content/types/content.types';

const blockIconSvg = (
  <svg fill='#131212' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg' className='w-full h-full'>
    <g id='SVGRepo_bgCarrier' stroke-width='0'></g>
    <g id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'></g>
    <g id='SVGRepo_iconCarrier'>
      <path d='M500 930q-117 0-217-59-97-57-154-154-59-100-59-217t59-217q57-97 154-154 100-59 217-59t217 59q97 57 154 154 59 100 59 217t-59 217q-57 97-154 154-100 59-217 59zM320 760q39 28 85.5 42.5T500 817q86 0 160-44 71-42 113-113 44-74 44-160 0-48-14.5-94.5T760 320zm180-577q-86 0-160 44-71 42-113 113-44 74-44 160 0 48 14.5 94.5T240 680l440-440q-39-28-85.5-42.5T500 183z'></path>
    </g>
  </svg>
);

const deleteIconSvg = (
  <svg
    viewBox='-0.5 0 19 19'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    fill='none'
  >
    <g id='SVGRepo_bgCarrier' stroke-width='0'></g>
    <g id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'></g>
    <g id='SVGRepo_iconCarrier'>
      {' '}
      <title>icon/18/icon-delete</title> <desc>Created with Sketch.</desc> <defs> </defs>{' '}
      <g
        id='out'
        stroke='none'
        stroke-width='1'
        fill='none'
        fill-rule='evenodd'
        // sketch:type='MSPage'
      >
        {' '}
        <path
          d='M4.91666667,14.8888889 C4.91666667,15.3571429 5.60416667,16 6.0625,16 L12.9375,16 C13.3958333,16 14.0833333,15.3571429 14.0833333,14.8888889 L14.0833333,6 L4.91666667,6 L4.91666667,14.8888889 L4.91666667,14.8888889 L4.91666667,14.8888889 Z M15,3.46500003 L12.5555556,3.46500003 L11.3333333,2 L7.66666667,2 L6.44444444,3.46500003 L4,3.46500003 L4,4.93000007 L15,4.93000007 L15,3.46500003 L15,3.46500003 L15,3.46500003 Z'
          id='path'
          fill='#ef4444'
          // sketch:type='MSShapeGroup'
        >
          {' '}
        </path>{' '}
      </g>{' '}
    </g>
  </svg>
);

const whitelistIconSvg = (
  <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-full h-full'>
    <g id='SVGRepo_bgCarrier' stroke-width='0'></g>
    <g id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'></g>
    <g id='SVGRepo_iconCarrier'>
      {' '}
      <path
        d='M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z'
        fill='#22c55e'
      ></path>{' '}
    </g>
  </svg>
);
const reSubscribeIconSvg = (
  <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-full h-full'>
    <g id='SVGRepo_bgCarrier' stroke-width='0'></g>
    <g id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'></g>
    <g id='SVGRepo_iconCarrier'>
      {' '}
      <path
        d='M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z'
        fill='#3287ef'
      ></path>{' '}
    </g>
  </svg>
);

/*
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="#292D32"></path> </g></svg>
*/

export const ActionIcons: Record<EmailAction, JSX.Element[]> = {
  unsubscribe: [blockIconSvg],
  deleteAllMails: [deleteIconSvg],
  unsubscribeAndDeeAllMails: [
    blockIconSvg,
    <span className=' font-medium text-slate-600 ml-[2px] mr-[1px]'>+</span>,
    deleteIconSvg,
  ],
  whitelistEmail: [whitelistIconSvg],
  resubscribe: [reSubscribeIconSvg],
};
