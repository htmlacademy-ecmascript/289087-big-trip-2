import dayjs from 'dayjs';

const getDuration = ({ dateFrom, dateTo }) =>
  dayjs(dateTo).diff(dateFrom, 'minute');

const sortByDate = (a, b) =>
  dayjs(a.dateFrom).diff(b.dateFrom);

const sortByTime = (a, b) =>
  getDuration(b) - getDuration(a);

const sortByPrice = (a, b) =>
  b.price - a.price;

export { sortByDate, sortByTime, sortByPrice };
