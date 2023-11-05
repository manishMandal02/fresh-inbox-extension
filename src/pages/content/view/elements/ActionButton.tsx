import { EmailAction } from '../../types/content.types';
import Tooltip from './TooltipReact';
import unsubscribeIcon from '../../../../assets/icons/block.svg';
import whitelistIcon from '../../../../assets/icons/whitelist.svg';
import deleteIcon from '../../../../assets/icons/delete.svg';

type Props = {
  action: EmailAction;
  tooltipLabel: string;
  onClick: () => void;
  isDisabled?: boolean;
};

const actionIcon = {
  [EmailAction.unsubscribe]: unsubscribeIcon,
  [EmailAction.deleteAllMails]: deleteIcon,
  [EmailAction.whitelistEmail]: whitelistIcon,
  [EmailAction.resubscribe]: whitelistIcon,
};

const ActionButton = ({ action, tooltipLabel, onClick, isDisabled }: Props) => {
  // render icon based on actions
  const renderIcon = () => {
    // render 2 icons for unsubscribe & delete action
    if (action === EmailAction.unsubscribeAndDeeAllMails) {
      return (
        <>
          <img src={unsubscribeIcon} />
          <img src={deleteIcon} />
        </>
      );
    }
    // render 1 icon for other actions
    return <img src={actionIcon[action]} />;
  };
  return (
    <>
      <Tooltip label={!isDisabled ? tooltipLabel : ''}>
        <button
          className='z-[100] text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer transition-all duration-200 disabled:grayscale  disabled:cursor-default'
          onClick={onClick}
          disabled={isDisabled}
        >
          {renderIcon()}
        </button>
      </Tooltip>
    </>
  );
};

export default ActionButton;
