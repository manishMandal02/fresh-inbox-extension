import { useState } from 'react';
import InfoIcon from '../../../elements/InfoIcon';
import Switch from '../../../elements/Switch';
import Tooltip from '../../../elements/TooltipReact';
import { Checkbox } from '../../../elements/Checkbox';
import DatePicker from '../../../elements/DatePicker';
import { Spinner } from '../../../elements/Spinner';
import type { SearchFormData } from '@src/pages/content/types/content.types';

type Props = {
  onSubmit: (formData: SearchFormData) => void;
  isSubmitting: boolean;
};

const SearchForm = ({ onSubmit, isSubmitting }: Props) => {
  // form state
  const [keyword, setKeyword] = useState('');
  const [isRead, setIsRead] = useState(false);
  const [isUnRead, setIsUnRead] = useState(false);
  const [afterDate, setAfterDate] = useState<string | null>(null);
  const [beforeDate, setBeforeDate] = useState<string | null>(null);

  // toggle states
  const [isFromDateActive, setIsFromDateActive] = useState(false);
  const [isToDateActive, setIsToDateActive] = useState(false);

  // handle search
  const handleSearch = () => {
    onSubmit({ keyword, isUnRead, isRead, afterDate, beforeDate });
  };
  return (
    <div className='w-full flex flex-col items-center justify-center'>
      {/* top line inputs */}
      <div className='flex px-8 py-2 items-end'>
        {/* search keyword */}
        <div className='flex items-start flex-col justify-center'>
          <label
            htmlFor='search-keyword'
            className='font-light text-sm mb-1 text-slate-700 flex items-center justify-start'
          >
            Keywords
            <Tooltip label={`Enter keyword to search for specific terms in the email subjects or body`}>
              <InfoIcon />
            </Tooltip>
          </label>
          <input
            type='text'
            id='search-keyword'
            placeholder='unsubscribe'
            value={keyword}
            onChange={ev => setKeyword(ev.target.value)}
            className='appearance-none px-2 py-px text-base font-light text-slate-800 border  border-slate-400 rounded w-48'
          />
        </div>
        {/* after date */}
        <div className='flex items-center flex-col relative ml-6'>
          <label className='font-light text-sm text-slate-700 flex items-center mb-2'>
            After Date
            <Tooltip label={`Search emails after this date.`}>
              <InfoIcon />
            </Tooltip>
            {/* switch (toggle this input on/off) */}
            <Switch value={isFromDateActive} onChange={value => setIsFromDateActive(value)} />
          </label>
          <div className='absolute  -bottom-full left-auto mt-2 ml-1'>
            {isFromDateActive ? <DatePicker value={afterDate} onChange={setAfterDate} /> : null}
          </div>
        </div>
        {/* before date */}
        <div className='flex items-center flex-col relative ml-6'>
          <label className='font-light text-sm text-slate-700 flex items-center mb-2'>
            Before Date
            <Tooltip label={`Search emails before this date.`}>
              <InfoIcon />
            </Tooltip>
            {/* switch (toggle this input on/off) */}
            <Switch value={isToDateActive} onChange={value => setIsToDateActive(value)} />
          </label>
          <div className='absolute  -bottom-full left-auto mt-2 ml-1'>
            {isToDateActive ? <DatePicker value={beforeDate} onChange={setBeforeDate} /> : null}
          </div>
        </div>

        {/* labels checkboxes */}
        <div className=' flex items-center justify-start mb-2 ml-4'>
          {/* is-read */}
          <div className='flex items-center mr-6'>
            <Checkbox
              id='isReadCheckbox'
              isChecked={isRead}
              onChange={value => {
                setIsUnRead(false);
                setIsRead(value);
              }}
            />
            <label
              htmlFor='isReadCheckbox'
              className='font-light text-sm ml-1.5 text-slate-700 flex items-center justify-start'
            >
              Read
              <Tooltip label={`Search emails that have been read.`}>
                <InfoIcon />
              </Tooltip>
            </label>
          </div>
          {/* is-unRead */}
          <div className='flex items-center '>
            <Checkbox
              id='isUnReadCheckbox'
              isChecked={isUnRead}
              onChange={value => {
                setIsRead(false);
                setIsUnRead(value);
              }}
            />
            <label
              htmlFor='isUnReadCheckbox'
              className='font-light text-sm ml-1.5 text-slate-700 flex items-center justify-start'
            >
              Unread
              <Tooltip label={`Search emails that has not been read.`}>
                <InfoIcon />
              </Tooltip>
            </label>
          </div>
        </div>
      </div>
      <button
        className={`bg-brand-primary mx-auto mt-12 w-32 px-6 py-2
        font-medium rounded-md border-none text-slate-50 text-sm cursor-pointer  transition-all duration-200 hover:bg-opacity-90`}
        onClick={handleSearch}
      >
        {!isSubmitting ? 'Search' : <Spinner size='sm' />}
      </button>
      {/* show alert info searching is in process, as it takes time */}
      {isSubmitting ? (
        <span className='text-xs text-slate-500 font-extralight text-center mt-1.5 flex items-center'>
          <InfoIcon /> This may take few seconds, do not close or refresh the page.
        </span>
      ) : null}
    </div>
  );
};

export default SearchForm;
