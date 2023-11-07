import { useState } from 'react';
import InfoIcon from '../../../elements/InfoIcon';
import Switch from '../../../elements/Switch';
import Tooltip from '../../../elements/TooltipReact';
import { Checkbox } from '../../../elements/Checkbox';
import Datepicker, { DateRangeType } from 'react-tailwindcss-datepicker';

const SearchForm = () => {
  // form state
  const [keyword, setKeyword] = useState('');
  const [isRead, setIsRead] = useState(false);
  const [isUnRead, setIsUnRead] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>({ startDate: '', endDate: '' });

  console.log('🚀 ~ file: SearchForm.tsx:15 ~ SearchForm ~ dateRange:', dateRange);

  // toggle states
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);
  const [isAfterDateActive, setIsAfterDateActive] = useState(false);
  const [isBeforeDateActive, setIsBeforeDateActive] = useState(false);
  return (
    <div>
      {/* top line inputs */}
      <div className='flex px-12 py-2 items-end'>
        {/* search keyword */}
        <div className='flex items-start flex-col justify-center'>
          <label
            htmlFor='search-keyword'
            className='font-light text-sm mb-1 text-slate-700 flex items-center justify-start'
          >
            Keywords
            <Tooltip
              label={`Enter keyword to search for specific terms in the email subjects or body`}
              top={220}
              right={1000}
            >
              <InfoIcon />
            </Tooltip>
          </label>
          <input
            type='text'
            id='search-keyword'
            placeholder='unsubscribe'
            className='appearance-none px-2 py-px text-base font-light text-slate-800 border  border-slate-500 rounded w-48'
          />
        </div>
        {/* labels checkboxes */}
        <div className=' flex items-center justify-start mb-1 ml-4'>
          {/* is-read */}
          <div className='flex items-center mr-6'>
            <Checkbox id='isReadCheckbox' isChecked={isRead} onChange={value => setIsRead(value)} />
            <label
              htmlFor='isReadCheckbox'
              className='font-light text-sm ml-1.5 text-slate-700 flex items-center justify-start'
            >
              Read
              <Tooltip label={`Search emails that have been read.`} top={220} right={1000}>
                <InfoIcon />
              </Tooltip>
            </label>
          </div>
          {/* is-unRead */}
          <div className='flex items-center '>
            <Checkbox id='isUnReadCheckbox' isChecked={isUnRead} onChange={value => setIsUnRead(value)} />
            <label
              htmlFor='isUnReadCheckbox'
              className='font-light text-sm ml-1.5 text-slate-700 flex items-center justify-start'
            >
              Unread
              <Tooltip label={`Search emails that has not been read.`} top={220} right={1000}>
                <InfoIcon />
              </Tooltip>
            </label>
          </div>
        </div>
      </div>
      {/* bottom line inputs */}
      <div className='flex mt-4 px-12 py-2'>
        {/* date range */}
        <div className='flex items-center flex-col'>
          <label className='font-light text-sm text-slate-700 flex items-center mb-2'>
            Date Range
            <Tooltip label={`Search emails from a specific date range (form & to)`} top={200} right={700}>
              <InfoIcon />
            </Tooltip>
            {/* switch (toggle this input on/off) */}
            <Switch value={isDateRangeActive} onChange={value => setIsDateRangeActive(value)} />
          </label>
          {isDateRangeActive ? (
            <Datepicker value={dateRange} onChange={value => setDateRange(value)} primaryColor='emerald' />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
