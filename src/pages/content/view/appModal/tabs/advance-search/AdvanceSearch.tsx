import { useState } from 'react';
import { Spinner } from '../../../elements/Spinner';
import SearchForm from './SearchForm';
import {
  IMessageEvent,
  type IMessageBody,
  type SearchFormData,
} from '@src/pages/content/types/content.types';
import { logger } from '@src/pages/content/utils/logger';
import InfoIcon from '../../../elements/InfoIcon';
import { showConfirmModal } from '../../../elements/confirmModal';
import { showSnackbar } from '../../../elements/snackbar';

const AdvanceSearch = () => {
  const [searchResEmailIds, setSearchResEmailIds] = useState<string[] | null>(null);
  const [isLoadingSearchRes, setIsLoadingSearchRes] = useState(false);

  // bulk delete state
  const [isDeleting, setIsDeleting] = useState(false);

  // handle search click
  const handleSearch = async (formData: SearchFormData) => {
    if (
      !formData.keyword &&
      !formData.isRead &&
      !formData.isUnRead &&
      !formData.afterDate &&
      !formData.beforeDate
    )
      return;
    // reset the previous res state if any
    if (searchResEmailIds) setSearchResEmailIds(null);

    setIsLoadingSearchRes(true);

    // send search event to background script
    const res = await chrome.runtime.sendMessage<IMessageBody, string[]>({
      event: IMessageEvent.ADVANCE_SEARCH,
      advanceSearch: formData,
    });

    setIsLoadingSearchRes(false);

    if (res) {
      setSearchResEmailIds(res);
    } else {
      logger.error({
        msg: 'Failed to get result for advance search',
        error: formData,
        fileTrace: 'views/appModal/tabs/advance-search/AdvanceSearch.tsx',
      });
    }
  };

  // handle bulk delete all matched emails
  const handleBulkDelete = async () => {
    showConfirmModal({
      msg: `Are you sure you want to delete ${searchResEmailIds.length} emails? <br /> This action will move them to the trash.`,
      email: '',
      isBulkDelete: true,
      onConfirmClick: async () => {
        setIsDeleting(true);
        // send bulk delete event to background script
        const res = await chrome.runtime.sendMessage<IMessageBody, boolean>({
          event: IMessageEvent.BULK_DELETE,
          emails: searchResEmailIds,
        });

        if (res) {
          showSnackbar({ title: `Successfully deleted ${searchResEmailIds.length} emails.`, emails: [] });
          setSearchResEmailIds(null);
        } else {
          showSnackbar<true>({ title: `Failed to delete emails.`, isError: true });
        }
        setIsDeleting(false);
      },
    });
  };

  return (
    <div className='w-full h-full max-h-full'>
      <p className='h-[5%] m-0 text-slate-700 mb[2px] font-light text-sm flex items-center justify-center'>
        Use Advance Search to filter out for emails you want to delete in bulk.
      </p>

      <hr className='bg-slate-200 opacity-30 p-0 m-0 my-2' />

      {/* search input container (filter options) */}
      <div className='flex flex-col px-12 py-4'>
        {/* search form */}
        <SearchForm onSubmit={handleSearch} isSubmitting={isLoadingSearchRes} />

        {/* search result container */}
        <div className='w-full mt-10 flex flex-col justify-center items-start '>
          {/*  */}
          {searchResEmailIds ? (
            // search result count
            <div className='w-full flex flex-col items-center justify-center'>
              <span className='text-lg m-0 font-medium text-slate-800'>{searchResEmailIds.length}</span>
              <span className='text-sm m-0 text-slate-500 font-extralight text-center'>
                Emails match your search filter
              </span>

              <button
                className={`bg-rose-500 ml-1 mt-4 w-36 px-6 py-2
        font-medium rounded-md border-none text-slate-50 text-sm cursor-pointer  transition-all duration-200 hover:bg-opacity-90`}
                onClick={handleBulkDelete}
              >
                {!isDeleting ? 'Delete All' : <Spinner size='sm' color='#f43f5e' />}
              </button>

              {/* show alert info bulk delete is in process */}
              {isDeleting ? (
                <span className='text-xs text-slate-500 font-extralight text-center mt-1.5 flex items-center'>
                  <InfoIcon /> This may take a few seconds, do not close or refresh the page.
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdvanceSearch;
