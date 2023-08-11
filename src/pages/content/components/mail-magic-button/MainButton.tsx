import { MouseEventHandler } from 'react';

type Props = {
  onMouseOver: () => void;
  onMouseOut: () => void;
};

const MainButton = ({ onMouseOver, onMouseOut }: Props) => {
  // stops propagation to parent elements
  const handleOnClick: MouseEventHandler = ev => {
    ev.stopPropagation();
  };
  return (
    <>
      <span
        className='mail-magic-button'
        onClick={handleOnClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      ></span>
      ;
    </>
  );
};

export default MainButton;
