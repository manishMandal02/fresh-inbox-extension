const randomId = () => {
  return Math.floor(Math.random() * Date.now()).toString(16);
};

export { randomId };
