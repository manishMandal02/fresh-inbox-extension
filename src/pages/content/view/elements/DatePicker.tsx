import type { Dispatch, SetStateAction } from 'react';

type Props = {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
};
const DatePicker = ({ value, onChange }: Props) => {
  return (
    <div className=''>
      <input
        type='date'
        value={value}
        onChange={value => onChange(value.currentTarget.value)}
        className='py-[3px] px-[6px] rounded border-none text-slate-700 shadow-sm shadow-slate-300'
      />
    </div>
  );
};

export default DatePicker;
