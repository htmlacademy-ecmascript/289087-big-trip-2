import dayjs from 'dayjs';
import { getRandomArrayElement, getRandomInteger, shuffle } from '../utils.js';
import { EVENT_TYPES } from '../const.js';
import { MOCK_DESTINATIONS } from './destinations.js';
import { MOCK_OFFERS } from './offers.js';

const MAX_DAYS_GAP = 10;
const MAX_DURATION_HOURS = 48;
const MAX_DURATION_MINUTES = 60;
const MAX_PRICE = 1000;

const getRandomStartDate = () => {
  const daysGap = getRandomInteger(0, MAX_DAYS_GAP);

  return dayjs().add(daysGap, 'day').toDate();
};

const getRandomEndDate = (startDate) =>
  dayjs(startDate)
    .add(getRandomInteger(0, MAX_DURATION_HOURS), 'hours')
    .add(getRandomInteger(0, MAX_DURATION_MINUTES), 'minutes')
    .toDate();

const offersByType = new Map(
  MOCK_OFFERS.map(({ type, offers }) => [
    type,
    offers.map(({ id }) => id),
  ])
);

const getRandomOfferIds = (type) =>
  shuffle(offersByType.get(type)).slice(
    0,
    getRandomInteger(1, offersByType.get(type).length)
  );

const getRandomDestinationId = () => getRandomArrayElement(MOCK_DESTINATIONS).id;
const getRandomType = () => getRandomArrayElement(EVENT_TYPES);

const generateId = () => Math.random().toString(16).slice(2);

export const createMockEvent = () => {
  const type = getRandomType();
  const startTime = getRandomStartDate();
  const finishTime = getRandomEndDate(startTime);

  return {
    id: generateId(),
    destination: getRandomDestinationId(), // string
    type,
    offers: getRandomOfferIds(type), // [string]
    isFavorite: !!getRandomInteger(0, 1),
    startTime, // string
    finishTime, // string
    price: getRandomInteger(0, MAX_PRICE)
  };
};
