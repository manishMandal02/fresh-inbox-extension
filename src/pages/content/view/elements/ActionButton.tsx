import Tooltip from './TooltipReact';

type Props = {
  text: string;
  tooltipLabel: string;
  onClick: () => void;
  isDisabled?: boolean;
};

const ActionButton = ({ text, tooltipLabel, onClick, isDisabled }: Props) => {
  return (
    <>
      <Tooltip label={!isDisabled ? tooltipLabel : ''}>
        <button
          className='z-[100] text-sm border border-slate-300 rounded-md px-1.5 py-px cursor-pointer transition-all duration-200 disabled:grayscale  disabled:cursor-default'
          onClick={onClick}
          disabled={isDisabled}
        >
          {text}
        </button>
      </Tooltip>
    </>
  );
};

export default ActionButton;
