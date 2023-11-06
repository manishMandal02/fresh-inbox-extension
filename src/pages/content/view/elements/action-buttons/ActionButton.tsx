import Tooltip from '../TooltipReact';
import { ActionIcons } from './ActionIcons';
import { EmailAction } from '@src/pages/content/types/content.types';

type Props = {
  action: EmailAction;
  tooltipLabel: string;
  onClick: () => void;
  isDisabled?: boolean;
};

const ActionButton = ({ action, tooltipLabel, onClick, isDisabled }: Props) => {
  // render icon based on actions
  const renderIcon = () => {
    // get icon/icons based on
    const icons = ActionIcons[action];

    // render svg icons
    return icons.map(icon => icon);
  };
  return (
    <>
      <Tooltip label={!isDisabled ? tooltipLabel : ''}>
        <button
          className='z-[100] text-sm border-none bg-slate-100 rounded-md cursor-pointer transition-all duration-200 disabled:grayscale py-1 px-1.5 disabled:cursor-default'
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
          }}
          onClick={onClick}
          disabled={isDisabled}
        >
          <div
            className={`${
              action !== EmailAction.unsubscribeAndDeeAllMails ? 'w-5' : 'w-12'
            } h-5 py-px flex items-center justify-center z-60 transition-all  duration-200
            ${isDisabled && 'opacity-20 '}
            `}
            
          >
            {renderIcon()}
          </div>
        </button>
      </Tooltip>
    </>
  );
};

export default ActionButton;
