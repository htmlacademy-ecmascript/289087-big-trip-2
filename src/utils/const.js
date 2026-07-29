export const BLANK_EVENT = {
  destination: null,
  type: 'flight',
  offers: [],
  dateFrom: null,
  dateTo: null,
  price: 0,
  isFavorite: false
};

export const EVENT_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant'
];

export const DESTINATIONS = [
  'Amsterdam',
  'Chamonix',
  'Geneva',
  'Paris',
  'Zurich',
  'London',
  'Stuttgart'
];

export const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export const SortType = {
  DEFAULT: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFERS: 'offers'
};

export const TripMessages = {
  NO_EVENTS: 'Click New Event to create your first point',
  NO_PAST_EVENTS: 'There are no past events now',
  NO_PRESENT_EVENTS: 'There are no present events now',
  NO_FUTURE_EVENTS: 'There are no future events now',
};
