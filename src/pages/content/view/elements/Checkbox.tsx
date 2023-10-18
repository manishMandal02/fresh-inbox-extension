type Props = {
  isChecked?: boolean;
  onChange: (value: boolean) => void;
};

export const Checkbox = ({ isChecked = false, onChange }: Props) => {
  return (
    <>
      <input
        type='checkbox'
        className={`before:content[''] peer relative h-3.5 w-3.5 cursor-pointer appearance-none rounded-[.3rem] border border-slate-400 transition-all
         before:absolute before:top-2/4 before:left-2/4 before:block before:h-8 before:w-8 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full
        before:bg-slate-700 before:opacity-0 before:transition-opacity checked:border-brand-primary checked:bg-brand-primary p-2 checked:before:bg-brand-primary hover:before:opacity-10
        
        `}
        id='checkbox'
        checked={isChecked}
        onChange={ev => onChange(ev.target.checked)}
      />
    </>
  );
};
