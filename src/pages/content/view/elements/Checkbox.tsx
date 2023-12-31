type Props = {
  isChecked?: boolean;
  onChange: (value: boolean) => void;
  id?: string;
};

export const Checkbox = ({ isChecked = false, onChange, id = 'checkbox' }: Props) => {
  return (
    <>
      <input
        type='checkbox'
        className={` h-3.5 w-3.5 cursor-pointer appearance-none rounded-[.3rem] border bg-slate-300  border-slate-500 transition-all 
        checked:border-brand-primary checked:bg-brand-primary p-[.575rem]
        `}
        id={id}
        checked={isChecked}
        onChange={ev => onChange(ev.target.checked)}
      />
    </>
  );
};
