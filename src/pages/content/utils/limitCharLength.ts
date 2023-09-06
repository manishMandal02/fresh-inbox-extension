// show ... for char longer than certain length
const limitCharLength = (str: string, length = 30) => {
  if (str.length > length) {
    return str.substring(0, length) + '...';
  } else {
    return str;
  }
};

export { limitCharLength };
