type Props = {
  label: string;
  children: React.ReactNode;
  top?: number;
  right?: number;
};

const Tooltip = ({ label, children, top = 110, right = 100 }: Props) => {
  return (
    <div className='group inline-block relative '>
      {children}
      {/* label initially hidden, then shown on hover */}
      {label ? (
        <div
          className={`absolute  transform -translate-x-full whitespace-nowrap hidden  scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white leading-3 group-hover:block group-hover:scale-100`}
          style={{
            top: `-${top}%`,
            right: `-${right}%`,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

export default Tooltip;
