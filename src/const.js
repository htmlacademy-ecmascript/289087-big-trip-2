export const BLANK_EVENT = {
  destination: '',
  type: 'flight',
  offers: [],
  startTime: new Date(),
  finishTime: new Date(),
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
