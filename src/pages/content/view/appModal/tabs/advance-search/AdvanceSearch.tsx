import { useState } from 'react';
import { Spinner } from '../../../elements/Spinner';
import Tooltip from '../../../elements/TooltipReact';
import InfoIcon from '../../../elements/InfoIcon';
import Switch from '../../../elements/Switch';
import SearchForm from './SearchForm';

const AdvanceSearch = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [searchResultCount, setSearchResultCount] = useState('');
  const [isLoadingSearchRes, setIsLoadingSearchRes] = useState<null | number>(null);

  // handle search click
  const handleSearch = async () => {};

  return (
    <div className='w-full h-full max-h-full'>
      <p className='h-[5%] m-0 text-slate-700 mb[2px] font-light text-sm flex items-center justify-center'>
        Use Advance Search to filter out for emails you want to delete.
      </p>

      <hr className='bg-slate-200 opacity-30 p-0 m-0 my-2' />

      {/* search input container (filter options) */}
      <div className='flex flex-col px-12 py-4'>
        {/* search form */}
        <SearchForm />

        <button
          className='bg-brand-primary mx-auto mt-8 w-32 px-3 py-1.5 font-medium rounded-md border-none text-slate-50 text-sm cursor-pointer  transition-all duration-200 hover:bg-opacity-90'
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* search result container */}
      <div className='w-full h-[95%] flex flex-col justify-center items-start'>
        {/*  */}
        {isLoadingSearchRes ? (
          <Spinner size='lg' />
        ) : !errorMsg ? (
          // search result count
          <span>{searchResultCount}</span>
        ) : (
          // search error
          <p className='text-red-400 bg-red-100/75 px-8  py-2 text font-light '>{errorMsg}</p>
        )}
      </div>
    </div>
  );
};

export default AdvanceSearch;
