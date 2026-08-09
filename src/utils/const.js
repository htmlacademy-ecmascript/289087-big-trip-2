const BLANK_EVENT = {
  destination: null,
  type: 'flight',
  offers: [],
  dateFrom: null,
  dateTo: null,
  price: 0,
  isFavorite: false
};

const EVENT_TYPES = [
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

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past'
};

const SortType = {
  DEFAULT: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFERS: 'offers'
};

const UserAction = {
  UPDATE_EVENT: 'UPDATE_EVENT',
  ADD_EVENT: 'ADD_EVENT',
  DELETE_EVENT: 'DELETE_EVENT'
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT'
};

const LoadingStatus = {
  LOADING: 'LOADING',
  FAILURE: 'FAILURE',
  READY: 'READY'
};

export { BLANK_EVENT, EVENT_TYPES, FilterType, SortType, UserAction, UpdateType, LoadingStatus };
