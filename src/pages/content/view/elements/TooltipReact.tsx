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
        <div
          className={`absolute top-0 w-fit h-fit whitespace-nowrap hidden   transition-all rounded bg-gray-800 p-2 text-xs text-white leading-3 group-hover:block `}
          style={{
            transform: `translate(-40%, -120%)`,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

export default Tooltip;
