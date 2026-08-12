import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { FilterType } from './const.js';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const isFuture = (event) => dayjs(event.dateFrom).isAfter(dayjs());

const isPresent = (event) => {
  const currentTime = dayjs();

  return dayjs(event.dateFrom).isSameOrBefore(currentTime) &&
    dayjs(event.dateTo).isSameOrAfter(currentTime);
};

const isPast = (event) => dayjs(event.dateTo).isBefore(dayjs());

const filter = {
  [FilterType.EVERYTHING]: (events) => events,
  [FilterType.FUTURE]: (events) => events.filter(isFuture),
  [FilterType.PRESENT]: (events) => events.filter(isPresent),
  [FilterType.PAST]: (events) => events.filter(isPast),
};

export { filter };
