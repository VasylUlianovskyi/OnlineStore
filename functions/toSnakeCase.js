export default function (str = '') {
    const strArr = str.split(' ');
    const snakeArr = strArr.reduce((acc, val) => {
      return acc.concat(val.toLowerCase());
    }, []);
    return snakeArr.join('_');
  }
  