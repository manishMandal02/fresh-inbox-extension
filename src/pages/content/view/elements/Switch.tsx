type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

const Switch = ({ value, onChange }: Props) => {
  return (
    <>
      <div
        className={`relative w-10 h-5 rounded-xl mx-1.5 bg-slate-500  z-10 cursor-pointer transition-all duration-300`}
        style={{
          backgroundColor: value ? '#10b981' : '#9e9d9d',
        }}
        onClick={() => onChange(!value)}
      >
        <span
          className='absolute bottom-[10%]  rounded-[50%] left-0 w-[40%] h-[80%] transition-all duration-300 z-20 bg-white'
          style={{
            transform: `translateX(${value ? '130%' : '20%'})`,
          }}
        ></span>
      </div>
    </>
  );
};

export default Switch;
