import dayjs from 'dayjs';
import { FilterType } from './const.js';

const isFuture = (event) => dayjs(event.dateFrom).isAfter(dayjs());
const isPresent = (event) =>
  dayjs(event.dateFrom).isBefore(dayjs()) &&
  dayjs(event.dateTo).isAfter(dayjs());
const isPast = (event) => dayjs(event.dateTo).isBefore(dayjs());

export const filter = {
  [FilterType.EVERYTHING]: (events) => events,
  [FilterType.FUTURE]: (events) => events.filter(isFuture),
  [FilterType.PRESENT]: (events) => events.filter(isPresent),
  [FilterType.PAST]: (events) => events.filter(isPast),
};
