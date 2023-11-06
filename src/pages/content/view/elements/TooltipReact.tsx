type Props = {
  label: string;
  children: React.ReactNode;
};

const Tooltip = ({ label, children }: Props) => {
  return (
    <div className='group inline-block relative '>
      {children}
      {/* label initially hidden, then shown on hover */}
      {label ? (
        <div className=' absolute -top-[110%] -right-full transform -translate-x-full whitespace-nowrap hidden  scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white leading-3 group-hover:block group-hover:scale-100'>
          {label}
        </div>
      ) : null}
    </div>
  );
};

export default Tooltip;
