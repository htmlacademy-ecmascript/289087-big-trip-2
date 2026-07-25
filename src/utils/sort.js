import dayjs from 'dayjs';

const getDuration = ({ dateFrom, dateTo }) =>
  dayjs(dateTo).diff(dateFrom, 'minute');

export const compareByDate = (a, b) =>
  dayjs(a.dateFrom).diff(b.dateFrom);

export const compareByTime = (a, b) =>
  getDuration(b) - getDuration(a);

export const compareByPrice = (a, b) =>
  b.price - a.price;
