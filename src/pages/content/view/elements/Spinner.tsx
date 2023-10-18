type Props = {
  size: 'sm' | 'md' | 'lg';
};

export const Spinner = ({ size }: Props) => {
  const getSize = () => {
    return size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12';
  };
  const getBorderSize = () => {
    return size === 'sm' ? 'border-3' : size === 'md' ? 'border-4' : 'border-5';
  };

  return (
    <div className='flex w-full h-full items-center justify-center'>
      <div
        className={`${getSize()} ${getBorderSize()}
        border-gray-300
        border-t-brand-primary animate-spin rounded-full `}
      />
    </div>
  );
};
