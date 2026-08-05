import dayjs from 'dayjs';

const getDuration = ({ dateFrom, dateTo }) =>
  dayjs(dateTo).diff(dateFrom, 'minute');

export const sortByDate = (a, b) =>
  dayjs(a.dateFrom).diff(b.dateFrom);

export const sortByTime = (a, b) =>
  getDuration(b) - getDuration(a);

export const sortByPrice = (a, b) =>
  b.price - a.price;
