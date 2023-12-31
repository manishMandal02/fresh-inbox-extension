import { useEffect, useState } from 'react';
import { Tabs } from '../elements/Tabs';
import { About } from './tabs/About';
import { Newsletter } from './tabs/Newsletter';
import AuthCard from './AuthCard';
import Unsubscribed from './tabs/Unsubscribed';
import Whitelisted from './tabs/Whitelisted';
import AdvanceSearch from './tabs/advance-search';

import FreshInboxIcon from './../../assets/app-icon-128.png';
import Tooltip from '../elements/TooltipReact';
import { IMessageEvent, type IMessageBody } from '../../types/content.types';
import { asyncMessageHandler } from '../../utils/asyncMessageHandler';
import { logger } from '../../utils/logger';
import { showSnackbar } from '../elements/snackbar';
import { removeAssistantBtn } from '../assistant-button/helper/removeAssistantBtn';
import { watchEmailTableContainerClick } from '../assistant-button/helper/watchEmailTableContainerClick';
import { embedAssistantBtn } from '../assistant-button';
import { onURLChange } from '../../utils/onURLChange';

const tabs = ['About', 'Newsletter', 'Unsubscribed', 'Whitelisted', 'Advance Search'] as const;

export type Tabs = (typeof tabs)[number];

type Props = {
  appStatus: boolean;
  isTokenValid: boolean;
};

const AppModal = ({ appStatus, isTokenValid }: Props) => {
  //
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppEnabled, setIsAppEnabled] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const [activeTab, setActiveTab] = useState<Tabs>('About');

  // listen to events from  background
  chrome.runtime.onMessage.addListener(
    asyncMessageHandler<IMessageBody, boolean | string>(async request => {
      switch (request.event) {
        // userToken missing or invalid, logout user from fresh-inbox
        case IMessageEvent.LOGOUT_USER: {
          showSnackbar<true>({
            isError: true,
            title: 'Sign in required.',
          });
          setIsAuthed(false);

          if (isAppEnabled) setIsModalOpen(true);
          removeAssistantBtn();

          return true;
        }

        // fresh-inbox api limit reached - show error snackbar
        case IMessageEvent.API_LIMIT_REACHED: {
          showSnackbar<true>({
            isError: true,
            title: 'API limit has exceeded, reach out to the developer.',
          });
          return true;
        }

        // some unhandled error from the background - show error snackbar
        case IMessageEvent.BACKGROUND_ERROR: {
          showSnackbar<true>({
            isError: true,
            title: 'Something went wrong in the background. \n Please reload the page.',
          });
          return true;
        }

        default: {
          logger.info(`Received unknown event in content script: ${request.event}`);
          return 'Unknown event.';
        }
      }
    })
  );

  // set state from params
  useEffect(() => {
    setIsAppEnabled(appStatus);
  }, [appStatus]);

  // set state from params
  useEffect(() => {
    setIsAuthed(isTokenValid);
  }, [isTokenValid]);

  useEffect(() => {
    (async () => {
      if (isAuthed) {
        // watch for container change:
        // check if inbox or a single email view and re-embed assistant button accordingly
        await watchEmailTableContainerClick(async () => {
          // re-embed assistant button
          await embedAssistantBtn();
        });

        // watch url change:
        // re-embed assistant button on url changes (if url supported)
        onURLChange(async () => {
          // re-embed assistant button
          await embedAssistantBtn();
        });
      }
    })();
  }, [isAuthed]);

  // open modal by default if the app is enabled and user is not authed
  useEffect(() => {
    if (isAppEnabled && !isAuthed) {
      setIsModalOpen(true);
    }
  }, [isAppEnabled, isAuthed]);

  // handle open modal
  const handleOpenSettings = () => {
    setIsModalOpen(true);
  };

  // handle close modal, reset tab state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveTab('About');
  };

  // after app has been disabled
  const onDisableApp = () => {
    setIsModalOpen(false);
    setIsAuthed(false);
    setIsAppEnabled(false);
  };

  // renders current active tab based on tab state
  const renderActiveTab = (currentTab: Tabs) => {
    switch (currentTab) {
      case 'Newsletter':
        return <Newsletter />;
      case 'Unsubscribed':
        return <Unsubscribed />;
      case 'Whitelisted':
        return <Whitelisted />;
      case 'Advance Search':
        return <AdvanceSearch />;
      default:
        return <About onAppDisable={onDisableApp} />;
    }
  };

  return (
    <>
      <Tooltip label={isAppEnabled ? 'FreshInbox is active' : 'FreshInbox is inactive'}>
        <button
          className={` bg-transparent py-1.5 px-2 rounded text-sm  flex items-center justify-center cursor-pointer appearance-none outline-none border
        border-slate-50  border-opacity-20 hover:border-opacity-50 hover:border-slate-600 focus:border-opacity-50 
        ${isAppEnabled ? ' text-white' : 'text-slate-500 grayscale'}
        `}
          onClick={handleOpenSettings}
        >
          <img
            src={FreshInboxIcon}
            alt='icon'
            className='w-5 h-5 mr-1.5'
            // grayscale (gray) icon if the app is disabled or user is not authed
            style={!isAppEnabled || !isAuthed ? { filter: 'grayscale(100%)' } : {}}
          />{' '}
          Fresh Inbox
        </button>
      </Tooltip>
      {/* Modal */}
      {isModalOpen ? (
        <div className='fixed top-0 left-0 w-screen h-screen flex items-center justify-center'>
          {/* backdrop */}
          <div
            className='absolute w-full h-full bg-slate-800 bg-opacity-70 transition-opacity z-10'
            onClick={handleCloseModal}
          ></div>
          {/* modal card */}
          <div className='w-[65rem] h-[40rem] rounded-md shadow-lg z-50 shadow-slate-600 bg-slate-100'>
            {isAuthed ? (
              <Tabs tabs={[...tabs]} activeTab={activeTab} setActiveTab={setActiveTab}>
                {renderActiveTab(activeTab)}
                </Tabs>
              ) : (
                <AuthCard
                  isAppEnabled={isAppEnabled}
                  onClose={isSuccess => {
                    setIsModalOpen(false);
                    if (isSuccess) {
                      setIsAppEnabled(true);
                      setIsAuthed(true);
                    }
                  }}
                />
              )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AppModal;
