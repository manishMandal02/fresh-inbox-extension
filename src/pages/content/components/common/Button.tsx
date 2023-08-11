type Props = {
  disabled?: boolean;
};

const Button = ({ disabled }: Props) => {
  if (disabled) {
    return <p>Hi</p>;
  }
  return <button className=''>{disabled ? 'Button' : 'test'}</button>;
};

export default Button;
